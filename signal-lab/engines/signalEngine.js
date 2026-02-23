// ===== SIGNAL ENGINE =====

const { evaluate } = require("mathjs");

function generateSignal(equation, dt, duration) {

  const signal = [];
  const time = [];

  for (let t = 0; t <= duration; t += dt) {
    signal.push(evaluate(equation, { t }));
    time.push(t);
  }

  return { signal, time };
}

module.exports = { generateSignal };