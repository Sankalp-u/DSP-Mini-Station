// =====================================
// CONTROL ENGINE (frontend realtime)
// =====================================

// compute polynomial coefficients from poles
export function polesToDenominator(poles) {
  if (!poles || poles.length === 0) return [1];

  // Start with (s - p0)
  let den = [1, -poles[0]];

  // Multiply by (s - pk) for remaining poles
  for (let i = 1; i < poles.length; i++) {
    const p = poles[i];
    // multiply den array by [1, -p]
    // which means shifting den, and adding (-p * den)
    const nextDen = new Array(den.length + 1).fill(0);
    for (let j = 0; j < den.length; j++) {
      nextDen[j] += den[j]; // from 's' term
      nextDen[j + 1] -= den[j] * p; // from '-p' term
    }
    den = nextDen;
  }

  return den;
}

// ---------- BODE ----------
export function computeBode(num, den) {

  const w = [];
  const mag = [];

  for (let i = -1; i < 2; i += 0.02) {

    const omega = Math.pow(10, i);

    function evalPoly(coeff) {
      let re = 0, im = 0;

      coeff.forEach((c, k) => {
        const p = coeff.length - k - 1;
        re += c * Math.pow(omega, p) * Math.cos(p * Math.PI / 2);
        im += c * Math.pow(omega, p) * Math.sin(p * Math.PI / 2);
      });

      return { re, im };
    }

    const N = evalPoly(num);
    const D = evalPoly(den);

    const Hre = (N.re * D.re + N.im * D.im) / (D.re ** 2 + D.im ** 2);
    const Him = (N.im * D.re - N.re * D.im) / (D.re ** 2 + D.im ** 2);

    w.push(omega);
    mag.push(20 * Math.log10(Math.sqrt(Hre ** 2 + Him ** 2)));
  }

  return { w, mag };
}

// ---------- ROOT LOCUS ----------
export function computeRootLocus(den) {

  const locus = [];

  if (!den || den.length !== 3) {
    return locus;
  }

  for (let k = 0; k < 50; k++) {

    const a = den[0];
    const b = den[1];
    const c = den[2] + k;

    const D = b * b - 4 * a * c;

    if (D >= 0) {
      locus.push([
        (-b + Math.sqrt(D)) / (2 * a),
        (-b - Math.sqrt(D)) / (2 * a)
      ]);
    } else {
      const real = -b / (2 * a);
      const imag = Math.sqrt(-D) / (2 * a);
      locus.push([
        { re: real, im: imag },
        { re: real, im: -imag }
      ]);
    }
  }

  return locus;
}