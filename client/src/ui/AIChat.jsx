import { useState } from "react";
import { classifySignal } from "../ai/signalClassifier";
import { safeRender } from "../utils/safeRender";

export default function AIChat({ signal, activeResult }) {

  const [messages, setMessages] = useState([
    { role: "ai", text: "Nexus System AI initialized. Ask me about the current pole mapping or signal spectrum." }
  ]);

  const [input, setInput] = useState("");

  function askAI() {

    if (!input.trim()) return;

    let analysis = classifySignal(signal);

    // Supplement context based on user question asking about poles, stability, bandwidth
    const lowerInput = input.toLowerCase();

    if (activeResult) {
      if (lowerInput.includes("stable") || lowerInput.includes("stability") || lowerInput.includes("pole")) {
        const isUnstable = activeResult.poles?.some(p => p.re > 1e-5);
        const isMarginal = activeResult.poles?.some(p => Math.abs(p.re) <= 1e-5);

        analysis = `Based on the latest Pole-Zero map: The system is **${isUnstable ? 'Unstable (RHP poles detected)' : (isMarginal ? 'Marginally Stable' : 'Strictly Stable (all LHP poles)')}**. `;
        activeResult.poles?.forEach((p, i) => {
          analysis += `\\n Pole ${i + 1}: ${p.re.toFixed(2)} ${p.im >= 0 ? '+' : '-'} j${Math.abs(p.im).toFixed(2)}`;
        });
      } else if (lowerInput.includes("bandwidth") || lowerInput.includes("frequency")) {
        analysis = `The dominant frequency component of the current signal is precisely **${activeResult.dominantFrequency?.toFixed(2)} Hz**. The estimated 3dB Bandwidth spread is calculated at **${activeResult.bandwidth?.toFixed(2)} Hz**, giving you an idea of the channel capacity required.`;
      }
    }

    setMessages(prev => [
      ...prev,
      { role: "user", text: input },
      { role: "ai", text: analysis }
    ]);

    setInput("");
  }

  return (
    <div className="bg-[#0f172a] p-4 rounded-xl flex flex-col h-full border border-slate-700/50 shadow-inner custom-scrollbar relative">
      <div className="flex-1 overflow-y-auto space-y-4 text-[13px] mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2.5 rounded-lg max-w-[90%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
              {m.role === 'ai' && <strong className="block text-[10px] uppercase text-purple-400 mb-1">Nexus AI</strong>}
              {safeRender(m.text)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 relative mt-auto">
        <input
          className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-700 text-slate-300 text-sm outline-none focus:border-purple-500/50 transition-colors shadow-inner"
          value={input}
          placeholder="Ask about poles, stability, or frequency..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && askAI()}
        />
        <button
          onClick={askAI}
          className="bg-purple-600/80 hover:bg-purple-500 text-white px-5 rounded-lg font-medium text-sm transition-colors border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          Ask
        </button>
      </div>

    </div>
  );
}