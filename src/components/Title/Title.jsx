import React from "react";
import "./Title.css";

function Title({ algorithm, setAlgorithm, quantum, setQuantum, onRun }) {
  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
  };

  const handleQuantumChange = (e) => {
    setQuantum(e.target.value);
  };

  return (
    <header className="title-header">
      <div className="title-left">
        <h1 className="title-text">Process Scheduling Simulator</h1>
        <div className="algo-config-wrapper">
          <div className="algo-config-box">
            <label className="config-item">
              <span>Algorithm</span>
              <select value={algorithm} onChange={handleAlgorithmChange}>
                <option value="FCFS">FCFS</option>
                <option value="RR">RR</option>
                <option value="SPN">SPN</option>
                <option value="SRTN">SRTN</option>
                <option value="HRRN">HRRN</option>
                <option value="HR4P">HR4P</option>
              </select>
            </label>
            <label className="config-item">
              <span>Time Quantum</span>
              <input
                type="number"
                value={quantum}
                onChange={handleQuantumChange}
                disabled={algorithm !== "RR" && algorithm !== "HR4P"}
              />
            </label>
          </div>
          <button className="run-button" onClick={onRun}>
            Run
          </button>
        </div>
      </div>
      <span className="team-name">땡초파</span>
    </header>
  );
}

export default Title;
