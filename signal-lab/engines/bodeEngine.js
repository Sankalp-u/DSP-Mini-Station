exports.computeBode = function(num, den){

  const w = [];
  const mag = [];
  const phase = [];

  for(let i=-1;i<2;i+=0.02){

    const omega = Math.pow(10,i);

    const jw = {re:0, im:omega};

    function evalPoly(coeff){
      let re=0, im=0;

      coeff.forEach((c,k)=>{
        const p = coeff.length-k-1;
        re += c*Math.pow(omega,p)*Math.cos(p*Math.PI/2);
        im += c*Math.pow(omega,p)*Math.sin(p*Math.PI/2);
      });

      return {re,im};
    }

    const N = evalPoly(num);
    const D = evalPoly(den);

    const Hre = (N.re*D.re + N.im*D.im)/(D.re**2+D.im**2);
    const Him = (N.im*D.re - N.re*D.im)/(D.re**2+D.im**2);

    w.push(omega);
    mag.push(20*Math.log10(Math.sqrt(Hre**2+Him**2)));
    phase.push(Math.atan2(Him,Hre)*180/Math.PI);
  }

  return {w,mag,phase};
};