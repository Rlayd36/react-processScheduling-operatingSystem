import React from "react";
import "./GanttChart.css";

function GanttChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="gantt-chart">No schedule to display.</div>;
  }

  const TIME_UNIT_WIDTH = 40;
  //  const LABEL_WIDTH = 70;

  const maxTime = Math.max(
    ...data.flatMap((core) => core.blocks.map((b) => b.end))
  );

  const chartWidth = maxTime * TIME_UNIT_WIDTH;

  // ✅ 고대비 고정 팔레트
  const COLORS = [
    "#c62828", // 진한 빨강 (Dark Red)
    "#2e7d32", // 진한 초록 (Dark Green)
    "#f9a825", // 머스타드 옐로우 (Golden Yellow)
    "#283593", // 진한 파랑 (Dark Blue)
    "#ef6c00", // 브라이트 오렌지 (Deep Orange)
    "#6a1b9a", // 진한 보라 (Dark Purple)
    "#00838f", // 진한 청록 (Teal)
    "#ad1457", // 진한 핑크 (Deep Pink)
    "#9e9d24", // 어두운 라임 (Olive Lime)
    "#d81b60", // 루비 핑크 (Ruby Pink)
    "#00695c", // 어두운 시안 (Cyan Teal)
    "#8e24aa", // 퍼플 (Mid Purple)
    "#5d4037", // 짙은 갈색 (Deep Brown)
    "#fdd835", // 선명한 노랑 (Sharp Yellow)
    "#4e342e", // 초콜릿색 (Dark Chocolate)
    "#558b2f", // 카키톤 연두 (Khaki Green)
    "#827717", // 진한 올리브 (Dark Olive)
    "#f57f17", // 오렌지 브라운 (Orange-Brown)
    "#1a237e", // 딥 네이비 (Deep Navy)
    "#424242", // 중간 회색 (Medium Gray)
  ];

  const getColorByPid = (pid) => {
    let hash = 0;
    for (let i = 0; i < pid.length; i++) {
      hash = pid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  };

  return (
    <div className="gantt-chart">
      <h3 className="gantt-title">Gantt Chart</h3>

      {data.map((core, i) => (
        <div key={i} className="core-row">
          <div className="core-label">Core {core.coreId + 1}</div>
          <div className="core-bar" style={{ width: `${chartWidth}px` }}>
            {core.blocks.map((block, j) => (
              <div
                key={j}
                className="gantt-block"
                style={{
                  left: `${block.start * TIME_UNIT_WIDTH}px`,
                  width: `${(block.end - block.start) * TIME_UNIT_WIDTH}px`,
                  backgroundColor: getColorByPid(block.pid),
                }}
              >
                {block.pid}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="time-grid-wrapper">
        <div className="time-grid" style={{ width: `${chartWidth}px` }}>
          {Array.from({ length: maxTime + 1 }, (_, i) => (
            <div key={i} className="time-tick">
              {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GanttChart;
