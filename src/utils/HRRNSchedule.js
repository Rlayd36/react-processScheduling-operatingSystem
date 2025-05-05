export function HRRNSchedule(processes, cores) {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const results = [];
  const rawLog = [];
  const readyQueueLog = {}; // 레디 큐 로그 값
  let currentTime = 0;
  let totalEnergy = 0;
  const waitingQueue = [];

  const activeCores = cores
    .map((core, idx) => ({
      ...core,
      id: idx,
      busyUntil: 0,
      hasStarted: false,
    }))
    .filter((core) => core.power === "on");

  if (activeCores.length === 0)
    return {
      result: [],
      totalEnergy: 0,
      scheduleLog: [],
      avgNTT: 0,
      readyQueueLog: {},
    };

  let remaining = [...sorted];

  while (remaining.length > 0 || waitingQueue.length > 0) {
    // 도착한 프로세스 waitingQueue에 추가
    while (remaining.length > 0 && remaining[0].arrivalTime <= currentTime) {
      waitingQueue.push(remaining.shift());
    }

    // HRRN 기준 정렬 (waitingQueue 자체를 정렬)
    waitingQueue.sort((a, b) => {
      const rrA =
        (currentTime - a.arrivalTime + a.burstTime) / (a.burstTime || 1);
      const rrB =
        (currentTime - b.arrivalTime + b.burstTime) / (b.burstTime || 1);
      return rrB - rrA;
    });

    readyQueueLog[currentTime] = waitingQueue.map((p) => p.id);

    const freeCores = activeCores
      .filter((core) => core.busyUntil <= currentTime)
      .sort((a, b) => a.id - b.id);

    for (const core of freeCores) {
      if (waitingQueue.length === 0) break;

      const proc = waitingQueue.shift();
      const { id: pid, arrivalTime, burstTime } = proc;
      const startTime = currentTime;
      const speed = core.type === "P-Core" ? 2 : 1;
      const power = core.type === "P-Core" ? 3 : 1;
      const duration = Math.ceil((burstTime || 1) / speed);
      const endTime = startTime + duration;
      const waitingTime = startTime - arrivalTime;
      const turnaroundTime = endTime - arrivalTime;
      const normalizedTT =
        burstTime > 0 ? parseFloat((turnaroundTime / burstTime).toFixed(2)) : 0;
      const coreId = core.id;

      // 작업 로그 저장
      let remainingBurst = burstTime;
      for (let t = startTime; t < endTime && remainingBurst > 0; t++) {
        const work = Math.min(speed, remainingBurst);
        rawLog.push({ time: t, coreId, pid });
        remainingBurst -= work;
      }

      if (!core.hasStarted) {
        totalEnergy += core.type === "P-Core" ? 0.5 : 0.1;
        core.hasStarted = true;
      }

      totalEnergy += duration * power;
      core.busyUntil = endTime;

      results.push({
        pid,
        arrivalTime,
        burstTime,
        startTime,
        endTime,
        turnaroundTime,
        waitingTime,
        normalizedTT,
        coreId,
      });
    }

    // 다음 시간 계산
    if (waitingQueue.length === 0 || freeCores.length === 0) {
      const nextEventTime = Math.min(
        ...activeCores
          .map((core) => core.busyUntil)
          .filter((t) => t > currentTime),
        ...(remaining.length > 0 ? [remaining[0].arrivalTime] : [])
      );
      currentTime = nextEventTime ?? currentTime + 1;
    }
  }

  // Gantt Chart용 scheduleLog 변환
  const scheduleLog = activeCores.map((core) => {
    const logs = rawLog
      .filter((l) => l.coreId === core.id)
      .sort((a, b) => a.time - b.time);

    const blocks = [];
    for (let i = 0; i < logs.length; i++) {
      const { pid, time } = logs[i];
      if (
        blocks.length > 0 &&
        blocks[blocks.length - 1].pid === pid &&
        blocks[blocks.length - 1].end === time
      ) {
        blocks[blocks.length - 1].end += 1;
      } else {
        blocks.push({ pid, start: time, end: time + 1 });
      }
    }

    return { coreId: core.id, blocks };
  });

  const avgNTT =
    results.reduce((sum, p) => sum + p.normalizedTT, 0) / results.length;

  return {
    result: results,
    scheduleLog,
    totalEnergy: parseFloat(totalEnergy.toFixed(2)),
    avgNTT: parseFloat(avgNTT.toFixed(2)),
    readyQueueLog,
  };
}
