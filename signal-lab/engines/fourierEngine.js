// ===== FOURIER SERIES ENGINE =====

function analyzeFourierSeries(signal, time, T, harmonics) {

  const N = signal.length;
  const omega0 = (2 * Math.PI) / T;

  const bn = [];

  for (let n = 1; n <= harmonics; n++) {

    let sum = 0;

    for (let i = 0; i < N; i++) {
      sum += signal[i] *
        Math.sin(n * omega0 * time[i]);
    }

    bn.push((2 / N) * sum);
  }

  return bn;
}

module.exports = { analyzeFourierSeries };