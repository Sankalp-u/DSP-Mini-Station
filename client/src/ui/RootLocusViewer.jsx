import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(PointElement, LinearScale, Tooltip, Legend);

export default function RootLocusViewer({ result }) {

  if (!result || !result.locus) {
    return (
      <div className="text-gray-500 text-sm flex items-center h-full">
        Run analysis to view Root Locus
      </div>
    );
  }

  // Parse locus data which handles both real scalars and {re, im} complex roots
  const points = [];
  result.locus.forEach(rootPair => {
    rootPair.forEach(root => {
      if (typeof root === "number") {
        points.push({ x: root, y: 0 });
      } else if (root && typeof root === "object") {
        points.push({ x: root.re, y: root.im });
      }
    });
  });

  const data = {
    datasets: [
      {
        label: "Locus Path",
        data: points,
        pointRadius: 4,
        pointHoverRadius: 6,
        backgroundColor: "rgba(167, 139, 250, 0.8)",
        borderColor: "#a78bfa"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(167, 139, 250, 0.3)",
        borderWidth: 1,
        titleColor: "#94a3b8",
        bodyColor: "#f1f5f9",
        padding: 10,
        callbacks: {
          label: (context) => `Root: ${context.raw.x.toFixed(2)}${context.raw.y >= 0 ? '+' : '-'}j${Math.abs(context.raw.y).toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)", zeroLineColor: "rgba(167, 139, 250, 0.3)" },
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
        grid: { color: "rgba(255, 255, 255, 0.05)", zeroLineColor: "rgba(167, 139, 250, 0.3)" },
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
    <div className="h-full w-full">
      <Scatter data={data} options={options} />
    </div>
  );
}