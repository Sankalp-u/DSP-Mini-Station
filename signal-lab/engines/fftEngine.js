// ===== FFT ENGINE =====

function computeFFT(signal, dt) {

  const N = signal.length;
  const samplingRate = 1 / dt;
  const spectrum = [];

  for (let k = 0; k < N / 2; k++) {

    let real = 0;
    let imag = 0;

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;

      real += signal[n] * Math.cos(angle);
      imag -= signal[n] * Math.sin(angle);
    }

    const rawMag = Math.sqrt(real * real + imag * imag);
    const magnitude = k === 0 ? rawMag / N : 2 * rawMag / N; // proper FFT scaling

    spectrum.push(magnitude);
  }

  return { spectrum, samplingRate, N };
}

module.exports = { computeFFT };