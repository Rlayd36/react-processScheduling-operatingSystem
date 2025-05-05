export function SPNSchedule(processes, cores) {
  // 1) 프로세스 복사+확장 및 도착순 정렬
  const procs = processes
    .map((p) => ({
      ...p,
      remaining: p.burstTime,
      startTime: -1,
      endTime: 0,
    }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  // 2) 활성 코어 설정
  const activeCores = cores
    .map((c, i) => ({
      ...c,
      id: i,
      isBusy: false,
      busyUntil: 0,
      hasStarted: false,
    }))
    .filter((c) => c.power === "on");

  // 3) Gantt 로그 초기화
  const scheduleLog = activeCores.map((c) => ({
    coreId: c.id,
    blocks: [],
  }));

  // 4) 변수
  let time = 0;
  let totalEnergy = 0;
  const completed = [];
  const readyQueueLog = {};

  // 5) 시뮬레이션 루프
  while (completed.length < procs.length) {
    // (a) Ready Queue 구성 및 정렬
    const readyQueue = procs
      .filter(
        (p) =>
          p.arrivalTime <= time && p.remaining > 0 && !completed.includes(p)
      )
      .sort((a, b) => a.remaining - b.remaining);

    readyQueueLog[time] = readyQueue.map((p) => p.id);

    // (b) SPN 할당
    for (const core of activeCores) {
      if (!core.isBusy && readyQueue.length > 0) {
        const p = readyQueue.shift();
        core.isBusy = true;
        core.busyUntil = time + p.remaining;
        if (p.startTime < 0) p.startTime = time;

        const log = scheduleLog.find((l) => l.coreId === core.id);
        log.blocks.push({ pid: p.id, start: time, end: core.busyUntil });

        const powerRate = core.type === "P-Core" ? 3 : 1;
        if (!core.hasStarted) {
          totalEnergy += core.type === "P-Core" ? 0.5 : 0.1;
          core.hasStarted = true;
        }
        totalEnergy += p.remaining * powerRate;

        p.remaining = 0;
        p.endTime = core.busyUntil;
      }
    }

    // (c) 다음 이벤트 시각 계산
    let nextTime = Infinity;
    for (const p of procs) {
      if (p.arrivalTime > time) nextTime = Math.min(nextTime, p.arrivalTime);
    }
    for (const core of activeCores) {
      if (core.isBusy && core.busyUntil > time) {
        nextTime = Math.min(nextTime, core.busyUntil);
      }
    }
    if (nextTime === Infinity) break;
    time = nextTime;

    // (d) 완료된 코어 해제
    for (const core of activeCores) {
      if (core.isBusy && core.busyUntil === time) {
        core.isBusy = false;
        const done = procs.find((p) => p.endTime === time);
        if (done && !completed.includes(done)) {
          completed.push(done);
        }
      }
    }
  }

  // 6) 결과 정리
  const result = procs.map((p) => {
    const tt = p.endTime - p.arrivalTime;
    const wt = p.startTime - p.arrivalTime;
    const ntt = parseFloat((tt / p.burstTime).toFixed(2));
    const coreId = scheduleLog.find((l) =>
      l.blocks.some((b) => b.pid === p.id)
    ).coreId;
    return {
      pid: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      startTime: p.startTime,
      endTime: p.endTime,
      turnaroundTime: tt,
      waitingTime: wt,
      normalizedTT: ntt,
      coreId,
    };
  });

  // 7) 평균 NTT
  const avgNTT = parseFloat(
    (result.reduce((s, r) => s + r.normalizedTT, 0) / result.length).toFixed(2)
  );

  return {
    result,
    scheduleLog,
    totalEnergy,
    avgNTT,
    readyQueueLog,
  };
}
