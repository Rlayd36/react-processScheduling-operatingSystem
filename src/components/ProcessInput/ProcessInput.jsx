import React, { useState } from "react";
import "./ProcessInput.css";

function ProcessInput({ onAdd, onAddMultiple, onDeleteLast, currentCount }) {
  const [process, setProcess] = useState({
    id: "",
    arrivalTime: "",
    burstTime: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProcess({ ...process, [name]: value });
  };

  const handleAdd = () => {
    if (currentCount >= 15) {
      setError("최대 입력 가능 프로세스는 15개 입니다.");
      return;
    }

    if (!process.id || !process.arrivalTime || !process.burstTime) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    onAdd({
      ...process,
      arrivalTime: Number(process.arrivalTime),
      burstTime: Number(process.burstTime),
    });

    setProcess({ id: "", arrivalTime: "", burstTime: "" });
    setError("");
  };

  const handleDelete = () => {
    if (currentCount > 0) {
      onDeleteLast(); // 부모에게 삭제 요청
      setError(""); // 에러 메시지도 제거
    }
  };

  const handleGenerateRandom = () => {
    if (currentCount >= 15) {
      setError("최대 입력 가능 프로세스는 15개 입니다.");
      return;
    }

    const countToGenerate = 15 - currentCount;
    const newProcesses = [];
    const usedArrivalTimes = new Set();
    let pidIndex = currentCount + 1;

    while (newProcesses.length < countToGenerate) {
      const at = Math.floor(Math.random() * 30);
      const bt = Math.floor(Math.random() * 10) + 1;

      if (!usedArrivalTimes.has(at)) {
        usedArrivalTimes.add(at);
        newProcesses.push({
          id: `P${pidIndex++}`,
          arrivalTime: at,
          burstTime: bt,
        });
      }
    }

    onAddMultiple(newProcesses);
    setError("");
  };

  return (
    <div className="process-input">
      <h2>프로세스 추가</h2>
      <div className="form-group">
        <label>Process ID</label>
        <input
          type="text"
          name="id"
          value={process.id}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Arrival Time</label>
        <input
          type="number"
          name="arrivalTime"
          value={process.arrivalTime}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Burst Time (BT)</label>
        <input
          type="number"
          name="burstTime"
          value={process.burstTime}
          onChange={handleChange}
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="button-row">
        <button onClick={handleAdd} className="action-btn add-btn">
          Add
        </button>
        <button onClick={handleDelete} className="action-btn delete-btn">
          Delete Last
        </button>
        <button
          onClick={handleGenerateRandom}
          className="action-btn random-btn"
        >
          Generate 15
        </button>
      </div>
    </div>
  );
}

export default ProcessInput;
