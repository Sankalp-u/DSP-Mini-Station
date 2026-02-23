import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/* =====================================
   SIMPLE FFT IMPLEMENTATION
===================================== */
function computeFFT(signal) {

  const N = signal.length;
  const spectrum = [];

  for (let k = 0; k < N / 2; k++) {
    let real = 0;
    let imag = 0;

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += signal[n] * Math.cos(angle);
      imag -= signal[n] * Math.sin(angle);
    }

    const magnitude = Math.sqrt(real * real + imag * imag);
    spectrum.push(magnitude);
  }

  return spectrum;
}

export default function SpectrumViewer({ result }) {

  const [ghost, setGhost] = useState(null);

  if (!result || !result.signal) {
    return (
      <div className="text-gray-500 text-sm">
        Run analysis to view spectrum
      </div>
    );
  }

  /* =====================================
     GENERATE FFT LOCALLY
  ===================================== */

  let spectrum = computeFFT(result.signal);

  // remove invalid values (tan spikes)
  spectrum = spectrum.map(v =>
    Number.isFinite(v) ? v : 0
  );

  // normalize
  const maxVal = Math.max(...spectrum, 1);
  spectrum = spectrum.map(v => v / maxVal);

  /* =====================================
     CHART DATA
  ===================================== */

  const datasets = [
    {
      label: "Current",
      data: spectrum,
      backgroundColor: "rgba(34,211,238,0.9)",
      borderRadius: 2
    }
  ];

  if (ghost) {
    datasets.push({
      label: "Ghost Trace",
      data: ghost,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 2
    });
  }

  const data = {
    labels: spectrum.map((_, i) => i),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Mag: ${ctx.raw.toFixed(3)}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", maxTicksLimit: 10 },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: {
        min: 0,
        max: 1,
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={() => setGhost(spectrum)}
          className="px-3 py-1 border border-cyan-500/50 text-cyan-400 rounded text-xs hover:bg-cyan-900/30 transition-colors cursor-pointer"
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
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}