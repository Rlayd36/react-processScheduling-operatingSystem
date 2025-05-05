import React, { useRef, useEffect } from "react";
import "./GanttChart.css";

function GanttChart({ data, currentTime, processes }) {
  const TIME_UNIT_WIDTH = 40;
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth;
    }
  }, [currentTime]);

  const visibleLog = data.filter((block) => block.start <= currentTime);
  const chartWidth = currentTime * TIME_UNIT_WIDTH;

  const COLORS = [
    "#c62828", // 진한 빨강 (Red - 강렬한 다크 레드)
    "#2e7d32", // 짙은 초록 (Green - 진한 숲색)
    "#f9a825", // 밝은 노랑 (Yellow - 골든 앰버)
    "#283593", // 파랑보라 (Indigo - 딥 인디고 블루)
    "#ef6c00", // 주황 (Orange - 선명한 오렌지)
    "#6a1b9a", // 진한 보라 (Purple - 다크 바이올렛)
    "#00838f", // 청록 (Teal - 다크 시안/블루그린)
    "#ad1457", // 자홍 (Pink - 짙은 핑크/마젠타)
    "#9e9d24", // 카키 노랑 (Olive Yellow - 어두운 올리브)
    "#d81b60", // 진한 자홍 (Hot Pink - 짙은 마젠타)
    "#00695c", // 딥 청록 (Dark Teal - 어두운 에메랄드)
    "#8e24aa", // 보라 (Purple - 선명한 보라)
    "#5d4037", // 갈색 (Brown - 다크 초콜릿)
    "#fdd835", // 노랑 (Yellow - 선명한 레몬 옐로우)
    "#4e342e", // 다크 브라운 (Brown - 초콜릿 브라운)
    "#558b2f", // 올리브 초록 (Olive Green - 짙은 올리브)
    "#827717", // 머스터드 (Mustard - 짙은 노란 올리브)
    "#f57f17", // 오렌지 (Orange - 강한 호박색)
    "#1a237e", // 진한 남색 (Navy - 인디고/네이비)
    "#424242", // 진한 회색 (Gray - 차콜 그레이)
  ];

  const getColorByPid = (pid) => {
    let hash = 0;
    for (let i = 0; i < pid.length; i++) {
      hash = pid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  };

  const coreMap = {};
  for (const block of visibleLog) {
    if (!coreMap[block.coreId]) coreMap[block.coreId] = [];
    coreMap[block.coreId].push(block);
  }
  const coreIds = Object.keys(coreMap).map(Number).sort();

  const runningBlock = data.find(
    (b) => b.start <= currentTime && currentTime < b.end
  );

  const executionTimeMap = {};
  data.forEach((b) => {
    if (b.end <= currentTime) {
      executionTimeMap[b.pid] =
        (executionTimeMap[b.pid] || 0) + (b.end - b.start);
    }
  });

  const readyQueue =
    currentTime === 0
      ? []
      : processes.filter((p) => {
          const executed = executionTimeMap[p.id] || 0;
          const isRunning = runningBlock?.pid === p.id;
          const isFinished = data.some(
            (b) => b.pid === p.id && b.end <= currentTime
          );

          return (
            p.arrivalTime <= currentTime &&
            executed < p.burstTime &&
            !isRunning &&
            !isFinished
          );
        });

  return (
    <div className="gantt-chart" ref={chartRef}>
      <h3 className="gantt-title">Gantt Chart (Time: {currentTime})</h3>

      {coreIds.map((coreId) => (
        <div key={coreId} className="core-row">
          <div className="core-label">Core {coreId + 1}</div>
          <div className="core-bar" style={{ width: `${chartWidth}px` }}>
            {coreMap[coreId].map((block, j) => {
              const visibleWidth =
                Math.max(0, Math.min(currentTime, block.end) - block.start) *
                TIME_UNIT_WIDTH;

              return (
                <div
                  key={j}
                  className="gantt-block"
                  style={{
                    left: `${block.start * TIME_UNIT_WIDTH}px`,
                    width: `${visibleWidth}px`,
                    backgroundColor: getColorByPid(block.pid),
                  }}
                >
                  {block.pid}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="time-grid-wrapper">
        <div className="time-grid" style={{ width: `${chartWidth}px` }}>
          {Array.from({ length: currentTime + 1 }, (_, i) => (
            <div key={i} className="time-tick">
              {i}
            </div>
          ))}
        </div>
      </div>

      <div className="ready-queue">
        <h4>Ready Queue</h4>
        <div className="queue-box">
          {readyQueue.length > 0 ? (
            readyQueue.map((p) => (
              <div key={p.id} className="queue-item">
                {p.id}
              </div>
            ))
          ) : (
            <div className="queue-empty">[empty]</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GanttChart;
