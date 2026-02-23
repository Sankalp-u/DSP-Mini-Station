import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, LogarithmicScale, Tooltip, Legend);

export default function BodeViewer({ result }) {

  const [ghost, setGhost] = useState(null);

  if (!result || !result.bode) {
    return (
      <div className="text-gray-500 text-sm flex items-center h-full">
        Run analysis to view Bode Plot
      </div>
    );
  }

  const { w, mag } = result.bode;

  const datasets = [
    {
      label: "Current Magnitude",
      data: mag,
      borderColor: "#00aaff",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1
    }
  ];

  if (ghost) {
    datasets.push({
      label: "Ghost Magnitude",
      data: ghost.mag,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0.1
    });
  }

  const data = {
    labels: w,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(34, 211, 238, 0.3)",
        borderWidth: 1,
        titleColor: "#94a3b8",
        bodyColor: "#f1f5f9",
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.raw.toFixed(2)} dB at ${ctx.label} rad/s`
        }
      }
    },
    scales: {
      x: {
        type: "logarithmic",
        title: { display: true, text: "Frequency (rad/s)", color: "#475569", font: { size: 10, family: "monospace" } },
        ticks: { color: "#64748b", maxTicksLimit: 5 },
        grid: { color: "rgba(255, 255, 255, 0.05)" }
      },
      y: {
        title: { display: true, text: "Magnitude (dB)", color: "#475569", font: { size: 10, family: "monospace" } },
        ticks: { color: "#64748b" },
        grid: { color: "rgba(255, 255, 255, 0.05)", zeroLineColor: "rgba(34,211,238,0.3)" }
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col pt-1 relative">
      <div className="absolute top-0 right-2 z-10 flex gap-2">
        <button
          onClick={() => setGhost({ mag: [...mag] })}
          className="px-2 py-0.5 border border-cyan-500/50 text-cyan-400 bg-black/50 backdrop-blur rounded text-[10px] hover:bg-cyan-900/50 transition-colors shadow-lg active:scale-95"
          title="Save current trace as a ghost trace for comparison"
        >
          Pin Ghost
        </button>

        {ghost && (
          <button
            onClick={() => setGhost(null)}
            className="px-2 py-0.5 border border-purple-500/50 text-purple-400 bg-black/50 backdrop-blur rounded text-[10px] hover:bg-purple-900/50 transition-colors shadow-lg active:scale-95"
          >
            Clear Ghost
          </button>
        )}
      </div>

      <div className="flex-1 mt-2">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}