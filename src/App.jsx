import React, { useState } from "react";
import Title from "./components/Title/Title";
import ProcessBox from "./components/ProcessInput/ProcessBox"; // 내부에서 ProcessInput + Table 분리 가능 시 대체
import CoreSettings from "./components/CoreSettings/CoreSettings";
import GanttChart from "./components/GanttChart/GanttChart";
import ResultTable from "./components/ResultTable/ResultTable";

import { FCFSSchedule } from "./utils/FCFSSchedule";
import { RRSchedule } from "./utils/RRSchedule";
import { HRRNSchedule } from "./utils/HRRNSchedule";
import { HR4PSchedule } from "./utils/HR4PSchedule";

import "./App.css";
import { SRTNSchedule } from "./utils/SRTNSchedule";
import { SPNSchedule } from "./utils/SPNSchedule";

function App() {
  const [processes, setProcesses] = useState([]);
  const [cores, setCores] = useState([
    { power: "on", type: "E-Core" },
    { power: "on", type: "E-Core" },
    { power: "on", type: "P-Core" },
    { power: "on", type: "P-Core" },
  ]);
  const [algorithm, setAlgorithm] = useState("FCFS");
  const [quantum, setQuantum] = useState(2);

  const [resultData, setResultData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [avgNTT, setAvgNTT] = useState(0);

  const handleRun = () => {
    if (algorithm === "FCFS") {
      const { result, scheduleLog, totalEnergy, avgNTT } = FCFSSchedule(
        processes,
        cores
      );

      console.log(result);
      setResultData(result);
      setGanttData(scheduleLog);
      setTotalEnergy(totalEnergy);
      setAvgNTT(avgNTT);
    } else if (algorithm === "RR") {
      const { result, scheduleLog, totalEnergy, avgNTT } = RRSchedule(
        processes,
        cores,
        quantum
      );

      setResultData(result);
      setGanttData(scheduleLog);
      setTotalEnergy(totalEnergy);
      setAvgNTT(avgNTT);
    } else if (algorithm === "HRRN") {
      const { result, scheduleLog, totalEnergy, avgNTT } = HRRNSchedule(
        processes,
        cores
      );
      console.log(result);
      setResultData(result);
      setGanttData(scheduleLog);
      setTotalEnergy(totalEnergy);
      setAvgNTT(avgNTT);
    } else if (algorithm === "SRTN") {
      const { result, scheduleLog, totalEnergy, avgNTT } = SRTNSchedule(
        processes,
        cores
      );
      setResultData(result);
      setGanttData(scheduleLog);
      setTotalEnergy(totalEnergy);
      setAvgNTT(avgNTT);
    } else if (algorithm === "HR4P") {
      const { result, scheduleLog, totalEnergy, avgNTT } = HR4PSchedule(
        processes,
        cores,
        quantum
      );
      setResultData(result);
      setGanttData(scheduleLog);
      setTotalEnergy(totalEnergy);
      setAvgNTT(avgNTT);
    } else if (algorithm === "SPN") {
      const { result, scheduleLog, totalEnergy, avgNTT } = SPNSchedule(
        processes,
        cores
      );
      console.log(result, scheduleLog);
      setResultData(result);
      setGanttData(scheduleLog);
      setTotalEnergy(totalEnergy);
      setAvgNTT(avgNTT);
    }
  };

  return (
    <div className="App">
      <div className="top">
        <Title
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          quantum={quantum}
          setQuantum={setQuantum}
          onRun={handleRun}
        />
      </div>
      <div className="body">
        <div className="left">
          <div className="left-top">
            <ProcessBox processes={processes} setProcess={setProcesses} />
          </div>
          <div className="left-bottom">
            <CoreSettings cores={cores} setCores={setCores} />
          </div>
        </div>
        <div className="right">
          <div className="right-top">
            <GanttChart data={ganttData} />
          </div>
          <div className="right-bottom">
            <ResultTable
              resultData={resultData}
              totalEnergy={totalEnergy}
              avgNTT={avgNTT}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
