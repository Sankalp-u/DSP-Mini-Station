// client/src/ai/signalClassifier.js

export function classifySignal(signal = []) {

  if (!signal.length)
    return "No signal loaded.";

  const max = Math.max(...signal.map(v => Math.abs(v)));

  let stability =
    max > 20 || !isFinite(max)
      ? "unstable"
      : "stable";

  let zeroCross = 0;
  for (let i = 1; i < signal.length; i++) {
    if (signal[i - 1] * signal[i] < 0) zeroCross++;
  }

  let type =
    zeroCross > signal.length * 0.1
      ? "oscillatory"
      : "slowly varying";

  return `Signal is ${type} and appears ${stability}.`;
}