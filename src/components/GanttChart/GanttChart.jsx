import React, { useRef, useEffect } from "react";
import "./GanttChart.css";

function GanttChart({ data, currentTime, readyQueueLog }) {
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
    "#c62828",
    "#2e7d32",
    "#f9a825",
    "#283593",
    "#ef6c00",
    "#6a1b9a",
    "#00838f",
    "#ad1457",
    "#9e9d24",
    "#d81b60",
    "#00695c",
    "#8e24aa",
    "#5d4037",
    "#fdd835",
    "#4e342e",
    "#558b2f",
    "#827717",
    "#f57f17",
    "#1a237e",
    "#424242",
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
                    width: `${Math.max(visibleWidth, 1)}px`,
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
          {(readyQueueLog?.[currentTime] ?? []).length > 0 ? (
            readyQueueLog[currentTime].map((pid) => (
              <div key={pid} className="queue-item">
                {pid}
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
