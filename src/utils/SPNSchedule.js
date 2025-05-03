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

  // 2) 활성 코어 설정 (id, busyUntil, isBusy, hasStarted)
  const activeCores = cores
    .map((c, i) => ({
      ...c,
      id: i,
      isBusy: false,
      busyUntil: 0,
      hasStarted: false,
    }))
    .filter((c) => c.power === "on");

  // 3) Gantt 차트용 로그 초기화
  const scheduleLog = activeCores.map((c) => ({
    coreId: c.id,
    blocks: [],
  }));

  // 4) 시뮬레이션 변수
  let time = 0;
  let totalEnergy = 0;
  const completed = [];

  // 5) time 기반 루프
  while (completed.length < procs.length) {
    // (a) readyQueue: 도착 & 미완료 프로세스 전부
    const readyQueue = procs
      .filter(
        (p) =>
          p.arrivalTime <= time && p.remaining > 0 && !completed.includes(p)
      )
      .sort((a, b) => a.remaining - b.remaining);

    // (b) 모든 idle 코어에 동시에 SPN 할당
    for (const core of activeCores) {
      if (!core.isBusy && readyQueue.length > 0) {
        const p = readyQueue.shift();
        core.isBusy = true;
        core.busyUntil = time + p.remaining;
        if (p.startTime < 0) p.startTime = time;

        // Gantt 블록 기록
        const log = scheduleLog.find((l) => l.coreId === core.id);
        log.blocks.push({ pid: p.id, start: time, end: core.busyUntil });

        // 전력 계산: P-Core=3W, E-Core=1W, + startup
        const powerRate = core.type === "P-Core" ? 3 : 1;
        if (!core.hasStarted) {
          totalEnergy += core.type === "P-Core" ? 0.5 : 0.1;
          core.hasStarted = true;
        }
        totalEnergy += p.remaining * powerRate;

        // 프로세스 종료 시각 기록
        p.remaining = 0;
        p.endTime = core.busyUntil;
      }
    }

    // (c) 다음 이벤트(다음 도착 또는 코어 완료)까지 time 점프
    let nextTime = Infinity;
    // 프로세스 도착
    for (const p of procs) {
      if (p.arrivalTime > time) nextTime = Math.min(nextTime, p.arrivalTime);
    }
    // 코어 완료
    for (const core of activeCores) {
      if (core.isBusy && core.busyUntil > time) {
        nextTime = Math.min(nextTime, core.busyUntil);
      }
    }
    if (nextTime === Infinity) break;
    time = nextTime;

    // (d) time 이동한 시점에 완료된 프로세스를 코어에서 해제
    for (const core of activeCores) {
      if (core.isBusy && core.busyUntil === time) {
        core.isBusy = false;
        // endTime 이 현재 time 인 프로세스를 completed 에 추가
        const done = procs.find((p) => p.endTime === time);
        if (done && !completed.includes(done)) {
          completed.push(done);
        }
      }
    }
  }

  // 6) 결과(result) 조립
  const result = procs.map((p) => {
    const tt = p.endTime - p.arrivalTime;
    const wt = p.startTime - p.arrivalTime;
    const ntt = parseFloat((tt / p.burstTime).toFixed(2));
    // 할당된 coreId 찾기
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
  console.log(result, scheduleLog, totalEnergy, avgNTT);
  return { result, scheduleLog, totalEnergy, avgNTT };
}
