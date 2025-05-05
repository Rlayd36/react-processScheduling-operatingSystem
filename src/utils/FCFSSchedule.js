export function FCFSSchedule(processes, cores) {
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    return a.id.localeCompare(b.id);
  });

  const activeCores = cores
    .map((core, index) => ({
      ...core,
      id: index,
      availableAt: 0,
      hasStarted: false,
    }))
    .filter((core) => core.power === "on");

  if (activeCores.length === 0) {
    return {
      result: [],
      scheduleLog: [],
      totalEnergy: 0,
      avgNTT: 0,
      readyQueueLog: {}, // 레디 큐 로그 리턴 값 추가
    };
  }

  let currentTime = 0;
  const ganttLogs = activeCores.map((core) => ({
    coreId: core.id,
    blocks: [],
  }));

  const result = [];
  let totalEnergy = 0;
  const readyQueueLog = {};
  const remainingProcesses = [...sortedProcesses];
  const waitingList = [];

  // 처리 메인
  while (remainingProcesses.length > 0 || waitingList.length > 0) {
    while (
      remainingProcesses.length > 0 &&
      remainingProcesses[0].arrivalTime <= currentTime
    ) {
      waitingList.push(remainingProcesses.shift());
    }

    readyQueueLog[currentTime] = waitingList.map((p) => p.id); // 현재 큐 배열 상태 저장

    for (const core of activeCores) {
      if (waitingList.length === 0) break;
      if (core.availableAt <= currentTime) {
        const proc = waitingList.shift();
        const { id, arrivalTime, burstTime } = proc;

        const runStart = Math.max(core.availableAt, currentTime);
        const speed = core.type === "P-Core" ? 2 : 1;
        const duration = Math.ceil(burstTime / speed);
        const runEnd = runStart + duration;

        // Gantt
        ganttLogs
          .find((g) => g.coreId === core.id)
          .blocks.push({ pid: id, start: runStart, end: runEnd });

        // Energy
        const runtime = duration;
        const powerPerSec = core.type === "P-Core" ? 3 : 1;
        const startupPower = core.hasStarted
          ? 0
          : core.type === "P-Core"
          ? 0.5
          : 0.1;
        totalEnergy += startupPower + runtime * powerPerSec;
        core.hasStarted = true;

        // Result
        const TT = runEnd - arrivalTime;
        const WT = TT - duration;
        const NTT = Number((TT / duration).toFixed(2));
        result.push({
          pid: id,
          arrivalTime,
          burstTime,
          startTime: runStart,
          endTime: runEnd,
          turnaroundTime: TT,
          waitingTime: WT,
          normalizedTT: NTT,
          coreId: core.id,
        });

        core.availableAt = runEnd;
      }
    }

    currentTime++;
  }

  const avgNTT = Number(
    (
      result.reduce((sum, r) => sum + r.normalizedTT, 0) / result.length
    ).toFixed(2)
  );

  return {
    result,
    scheduleLog: ganttLogs,
    totalEnergy,
    avgNTT,
    readyQueueLog, // 레디 큐 로그 값 리턴
  };
}
