// ===== LAPLACE ENGINE =====

function laplaceTransform(signal, time, dt, sigma, omega) {

  let real = 0;
  let imag = 0;

  for (let i = 0; i < signal.length; i++) {

    const t = time[i];
    const decay = Math.exp(-sigma * t);

    real += signal[i] * decay * Math.cos(-omega * t);
    imag += signal[i] * decay * Math.sin(-omega * t);
  }

  const magnitude =
    Math.sqrt(real * real + imag * imag) * dt;

  return { magnitude };
}

module.exports = { laplaceTransform };