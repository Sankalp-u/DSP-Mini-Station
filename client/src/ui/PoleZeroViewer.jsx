import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(PointElement, LinearScale, Tooltip, Legend);

export default function PoleZeroViewer({ result, onPoleChange }) {

  if (!result) {
    return (
      <div className="text-slate-500 text-xs flex items-center justify-center h-full animate-pulse">
        AWAITING ANALYSIS TO RENDER MAP
      </div>
    );
  }

  const poles =
    Array.isArray(result.poles) && result.poles.length
      ? result.poles
      : [];

  const polePoints = poles
    .filter(p => Number.isFinite(p.re) && Number.isFinite(p.im))
    .map(p => ({ x: p.re, y: p.im }));

  const pointColors = polePoints.map(p => {
    if (p.x < -1e-5) return "#10b981"; // stable (green)
    if (p.x > 1e-5) return "#ef4444";  // unstable (red)
    return "#f59e0b"; // marginally stable (yellow)
  });

  const data = {
    datasets: [
      {
        label: "Poles",
        data: polePoints,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointStyle: "crossRot",
        borderColor: pointColors,
        backgroundColor: pointColors
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    onClick: (evt, elements, chart) => {
      if (!onPoleChange) return;
      const rect = chart.canvas.getBoundingClientRect();
      const x = evt.native ? evt.native.clientX - rect.left : evt.x;
      const y = evt.native ? evt.native.clientY - rect.top : evt.y;

      const valX = chart.scales.x.getValueForPixel(x);

      // We will map this real pole click to update the pole list
      // For simplicity, we just set a new 2-pole system with conjugate tracking or just two real poles
      // If user clicked, let's just create 2 identical real poles at valX for a critically damped system
      // or if they had poles, let's just append or replace
      // Let's replace with: [valX, valX]
      onPoleChange([valX, valX]);
    },
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
          label: (context) => {
            const re = context.raw.x;
            const im = context.raw.y;
            const wn = Math.sqrt(re * re + im * im);
            const zeta = wn === 0 ? 0 : -re / wn;
            return [
              `Location: (${re.toFixed(2)} ${im >= 0 ? '+' : '-'} j${Math.abs(im).toFixed(2)})`,
              `ωn: ${wn.toFixed(2)} rad/s`,
              `ζ: ${zeta.toFixed(2)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        min: -5,
        max: 5,
        grid: { color: "rgba(255,255,255,0.05)", zeroLineColor: "rgba(34,211,238,0.3)" },
        ticks: { color: "#64748b" },
        title: {
          display: true,
          text: "Real Axis (σ)",
          color: "#475569",
          font: { size: 10, family: "monospace" }
        }
      },
      y: {
        min: -5,
        max: 5,
        grid: { color: "rgba(255,255,255,0.05)", zeroLineColor: "rgba(34,211,238,0.3)" },
        ticks: { color: "#64748b" },
        title: {
          display: true,
          text: "Imaginary Axis (jω)",
          color: "#475569",
          font: { size: 10, family: "monospace" }
        }
      }
    }
  };

  return (
    <div className="h-full w-full relative group">
      <div className="absolute top-2 right-2 text-[9px] text-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to place double pole
      </div>
      <Scatter data={data} options={options} />
    </div>
  );
}