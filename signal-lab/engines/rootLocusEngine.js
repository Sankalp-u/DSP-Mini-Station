exports.computeRootLocus = function (den) {

  const locus = [];

  // Currently only supports 2nd order denominator [a, b, c]
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
      // Add complex roots for root locus plot completeness!
      const real = -b / (2 * a);
      const imag = Math.sqrt(-D) / (2 * a);
      locus.push([
        { re: real, im: imag },
        { re: real, im: -imag }
      ]);
    }
  }

  return locus;
};