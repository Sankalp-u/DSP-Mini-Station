exports.computePolesZeros = function (den, num) {

  // simple quadratic solver (extend later)

  function roots(coeff) {
    if (!coeff || coeff.length === 0) return [];

    // Remove leading zeros
    while (coeff.length > 0 && coeff[0] === 0) coeff.shift();

    if (coeff.length === 2) {
      // Linear: ax + b = 0
      return [-coeff[1] / coeff[0]];
    }

    if (coeff.length === 3) {
      // Quadratic: ax^2 + bx + c = 0
      const [a, b, c] = coeff;
      const D = b * b - 4 * a * c;

      if (D >= 0) {
        return [
          (-b + Math.sqrt(D)) / (2 * a),
          (-b - Math.sqrt(D)) / (2 * a)
        ];
      }

      const real = -b / (2 * a);
      const imag = Math.sqrt(-D) / (2 * a);

      return [
        { re: real, im: imag },
        { re: real, im: -imag }
      ];
    }

    // Fallback for higher order or constant
    return [];
  }

  return {
    zeros: roots(num),
    poles: roots(den)
  };
};