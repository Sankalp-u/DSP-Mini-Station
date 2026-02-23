import { useState, useEffect } from "react"; // ✅ ADDED useEffect

import EquationPanel from "./EquationPanel";
import WaveViewer from "./WaveViewer";
import SpectrumViewer from "./SpectrumViewer";
import AIChat from "./AIChat";

import PoleZeroViewer from "./PoleZeroViewer";
import BodeViewer from "./BodeViewer";
import RootLocusViewer from "./RootLocusViewer";

import { classifySignal } from "../ai/signalClassifier";

import {
  polesToDenominator,
  computeBode,
  computeRootLocus
} from "../ai/controlEngine";

export default function Dashboard() {

  const [signal, setSignal] = useState([]);
  const [spectrum, setSpectrum] = useState([]);
  const [equation, setEquation] = useState("sin(2*pi*t)");

  // =============================
  // ORIGINAL SERVER RESULT
  // =============================
  const [result, setResult] = useState(null);

  // =============================
  // LIVE UPDATED RESULT
  // =============================
  const [dynamicResult, setDynamicResult] = useState(null);

  const activeResult = dynamicResult || result;

  // ✅ ADDED — sync signal safely for AIChat
  useEffect(() => {
    if (activeResult?.signal) {
      setSignal(activeResult.signal);
    }
  }, [activeResult]);

  // =============================
  // POLE DRAG HANDLER
  // =============================
  function updatePoles(poles) {

    if (!result) return;

    const den = polesToDenominator(poles);
    const num = result.num || [1, 0, 1];

    const bode = computeBode(num, den);
    const locus = computeRootLocus(den);

    setDynamicResult({
      ...result,
      poles: poles.map(p => ({ re: p, im: 0 })),
      bode,
      locus
    });
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="h-screen flex flex-col antialiased bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-hidden relative">

      {/* Background glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-700/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-700/20 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <div className="h-16 flex items-center px-8 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl z-10 sticky top-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-[0.2em] font-bold text-lg">
            NEXUS <span className="text-slate-500 font-medium">DSP PLATFORM</span>
          </h1>
        </div>

        <button
          onClick={() => window.print()}
          className="mr-6 px-5 py-2 text-xs bg-slate-800/50 text-cyan-300 rounded-lg hover:bg-cyan-900/30 hover:text-cyan-200 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
        >
          Export Report
        </button>

        <div className="text-xs text-slate-500 font-medium uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
          Interactive Simulator
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-[340px_1fr] gap-6 p-6 overflow-hidden z-10">

        {/* SIDEBAR */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

          <div className="panel p-5 bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-xl hover:border-white/10 transition-colors">
            <EquationPanel onResult={(r) => {
              setResult(r);
              setDynamicResult(null);
            }} />
          </div>

          {/* SIGNAL METRICS */}
          <div className="panel p-5 bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-xl text-sm space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <h2 className="text-xs text-slate-400 uppercase tracking-[0.15em] font-semibold">
                Intelligence Engine
              </h2>
            </div>

            {activeResult ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Metric
                  label="Dominant Frequency"
                  value={`${activeResult.dominantFrequency.toFixed(2)} Hz`}
                />

                {activeResult.bandwidth !== undefined && (
                  <Metric
                    label="Est. Bandwidth (3dB)"
                    value={`${activeResult.bandwidth.toFixed(2)} Hz`}
                  />
                )}

                <Metric
                  label="Laplace Magnitude"
                  value={activeResult.laplaceMagnitude.toFixed(3)}
                />

                <Metric
                  label="Classification"
                  value={classifySignal(activeResult.signal || [])}
                />

                {/* Semantic Summary based on Poles */}
                <div className="mt-4 pt-4 border-t border-white/5 text-[13px] text-slate-400 leading-relaxed bg-slate-800/20 p-3 rounded-lg">
                  <span className="text-cyan-500 mr-1">✨</span>
                  {activeResult.poles?.length > 0
                    ? `System dynamics defined by ${activeResult.poles.length} poles. ${activeResult.poles.some(p => p.re > 0) ? 'Right-half plane poles are causing instability.' : (activeResult.poles.some(p => Math.abs(p.im) > 0) ? 'Complex conjugate poles impart an underdamped oscillatory response.' : 'Real-axis poles provide an overdamped non-oscillatory response.')}`
                    : `Analysis indicates raw signal characteristics mapping out ${activeResult.dominantFrequency > 0 ? 'oscillatory behavior' : 'low-frequency baseline'}.`
                  }
                </div>

                {/* Passive Stability Diagnostics */}
                {activeResult.poles?.some(p => p.re > 1e-5) ? (
                  <div className="mt-3 p-3 bg-red-950/40 border border-red-500/30 rounded-lg flex gap-3 items-start text-[13px] text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <span className="text-red-500 animate-pulse mt-0.5">⚠️</span>
                    <p className="leading-relaxed"><strong>System Unstable:</strong> Right-half plane poles detected. Transient responses will grow exponentially over time.</p>
                  </div>
                ) : activeResult.poles?.some(p => Math.abs(p.re) <= 1e-5) ? (
                  <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg flex gap-3 items-start text-[13px] text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <span className="text-amber-500 mt-0.5">⚡</span>
                    <p className="leading-relaxed"><strong>System Marginally Stable:</strong> Roots exist on the jω axis resulting in sustained oscillations.</p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg flex gap-3 items-start text-[13px] text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-emerald-500 mt-0.5">✅</span>
                    <p className="leading-relaxed"><strong>System Stable:</strong> All poles reside in the Left-Half Plane ensuring bounded transient decay.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 space-y-3">
                <div className="w-10 h-10 border-2 border-slate-700/50 rounded-full border-t-cyan-500/50 animate-spin" />
                <p className="text-xs animate-pulse">Awaiting Signal Analysis…</p>
              </div>
            )}

          </div>

          {/* AI CHAT */}
          <div className="panel p-0 bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-xl flex-1 min-h-[350px] overflow-hidden flex flex-col">
            <div className="bg-slate-800/40 px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <h2 className="text-xs text-slate-400 uppercase tracking-[0.15em] font-semibold">Nexus AI Assistant</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <AIChat signal={signal} activeResult={activeResult} />
            </div>
          </div>

        </div>

        {/* INSTRUMENT AREA */}
        <div className="grid grid-rows-3 gap-5 overflow-y-auto pr-2">

          <Panel title="OSCILLOSCOPE">
            <WaveViewer result={activeResult} />
          </Panel>

          <Panel title="FFT SPECTRUM">
            <SpectrumViewer result={activeResult} />
          </Panel>

          <div className="grid grid-cols-3 gap-5">

            <Panel title="POLE - ZERO MAP">
              <PoleZeroViewer
                result={activeResult}
                onPoleChange={updatePoles}
              />
            </Panel>

            <Panel title="BODE PLOT">
              <BodeViewer result={activeResult} />
            </Panel>

            <Panel title="ROOT LOCUS">
              <RootLocusViewer result={activeResult} />
            </Panel>

          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Panel({ title, children }) {
  return (
    <div className="panel p-0 bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-xl flex flex-col overflow-hidden hover:border-white/10 transition-colors">
      <div className="bg-slate-800/40 px-5 py-3 border-b border-white/5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
        <h2 className="text-[11px] text-slate-300 uppercase tracking-[0.2em] font-bold">
          {title}
        </h2>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
      <span className="text-slate-400 text-xs font-medium">{label}</span>
      <span className="text-cyan-300 font-mono text-xs bg-cyan-950/30 px-2.5 py-1 rounded-md border border-cyan-800/50 shadow-[inset_0_0_10px_rgba(34,211,238,0.05)]">{value}</span>
    </div>
  );
}