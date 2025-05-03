import React from "react";
import "./ResultTable.css";

function ResultTable({ resultData, totalEnergy, avgNTT }) {
  if (!resultData || resultData.length === 0) {
    return <div className="result-table">No results to display.</div>;
  }

  return (
    <div className="result-table">
      <div className="table-header">
        <h2>Result Table</h2>
        <div className="result-summary">
          <span>Total Energy: {totalEnergy.toFixed(2)}W</span>
          <span>Avg NTT: {avgNTT.toFixed(2)}</span>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>Arrival Time</th>
              <th>Burst Time</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Turnaround Time (TT)</th>
              <th>Waiting Time (WT)</th>
              <th>Normalized TT (NTT)</th>
              <th>Core</th>
            </tr>
          </thead>
          <tbody>
            {resultData.map((proc, i) => (
              <tr key={i}>
                <td>{proc.pid}</td>
                <td>{proc.arrivalTime}</td>
                <td>{proc.burstTime}</td>
                <td>{proc.startTime}</td>
                <td>{proc.endTime}</td>
                <td>{proc.turnaroundTime}</td>
                <td>{proc.waitingTime}</td>
                <td>{proc.normalizedTT.toFixed(2)}</td>
                <td>{proc.coreId + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultTable;
