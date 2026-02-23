// ===== UNIFIED SIGNAL ANALYSIS CORE =====

const { generateSignal } =
  require("./engines/signalEngine");

const { computeFFT } =
  require("./engines/fftEngine");

const { analyzeFourierSeries } =
  require("./engines/fourierEngine");

const { laplaceTransform } =
  require("./engines/laplaceEngine");

// --------------------------------
// MAIN ANALYSIS FUNCTION
// --------------------------------
function runAnalysis(equation) {

  const dt = 0.01;
  const duration = 3;

  // 1️⃣ Generate signal
  const { signal, time } =
    generateSignal(equation, dt, duration);

  // 2️⃣ FFT
  const { spectrum, samplingRate, N } =
    computeFFT(signal, dt);

  let peakIndex = 0;
  let max = 0;

  spectrum.forEach((v, i) => {
    if (v > max) {
      max = v;
      peakIndex = i;
    }
  });

  const dominantFreq =
    (peakIndex * samplingRate) / N;

  // Bandwidth estimation (3dB drop from peak)
  const maxPower = max * max;
  let lowerBound = peakIndex;
  while (lowerBound > 0 && (spectrum[lowerBound] * spectrum[lowerBound]) > maxPower / 2) {
    lowerBound--;
  }
  let upperBound = peakIndex;
  while (upperBound < spectrum.length - 1 && (spectrum[upperBound] * spectrum[upperBound]) > maxPower / 2) {
    upperBound++;
  }
  const bandwidth = ((upperBound - lowerBound) * samplingRate) / N;

  // 3️⃣ Fourier Series
  const harmonics =
    analyzeFourierSeries(signal, time, 1, 5);

  // 4️⃣ Laplace
  const laplace =
    laplaceTransform(signal, time, dt, 1, 0);

  // RETURN RESULT (IMPORTANT)
  return {
    equation,
    dominantFrequency: dominantFreq,
    bandwidth: bandwidth,
    harmonics,
    laplaceMagnitude: laplace.magnitude,
    signal,
    time,
    spectrum
  };
}

// --------------------------------
// EXPORT FUNCTION
// --------------------------------
module.exports = runAnalysis;