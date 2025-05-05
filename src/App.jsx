import React, { useState, useEffect } from "react";
import Title from "./components/Title/Title";
import ProcessBox from "./components/ProcessInput/ProcessBox";
import CoreSettings from "./components/CoreSettings/CoreSettings";
import GanttChart from "./components/GanttChart/GanttChart";
import ResultTable from "./components/ResultTable/ResultTable";

import { FCFSSchedule } from "./utils/FCFSSchedule";
import { RRSchedule } from "./utils/RRSchedule";
import { HRRNSchedule } from "./utils/HRRNSchedule";
import { HR4PSchedule } from "./utils/HR4PSchedule";
import { SRTNSchedule } from "./utils/SRTNSchedule";
import { SPNSchedule } from "./utils/SPNSchedule";

import "./App.css";

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
  const [readyQueueLog, setReadyQueueLog] = useState({}); // 추가

  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepIntervalSec, setStepIntervalSec] = useState(1);

  const handleRun = () => {
    setCurrentTime(0);
    setIsRunning(true);

    let scheduleResult = {
      result: [],
      scheduleLog: [],
      totalEnergy: 0,
      avgNTT: 0,
      readyQueueLog: {},
    };

    switch (algorithm) {
      case "FCFS":
        scheduleResult = FCFSSchedule(processes, cores);
        break;
      case "RR":
        scheduleResult = RRSchedule(processes, cores, quantum);
        break;
      case "HRRN":
        scheduleResult = HRRNSchedule(processes, cores);
        break;
      case "SRTN":
        scheduleResult = SRTNSchedule(processes, cores);
        break;
      case "HR4P":
        scheduleResult = HR4PSchedule(processes, cores, quantum);
        break;
      case "SPN":
        scheduleResult = SPNSchedule(processes, cores);
        break;
      default:
        break;
    }

    const {
      result,
      scheduleLog,
      totalEnergy,
      avgNTT,
      readyQueueLog = {},
    } = scheduleResult;

    const flattenedSchedule = scheduleLog.flatMap((core) =>
      core.blocks.map((block) => ({
        ...block,
        coreId: core.coreId,
      }))
    );

    setResultData(result);
    setGanttData(flattenedSchedule);
    setTotalEnergy(totalEnergy);
    setAvgNTT(avgNTT);
    setReadyQueueLog(readyQueueLog);
  };

  useEffect(() => {
    if (!isRunning || ganttData.length === 0) return;

    const maxEnd = Math.max(...ganttData.map((b) => b.end));

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev + 1 > maxEnd) {
          clearInterval(interval);
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, stepIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isRunning, ganttData, stepIntervalSec]);

  return (
    <div className="App">
      <div className="top">
        <Title
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          quantum={quantum}
          setQuantum={setQuantum}
          onRun={handleRun}
          stepIntervalSec={stepIntervalSec}
          setStepIntervalSec={setStepIntervalSec}
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
            <GanttChart
              data={ganttData}
              currentTime={currentTime}
              readyQueueLog={readyQueueLog}
            />
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
