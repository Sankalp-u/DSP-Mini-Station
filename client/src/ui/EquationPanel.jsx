import { useState } from "react";

const PRESETS = [
  { label: "Pure Sine Wave", eq: "sin(2*pi*t)" },
  { label: "Step Response", eq: "1" },
  { label: "Impulse Response (Approx)", eq: "t<0.02 ? 50 : 0" },
  { label: "Second-Order Underdamped", eq: "exp(-t)*sin(2*pi*5*t)" },
  { label: "AM Radio Signal", eq: "(1 + 0.5*sin(2*pi*2*t))*sin(2*pi*20*t)" },
  { label: "Harmonic Content", eq: "sin(2*pi*t) + 0.3*sin(2*pi*3*t) + 0.1*sin(2*pi*5*t)" }
];

export default function EquationPanel({ onResult }) {
  const [equation, setEquation] = useState("sin(2*pi*t)");
  const [numStr, setNumStr] = useState("1, 0, 1");
  const [denStr, setDenStr] = useState("1, 2, 2");
  const [tab, setTab] = useState("signal"); // 'signal' or 'system'

  async function runAnalysis() {
    let num = [1, 0, 1];
    let den = [1, 2, 2];
    try {
      num = numStr.split(",").map((s) => parseFloat(s.trim()));
      den = denStr.split(",").map((s) => parseFloat(s.trim()));
    } catch (e) { /* ignore and use defaults */ }

    const res = await fetch("http://localhost:5050/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equation, num, den })
    });

    const data = await res.json();

    onResult({
      ...data,
      equation,
      num,
      den,
      version: Date.now() // prevents chart crash
    });
  }

  return (
    <div className="space-y-4">
      {/* TABS */}
      <div className="flex rounded bg-black/50 border border-white/5 p-1 gap-1">
        <button
          onClick={() => setTab("signal")}
          className={`flex-1 text-xs py-1.5 rounded transition-colors ${tab === "signal" ? "bg-cyan-500/20 text-cyan-300" : "text-gray-500 hover:text-gray-300"}`}
        >
          Signal
        </button>
        <button
          onClick={() => setTab("system")}
          className={`flex-1 text-xs py-1.5 rounded transition-colors ${tab === "system" ? "bg-purple-500/20 text-purple-300" : "text-gray-500 hover:text-gray-300"}`}
        >
          System
        </button>
      </div>

      {tab === "signal" && (
        <div className="space-y-3 animate-in fade-in zoom-in duration-300">
          <label className="text-xs text-cyan-400 font-semibold uppercase tracking-wider block">Time Domain Equation</label>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-black/60 p-2 rounded text-sm text-gray-300 border border-white/10 outline-none focus:border-cyan-500/50 transition-colors"
              onChange={e => {
                if (e.target.value) setEquation(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled>-- Educational Presets --</option>
              {PRESETS.map((p, i) => (
                <option key={i} value={p.eq}>{p.label}</option>
              ))}
            </select>
          </div>

          <input
            className="w-full bg-black/60 p-2.5 rounded border border-cyan-500/30 text-cyan-300 font-mono text-sm outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all"
            value={equation}
            onChange={e => setEquation(e.target.value)}
            placeholder="Enter equation, e.g. sin(2*pi*t)"
          />
        </div>
      )}

      {tab === "system" && (
        <div className="space-y-3 animate-in fade-in zoom-in duration-300">
          <label className="text-xs text-purple-400 font-semibold uppercase tracking-wider block">Transfer Function</label>

          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-500 uppercase">Numerator Coefficients</span>
            <input
              className="w-full bg-black/60 p-2 rounded border border-purple-500/30 text-purple-300 font-mono text-xs outline-none focus:border-purple-400 transition-all"
              value={numStr}
              onChange={e => setNumStr(e.target.value)}
              placeholder="e.g. 1, 0, 1"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-500 uppercase">Denominator Coefficients (Max Order 2)</span>
            <input
              className="w-full bg-black/60 p-2 rounded border border-purple-500/30 text-purple-300 font-mono text-xs outline-none focus:border-purple-400 transition-all"
              value={denStr}
              onChange={e => setDenStr(e.target.value)}
              placeholder="e.g. 1, 2, 2"
            />
          </div>
        </div>
      )}

      <button
        onClick={runAnalysis}
        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)] text-white font-semibold flex items-center justify-center gap-2 p-2.5 rounded-lg active:scale-95 duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Execute Analysis
      </button>

    </div>
  );
}