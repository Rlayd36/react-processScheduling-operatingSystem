export function RRSchedule(processes, cores, quantum) {
  const activeCores = cores
    .map((core, index) => ({
      ...core,
      id: index,
      availableAt: 0,
      hasStarted: false,
    }))
    .filter((core) => core.power === "on");

  if (activeCores.length === 0 || processes.length === 0) {
    return {
      result: [],
      scheduleLog: [],
      totalEnergy: 0,
      avgNTT: 0,
      readyQueueLog: {},
    };
  }

  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });

  const result = [];
  const scheduleLog = activeCores.map((core) => ({
    coreId: core.id,
    blocks: [],
  }));

  const remainingTimeMap = {};
  const workedTimeMap = {};
  let readyQueue = [];
  let delayedQueue = [];
  let time = 0;
  let procIndex = 0;
  let totalEnergy = 0;
  const readyQueueLog = {}; // 레디 큐 로그

  sortedProcesses.forEach((p) => {
    remainingTimeMap[p.id] = p.burstTime;
    workedTimeMap[p.id] = 0;
  });

  while (result.length < sortedProcesses.length) {
    while (
      procIndex < sortedProcesses.length &&
      sortedProcesses[procIndex].arrivalTime <= time
    ) {
      readyQueue.push({ ...sortedProcesses[procIndex] });
      procIndex++;
    }

    for (let i = delayedQueue.length - 1; i >= 0; i--) {
      const entry = delayedQueue[i];
      if (entry.availableAt <= time) {
        readyQueue.push(entry.proc);
        delayedQueue.splice(i, 1);
      }
    }

    readyQueueLog[time] = readyQueue.map((p) => p.id); // 현재 레디 큐 값 저장

    const freeCores = activeCores
      .filter((core) => core.availableAt <= time)
      .sort((a, b) => a.id - b.id);

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

      scheduleLog
        .find((g) => g.coreId === core.id)
        .blocks.push({ pid: proc.id, start, end });

      core.availableAt = end;
      core.hasStarted = true;
      totalEnergy += startup + power * workTime;

      remainingTimeMap[proc.id] -= actualWork;
      workedTimeMap[proc.id] += workTime;

      if (remainingTimeMap[proc.id] > 0) {
        delayedQueue.push({ proc, availableAt: end });
      } else {
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

    time++;
  }

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
    readyQueueLog, // 레디 큐 로그 리턴
  };
}
