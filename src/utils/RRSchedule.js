export function RRSchedule(processes, cores, quantum) {
  // 코어 설정
  const activeCores = cores
    .map((core, index) => ({
      ...core,
      id: index,
      availableAt: 0,
      hasStarted: false,
    }))
    .filter((core) => core.power === "on");

  // 예외 처리
  if (activeCores.length === 0 || processes.length === 0) {
    return {
      result: [],
      scheduleLog: [],
      totalEnergy: 0,
      avgNTT: 0,
    };
  }

  // 프로세스를 도착시간 기준 정렬
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });

  // 초기 변수
  const result = [];
  const scheduleLog = activeCores.map((core) => ({
    coreId: core.id,
    blocks: [],
  }));

  const remainingTimeMap = {}; // 남은 일의 양
  const workedTimeMap = {}; // 실제 실행 시간 누적
  let readyQueue = [];
  let delayedQueue = []; // 다시 실행 대기 중인 프로세스
  let time = 0;
  let procIndex = 0;
  let totalEnergy = 0;

  // 초기화
  sortedProcesses.forEach((p) => {
    remainingTimeMap[p.id] = p.burstTime;
    workedTimeMap[p.id] = 0;
  });

  // 스케줄링 루프
  while (result.length < sortedProcesses.length) {
    // 도착한 프로세스를 readyQueue에 추가
    while (
      procIndex < sortedProcesses.length &&
      sortedProcesses[procIndex].arrivalTime <= time
    ) {
      readyQueue.push({ ...sortedProcesses[procIndex] });
      procIndex++;
    }

    // delayedQueue → readyQueue로 복귀
    for (let i = delayedQueue.length - 1; i >= 0; i--) {
      const entry = delayedQueue[i];
      if (entry.availableAt <= time) {
        readyQueue.push(entry.proc);
        delayedQueue.splice(i, 1);
      }
    }

    // 사용 가능한 코어 추출 (ID 순)
    const freeCores = activeCores
      .filter((core) => core.availableAt <= time)
      .sort((a, b) => a.id - b.id);

    // 코어 수만큼 프로세스를 할당
    const assigned = readyQueue.splice(0, freeCores.length);

    for (let i = 0; i < assigned.length; i++) {
      const proc = assigned[i];
      const core = freeCores[i];

      const speed = core.type === "P-Core" ? 2 : 1;
      const power = core.type === "P-Core" ? 3 : 1;
      const startup = core.hasStarted ? 0 : core.type === "P-Core" ? 0.5 : 0.1;

      const remaining = remainingTimeMap[proc.id];
      const maxWork = speed * quantum;
      const actualWork = Math.min(remaining, maxWork);
      const workTime = Math.ceil(actualWork / speed);
      const start = Math.max(core.availableAt, time);
      const end = start + workTime;

      // Gantt chart 로그
      scheduleLog
        .find((g) => g.coreId === core.id)
        .blocks.push({ pid: proc.id, start, end });

      // 코어 상태 및 에너지 계산
      core.availableAt = end;
      core.hasStarted = true;
      totalEnergy += startup + power * workTime;

      // 작업량/시간 갱신
      remainingTimeMap[proc.id] -= actualWork;
      workedTimeMap[proc.id] += workTime;

      if (remainingTimeMap[proc.id] > 0) {
        // 아직 남은 작업 → delayedQueue로 이동
        delayedQueue.push({ proc, availableAt: end });
      } else {
        // 완료된 프로세스 결과 저장
        const turnaroundTime = end - proc.arrivalTime;
        const waitingTime = turnaroundTime - workedTimeMap[proc.id];

        result.push({
          pid: proc.id,
          arrivalTime: proc.arrivalTime,
          burstTime: proc.burstTime,
          startTime: proc.arrivalTime,
          endTime: end,
          turnaroundTime,
          waitingTime,
          normalizedTT: Number((turnaroundTime / proc.burstTime).toFixed(2)),
          coreId: core.id,
        });
      }
    }

    // 시간 진행
    time++;
  }

  // 평균 Normalized Turnaround Time 계산
  const avgNTT = Number(
    (
      result.reduce((sum, r) => sum + r.normalizedTT, 0) / result.length
    ).toFixed(2)
  );

  return {
    result,
    scheduleLog,
    totalEnergy,
    avgNTT,
  };
}
