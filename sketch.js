let gui;
const palette = ["#9EDCFF", "#FFFFFF", "#06450D", "#082553", "#041124"];

let params = {
  mode: "Waves", // "Waves", "Arcs", "Circles"
  bgColor: "#9EDCFF",
  ampMin: 5,
  ampMax: 30,
  freqMinRaw: 1,
  freqMaxRaw: 5,
  rows: 12,
  segments: 6,
  gridSpacing: 40,
  gridAlpha: 60,
  strokeMinWeight: 1,
  strokeMaxWeight: 6,
  arcRotation: 90,
  dashLength: 10,
  gapLength: 10,
  generate: () => {
    params.ampMin = floor(random(1, 15));
    params.ampMax = floor(random(params.ampMin + 1, 30));
    params.freqMinRaw = floor(random(1, 5));
    params.freqMaxRaw = floor(random(params.freqMinRaw + 1, 10));
    params.rows = floor(random(5, 40));
    params.segments = floor(random(3, 10));
    params.gridSpacing = floor(random(10, 40));
    params.gridAlpha = floor(random(20, 100));
    params.strokeMinWeight = floor(random(1, 4));
    params.strokeMaxWeight = floor(random(params.strokeMinWeight + 1, 12));
    params.arcRotation = random([0, 90, 180, 270]);
    params.dashLength = floor(random(4, 20));
    params.gapLength = floor(random(4, 20));
    params.bgColor = random(palette);

    for (let controller of gui.__controllers) controller.updateDisplay();
    generate();
  },
  savePNG: () => saveCanvas("wave-art", "png"),
};

function setup() {
  createCanvas(900, 900);
  createGUI();
  noLoop();
  generate();
}

function draw() {}

function generate() {
  clear();
  background(params.bgColor);
  drawGrid(params.gridSpacing, "#8ac1df");

  const strokeColors = palette.filter((c) => colorContrast(params.bgColor, c));

  if (params.mode === "Waves") {
    generateWaves(strokeColors);
  } else if (params.mode === "Arcs") {
    generateArcs(strokeColors);
  } else if (params.mode === "Circles") {
    generateCircles(strokeColors);
  }
}

function generateWaves(colors) {
  const rowSpacing = height / (params.rows + 1);

  for (let r = 0; r < params.rows; r++) {
    let centerY = rowSpacing * (r + 1);
    let segmentWidth = width / params.segments;
    let amp = floor(random(params.ampMin, params.ampMax + 1));
    let freq = random(params.freqMinRaw, params.freqMaxRaw) * 0.001;

    for (let s = 0; s < params.segments; s++) {
      stroke(random(colors));
      strokeWeight(random(params.strokeMinWeight, params.strokeMaxWeight));
      noFill();

      if (random() < 0.5) {
        drawingContext.setLineDash([params.dashLength, params.gapLength]);
      } else {
        drawingContext.setLineDash([]);
      }

      let startX = s * segmentWidth;
      let endX = (s + 1) * segmentWidth;

      beginShape();
      for (let x = startX; x < endX; x++) {
        let y = centerY + amp * sin(TWO_PI * freq * x);
        vertex(x, y);
      }
      endShape();
    }
  }

  drawingContext.setLineDash([]);
}

function generateArcs(colors) {
  const rows = params.rows;
  const cols = params.segments;

  const spacingX = width / (cols + 1);
  const spacingY = height / (rows + 1);

  const sweepAngle = HALF_PI;
  const radius = 50;

  const gridWidth = spacingX * (cols - 1);
  const gridHeight = spacingY * (rows - 1);
  const offsetX = width / 2 - gridWidth / 2;
  const offsetY = height / 2 - gridHeight / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const posX = offsetX + c * spacingX;
      const posY = offsetY + r * spacingY;

      stroke(random(colors));
      strokeWeight(random(params.strokeMinWeight, params.strokeMaxWeight));
      noFill();

      push();
      translate(posX, posY);
      rotate(radians(params.arcRotation));

      if (random() < 0.5) {
        drawingContext.setLineDash([params.dashLength, params.gapLength]);
      } else {
        drawingContext.setLineDash([]);
      }

      arc(0, 0, radius, radius, -sweepAngle / 2, sweepAngle / 2);
      pop();
    }
  }

  drawingContext.setLineDash([]);
}

function generateCircles(colors) {
  const centerX = width / 2;
  const centerY = height / 2;

  const rings = floor(random(5, 20));

  // 👇 Allow circles to be larger than canvas width/height
  const maxRadius = max(width, height) * 0.75 + random(100, 300);

  for (let i = 0; i < rings; i++) {
    const r = map(i, 0, rings - 1, 10, maxRadius);

    stroke(random(colors));
    strokeWeight(random(params.strokeMinWeight, params.strokeMaxWeight));
    noFill();

    if (random() < 0.5) {
      drawingContext.setLineDash([params.dashLength, params.gapLength]);
    } else {
      drawingContext.setLineDash([]);
    }

    ellipse(centerX, centerY, r * 2, r * 2);
  }

  drawingContext.setLineDash([]);
}

function drawGrid(spacing, baseColor) {
  let gridCol = color(baseColor);
  gridCol.setAlpha(params.gridAlpha);
  stroke(gridCol);
  strokeWeight(1);

  for (let x = 0; x <= width; x += spacing) line(x, 0, x, height);
  for (let y = 0; y <= height; y += spacing) line(0, y, width, y);
}

function createGUI() {
  gui = new dat.GUI();
  gui
    .add(params, "mode", ["Waves", "Arcs", "Circles"])
    .name("Mode")
    .onFinishChange(generate);
  gui
    .add(params, "bgColor", palette)
    .name("Background")
    .onFinishChange(generate);
  gui.add(params, "ampMin", 0, 30).step(1).onFinishChange(generate);
  gui.add(params, "ampMax", 0, 30).step(1).onFinishChange(generate);
  gui
    .add(params, "freqMinRaw", 1, 10)
    .step(1)
    .name("Freq Min (×0.001)")
    .onFinishChange(generate);
  gui
    .add(params, "freqMaxRaw", 1, 10)
    .step(1)
    .name("Freq Max (×0.001)")
    .onFinishChange(generate);
  gui.add(params, "rows", 1, 40).step(1).onFinishChange(generate);
  gui.add(params, "segments", 1, 20).step(1).onFinishChange(generate);
  gui
    .add(params, "gridSpacing", 10, 40)
    .step(1)
    .name("Grid Size")
    .onFinishChange(generate);
  gui
    .add(params, "gridAlpha", 0, 255)
    .step(5)
    .name("Grid Opacity")
    .onFinishChange(generate);
  gui
    .add(params, "strokeMinWeight", 1, 10)
    .step(1)
    .name("Stroke Min")
    .onFinishChange(generate);
  gui
    .add(params, "strokeMaxWeight", 1, 10)
    .step(1)
    .name("Stroke Max")
    .onFinishChange(generate);
  gui
    .add(params, "arcRotation", 0, 270)
    .step(90)
    .name("Arc Rotation")
    .onFinishChange(generate);
  gui
    .add(params, "dashLength", 1, 50)
    .step(1)
    .name("Dash Length")
    .onFinishChange(generate);
  gui
    .add(params, "gapLength", 1, 50)
    .step(1)
    .name("Gap Length")
    .onFinishChange(generate);
  gui.add(params, "generate").name("🎲 Generate");
  gui.add(params, "savePNG").name("💾 Save PNG");
}

function colorContrast(bgHex, strokeHex) {
  const bg = color(bgHex);
  const fg = color(strokeHex);
  return abs(brightness(bg) - brightness(fg)) > 40;
}
