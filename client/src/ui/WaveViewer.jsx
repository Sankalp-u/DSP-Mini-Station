import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

export default function WaveViewer({ result }) {

  // =============================
  // STATES
  // =============================
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(true);

  const timerRef = useRef(null);

  // =============================
  // TIMER CONTROL (CORRECT WAY)
  // =============================
  useEffect(() => {

    if (running) {
      timerRef.current = setInterval(() => {
        setFrame(prev => prev + 1);
      }, 40);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);

  }, [running]);

  // =============================
  // RESET HANDLER
  // =============================
  function resetSweep() {
    clearInterval(timerRef.current);
    setFrame(0);

    if (running) {
      timerRef.current = setInterval(() => {
        setFrame(prev => prev + 1);
      }, 40);
    }
  }

  // =============================
  // GHOST TRACE FEATURE
  // =============================
  const [ghost, setGhost] = useState(null);

  // =============================
  // NO DATA
  // =============================
  if (!result?.signal || !result?.time) {
    return <div className="text-gray-500 flex items-center justify-center h-full">Run analysis...</div>;
  }

  // =============================
  // DOWNSAMPLE
  // =============================
  const MAX_POINTS = 300;
  const step = Math.ceil(result.signal.length / MAX_POINTS);

  const signal = result.signal.filter((_, i) => i % step === 0);
  const time = result.time.filter((_, i) => i % step === 0);

  // =============================
  // TRIGGER LOCK
  // =============================
  let triggerIndex = 0;

  for (let i = 1; i < signal.length; i++) {
    if (signal[i - 1] < 0 && signal[i] >= 0) {
      triggerIndex = i;
      break;
    }
  }

  const windowSize = Math.floor(signal.length * 0.7);

  let start = triggerIndex + frame;

  if (start + windowSize >= signal.length) {
    start = triggerIndex;
  }

  const lockedSignal = signal.slice(start, start + windowSize);
  const lockedTime = time.slice(start, start + windowSize);

  // =============================
  // CHART
  // =============================
  const datasets = [
    {
      data: lockedSignal,
      borderColor: "#00ffd0",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.25
    }
  ];

  if (ghost) {
    datasets.push({
      data: ghost.signal,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0.25
    });
  }

  const data = {
    labels: lockedTime,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: "#0f2028" },
        ticks: { display: false }
      },
      y: {
        grid: { color: "#0f2028" }
      }
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="h-full flex flex-col scope-glow">

      <div className="mb-2 flex gap-2">

        <button
          onClick={() => setRunning(r => !r)}
          className="px-3 py-1 bg-cyan-400 text-black rounded text-xs font-semibold hover:bg-cyan-300 transition-colors cursor-pointer"
        >
          {running ? "Freeze" : "Run"}
        </button>

        <button
          onClick={resetSweep}
          className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition-colors cursor-pointer text-gray-200"
        >
          Reset
        </button>

        <button
          onClick={() => setGhost({ signal: lockedSignal, time: lockedTime })}
          className="ml-auto px-3 py-1 border border-cyan-500/50 text-cyan-400 rounded text-xs hover:bg-cyan-900/30 transition-colors cursor-pointer"
          title="Save current trace as a ghost trace for comparison"
        >
          Pin Ghost
        </button>

        {ghost && (
          <button
            onClick={() => setGhost(null)}
            className="px-3 py-1 border border-red-500/50 text-red-400 rounded text-xs hover:bg-red-900/30 transition-colors cursor-pointer"
          >
            Clear Ghost
          </button>
        )}

      </div>

      <div className="flex-1">
        <Line data={data} options={options} />
      </div>

    </div>
  );
}