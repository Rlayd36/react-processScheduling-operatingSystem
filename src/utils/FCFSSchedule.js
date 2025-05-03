export function FCFSSchedule(processes, cores) {
  // 프로세스 정렬 (arrivalTime 기준)
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    return a.id.localeCompare(b.id);
  });

  // on 상태 코어 리스트 뽑기
  const activeCores = cores
    .map((core, index) => ({
      ...core,
      id: index,
      availableAt: 0,
      hasStarted: false,
    }))
    .filter((core) => core.power === "on");

  // activeCores 0일때 빈 거 반환
  if (activeCores.length === 0) {
    return {
      result: [],
      scheduleLog: [],
      totalEnergy: 0,
      avgNTT: 0,
    };
  }

  let currentTime = 0;
  const ganttLogs = activeCores.map((core) => ({
    coreId: core.id,
    blocks: [],
  }));

  const result = [];
  let totalEnergy = 0;

  // 처리 메인
  for (const proc of sortedProcesses) {
    const { id, arrivalTime, burstTime } = proc;

    currentTime = Math.max(currentTime, arrivalTime);

    //어느 코어로 넣을 지 선택
    let bestCore = null;
    let earliestReadyTime = Infinity;

    for (const core of activeCores) {
      const readyAt = Math.max(core.availableAt, currentTime);
      if (
        readyAt < earliestReadyTime ||
        (readyAt === earliestReadyTime && core.id < bestCore?.id)
      ) {
        bestCore = core;
        earliestReadyTime = readyAt;
      }
    }

    // 실제 실행 시작 / 종료 구하기
    const runStart = Math.max(bestCore.availableAt, currentTime);
    const speed = bestCore.type === "P-Core" ? 2 : 1;
    const duration = Math.ceil(burstTime / speed);
    const runEnd = runStart + duration;

    // Gantt chart용 정보
    ganttLogs
      .find((g) => g.coreId === bestCore.id)
      .blocks.push({
        pid: id,
        start: runStart,
        end: runEnd,
      });

    // 전력 계산
    const runtime = duration;
    const powerPerSec = bestCore.type === "P-Core" ? 3 : 1;
    const startupPower = bestCore.hasStarted
      ? 0
      : bestCore.type === "P-Core"
      ? 0.5
      : 0.1;
    totalEnergy += startupPower + runtime * powerPerSec;
    bestCore.hasStarted = true;

    // result data
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
      coreId: bestCore.id,
    });

    bestCore.availableAt = runEnd;
  }

  // Normalized TT
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
  };
}
