export function SRTNSchedule(processes, cores) {
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
      currentProcess: null,
      remainingBurst: 0,
      hasStarted: false,
    }))
    .filter((core) => core.power === "on");

  if (activeCores.length === 0) {
    return {
      result: [],
      scheduleLog: [],
      totalEnergy: 0,
      avgNTT: 0,
      readyQueueLog: {}, // 레디 큐 로그 리턴
    };
  }

  const ganttLogs = activeCores.map((core) => ({
    coreId: core.id,
    blocks: [],
  }));

  const result = [];
  let totalEnergy = 0;
  let currentTime = 0;
  const readyQueue = [];
  const readyQueueLog = {}; // 레디 큐 로그 리턴
  const executionMap = new Map();

  while (
    sortedProcesses.length > 0 ||
    readyQueue.length > 0 ||
    activeCores.some((c) => c.currentProcess)
  ) {
    // 도착한 프로세스를 readyQueue에 넣음
    while (
      sortedProcesses.length > 0 &&
      sortedProcesses[0].arrivalTime <= currentTime
    ) {
      readyQueue.push(sortedProcesses.shift());
    }

    // 준비된 프로세스를 burstTime 기준으로 정렬
    readyQueue.sort((a, b) => a.burstTime - b.burstTime);

    readyQueueLog[currentTime] = readyQueue.map((p) => p.id); // 현재 레디 큐 값 저장

    // 빈 코어에 작업 할당
    for (const core of activeCores) {
      if (!core.currentProcess && readyQueue.length > 0) {
        const nextProc = readyQueue.shift();
        core.currentProcess = nextProc;
        core.remainingBurst = nextProc.burstTime;

        if (!executionMap.has(nextProc.id)) {
          executionMap.set(nextProc.id, {
            pid: nextProc.id,
            startTime: currentTime,
            coreId: core.id,
          });
        }

        if (!core.hasStarted) {
          totalEnergy += core.type === "P-Core" ? 0.5 : 0.1;
          core.hasStarted = true;
        }
      }
    }

    // 1초 동안 각 코어 실행
    for (const core of activeCores) {
      if (core.currentProcess) {
        const speed = core.type === "P-Core" ? 2 : 1;
        const work = Math.min(speed, core.remainingBurst);

        core.remainingBurst -= work;
        totalEnergy += core.type === "P-Core" ? 3 : 1;

        const procId = core.currentProcess.id;
        const log = ganttLogs.find((g) => g.coreId === core.id);
        const lastBlock = log.blocks[log.blocks.length - 1];

        if (lastBlock && lastBlock.pid === procId) {
          lastBlock.end++;
        } else {
          log.blocks.push({
            pid: procId,
            start: currentTime,
            end: currentTime + 1,
          });
        }

        if (core.remainingBurst <= 0) {
          const exec = executionMap.get(procId);
          const endTime = currentTime + 1;
          const turnaroundTime = endTime - core.currentProcess.arrivalTime;
          const waitingTime = exec.startTime - core.currentProcess.arrivalTime;
          const duration = Math.ceil(core.currentProcess.burstTime / speed);
          const normalizedTT = Number((turnaroundTime / duration).toFixed(2));

          result.push({
            pid: procId,
            arrivalTime: core.currentProcess.arrivalTime,
            burstTime: core.currentProcess.burstTime,
            startTime: exec.startTime,
            endTime,
            turnaroundTime,
            waitingTime,
            normalizedTT,
            coreId: exec.coreId,
          });

          core.currentProcess = null;
        }
      }
    }

    // 시간 이동
    if (
      activeCores.every((c) => !c.currentProcess) &&
      readyQueue.length === 0 &&
      sortedProcesses.length > 0
    ) {
      currentTime = sortedProcesses[0].arrivalTime;
    } else {
      currentTime++;
    }
  }

  const avgNTT = Number(
    (
      result.reduce((sum, r) => sum + r.normalizedTT, 0) / result.length
    ).toFixed(2)
  );

  return {
    result,
    scheduleLog: ganttLogs,
    totalEnergy: Number(totalEnergy.toFixed(2)),
    avgNTT,
    readyQueueLog, // 레디 큐 로그 리턴
  };
}
