import React from "react";
import "./ProcessBox.css";
import ProcessInput from "./ProcessInput";
import ProcessTable from "./ProcessTable";

function ProcessBox({ processes, setProcess }) {
  const handleDeleteLast = () => {
    if (processes.length > 0) {
      setProcess(processes.slice(0, -1));
    }
  };

  const handleAddProcess = (newProcess) => {
    setProcess([...processes, newProcess]);
  };

  const handleAddMultiple = (newProcessList) => {
    setProcess([...processes, ...newProcessList]);
  };

  return (
    <div className="process-box">
      <ProcessInput
        onAdd={handleAddProcess}
        onAddMultiple={handleAddMultiple}
        onDeleteLast={handleDeleteLast}
        currentCount={processes.length}
      />
      <ProcessTable processes={processes} />
    </div>
  );
}

export default ProcessBox;
