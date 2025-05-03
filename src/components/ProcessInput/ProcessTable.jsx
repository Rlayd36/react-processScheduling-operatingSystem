import React, { useEffect, useRef } from "react";
import "./ProcessTable.css";

function ProcessTable({ processes }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [processes]); // processes가 변경될 때마다 실행됨

  return (
    <div className="process-table">
      <div className="table-header">
        <h2>프로세스 목록</h2>
        <span className="process-count">총 {processes.length}개</span>
      </div>
      <div className="table-scroll" ref={scrollRef}>
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>Arrival Time</th>
              <th>Burst Time (BT)</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, index) => (
              <tr key={index}>
                <td>{p.id}</td>
                <td>{p.arrivalTime}</td>
                <td>{p.burstTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProcessTable;
