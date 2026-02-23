const express = require("express");
const cors = require("cors");

const runAnalysis = require("../signal-lab/unifiedAnalysis");

const { computePolesZeros } =
  require("../signal-lab/engines/poleZeroEngine");

const { computeBode } =
  require("../signal-lab/engines/bodeEngine");

const { computeRootLocus } =
  require("../signal-lab/engines/rootLocusEngine");

const app = express();

app.use(cors());
app.use(express.json());

// =============================
// HEALTH CHECK
// =============================
app.get("/", (req, res) => {
  res.send("✅ AI Signal Platform Running");
});

// =============================
// ANALYZE ROUTE
// =============================
app.post("/analyze", (req, res) => {

  const { equation, num: reqNum, den: reqDen } = req.body;

  // Existing signal analysis
  const analysis = runAnalysis(equation);

  // Parse arrays or fallback to example transfer function
  const num = reqNum && Array.isArray(reqNum) ? reqNum : [1, 0, 1];
  const den = reqDen && Array.isArray(reqDen) ? reqDen : [1, 2, 2];

  const poleZero = computePolesZeros(den, num);
  const bode = computeBode(num, den);
  const locus = computeRootLocus(den);

  res.json({
    ...analysis,
    poles: poleZero.poles,
    zeros: poleZero.zeros,
    bode,
    locus
  });
});

// =============================
app.listen(5050, () => {
  console.log("🚀 Server running at http://localhost:5050");
});