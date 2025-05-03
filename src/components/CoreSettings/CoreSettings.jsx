import React from "react";
import "./CoreSettings.css";

function CoreSettings({ cores, setCores }) {
  const handlePowerChange = (index, value) => {
    const updated = [...cores];
    updated[index].power = value;
    setCores(updated);
  };

  const handleTypeChange = (index, value) => {
    const updated = [...cores];
    updated[index].type = value;
    setCores(updated);
  };

  return (
    <div className="core-settings-box">
      <h2>Core Settings</h2>
      <div className="core-grid">
        {cores.map((core, idx) => (
          <div key={idx} className="core-item">
            <h3>Core {idx + 1}</h3>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name={`power-${idx}`}
                  value="on"
                  checked={core.power === "on"}
                  onChange={() => handlePowerChange(idx, "on")}
                />
                ON
              </label>
              <label>
                <input
                  type="radio"
                  name={`power-${idx}`}
                  value="off"
                  checked={core.power === "off"}
                  onChange={() => handlePowerChange(idx, "off")}
                />
                OFF
              </label>
            </div>
            <select
              className="core-option"
              value={core.type}
              onChange={(e) => handleTypeChange(idx, e.target.value)}
              disabled={core.power === "off"}
            >
              <option value="P-Core">P-Core</option>
              <option value="E-Core">E-Core</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoreSettings;
