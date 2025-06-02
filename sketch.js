let gui, gridImage;

const palette = {
  "Light Blue": "#9EDCFF",
  White: "#FFFFFF",
  "Dark Green": "#06450D",
  "Dark Blue": "#082553",
  Navy: "#041124",
};

let params = {
  mode: "Waves",
  bgColor: "#9EDCFF",
  useGridOverlay: true,
  zoom: 1.0,
  strokeWeight: 1,
  dashLength: 10,
  gapLength: 10,
  rows: 12,
  segments: 6,
  amplitude: 20,
  frequency: 3,
  rotation: 0,
  circleCount: 20,
  tileCount: 10,
  waveStrength: 1.0,
  tileShape: "Arc",
  waveType: "Sine",
  randomize: randomizeParams,
  saveImage: () => saveCanvas("generative-art", "png"),
};

function preload() {
  gridImage = createGridPattern();
}

function setup() {
  createCanvas(1400, 900);
  createGUI();
  noLoop();
  renderArt();
}

function createGridPattern() {
  const pg = createGraphics(1400, 900);
  pg.clear();
  pg.stroke(220, 220, 220, 80);
  pg.strokeWeight(0.8);
  const spacing = 20;
  for (let y = 0; y < pg.height; y += spacing) pg.line(0, y, pg.width, y);
  for (let x = 0; x < pg.width; x += spacing) pg.line(x, 0, x, pg.height);
  return pg;
}

function renderArt() {
  clear();
  background(params.bgColor);
  if (params.useGridOverlay && gridImage) image(gridImage, 0, 0, width, height);

  drawingContext.lineCap = "butt";
  noFill();

  const bgIsLight = isLightColor(params.bgColor);
  const primary = bgIsLight ? palette["Dark Green"] : palette["Light Blue"];
  const secondary = bgIsLight ? palette["Light Blue"] : palette["White"];
  const colors = [primary, secondary];

  push();
  translate(width / 2, height / 2);
  scale(params.zoom);
  translate(-width / 2, -height / 2);

  if (params.mode === "Waves") drawWaves(colors);
  else if (params.mode === "Circles") drawCircles(colors);
  else if (params.mode === "Truchet") drawTruchet(colors);

  pop();
}

function randomizeParams() {
  if (params.mode === "Waves") {
    params.rows = floor(random(5, 40));
    params.segments = floor(random(3, 20));
    params.amplitude = floor(random(1, 50));
    params.frequency = floor(random(1, 20));
    params.rotation = random([0, 90, 180, 270]);
  }

  if (params.mode === "Circles") {
    params.circleCount = floor(random(5, 60));
  }

  if (params.mode === "Truchet") {
    params.tileCount = floor(random(5, 51));
    params.waveStrength = random(0.5, 2.0);
    const shapes = ["Arc", "Line", "Bezier"];
    const waveTypes = [
      "Sine",
      "Perlin",
      "Spiral",
      "Radial",
      "Linear",
      "Circular",
      "Mix",
    ];
    params.tileShape = random(shapes);
    params.waveType = random(waveTypes);
  }

  params.dashLength = floor(random(4, 20));
  params.gapLength = floor(random(4, 20));
  params.bgColor = getRandomColorFromPalette();
  params.zoom = random(1.0, 3.0);

  updateGUI();
  renderArt();
}

function createGUI() {
  gui = new dat.GUI();

  gui
    .add(params, "mode", ["Waves", "Circles", "Truchet"])
    .name("Mode")
    .onChange(updateGUIVisibility)
    .onFinishChange(renderArt);

  const fCommon = gui.addFolder("Common Settings");
  fCommon
    .add(params, "zoom", 1.0, 3.0)
    .step(0.1)
    .name("Zoom")
    .onFinishChange(renderArt);
  fCommon
    .add(params, "bgColor", palette)
    .name("Background")
    .onChange(renderArt);
  fCommon.add(params, "useGridOverlay").name("Show Grid").onChange(renderArt);
  fCommon.add(params, "dashLength", 1, 50).step(1).onFinishChange(renderArt);
  fCommon.add(params, "gapLength", 1, 50).step(1).onFinishChange(renderArt);
  fCommon.open();

  const fWaves = gui.addFolder("Waves Settings");
  fWaves.add(params, "rows", 1, 40).step(1).onFinishChange(renderArt);
  fWaves.add(params, "segments", 1, 20).step(1).onFinishChange(renderArt);
  fWaves.add(params, "amplitude", 1, 50).step(1).onFinishChange(renderArt);
  fWaves
    .add(params, "frequency", 1, 20)
    .step(1)
    .name("Frequency (×0.001)")
    .onFinishChange(renderArt);
  fWaves
    .add(params, "rotation", [0, 90, 180, 270])
    .name("Rotation")
    .onFinishChange(renderArt);
  fWaves.open();

  const fCircles = gui.addFolder("Circles Settings");
  fCircles.add(params, "circleCount", 3, 50).step(1).onFinishChange(renderArt);

  const fTruchet = gui.addFolder("Truchet Settings");
  fTruchet.add(params, "tileCount", 5, 50).step(1).onFinishChange(renderArt);
  fTruchet
    .add(params, "waveStrength", 0.5, 2.0)
    .step(0.1)
    .name("Wave Strength")
    .onFinishChange(renderArt);
  fTruchet
    .add(params, "tileShape", ["Arc", "Line", "Bezier"])
    .name("Tile Shape")
    .onFinishChange(renderArt);
  fTruchet
    .add(params, "waveType", [
      "Sine",
      "Perlin",
      "Spiral",
      "Radial",
      "Linear",
      "Circular",
      "Mix",
    ])
    .name("Wave Type")
    .onFinishChange(renderArt);

  gui.add(params, "randomize").name("🎲 Randomize");
  gui.add(params, "saveImage").name("💾 Save Image");

  gui.fWaves = fWaves;
  gui.fCircles = fCircles;
  gui.fTruchet = fTruchet;

  updateGUIVisibility();
}

function updateGUIVisibility() {
  gui.fWaves.domElement.style.display =
    params.mode === "Waves" ? "block" : "none";
  gui.fCircles.domElement.style.display =
    params.mode === "Circles" ? "block" : "none";
  gui.fTruchet.domElement.style.display =
    params.mode === "Truchet" ? "block" : "none";
}

function updateGUI() {
  Object.values(gui.__folders).forEach((folder) =>
    folder.__controllers.forEach((ctrl) => ctrl.updateDisplay())
  );
  gui.__controllers.forEach((ctrl) => ctrl.updateDisplay());
}

function drawWaves(colors) {
  push();
  if (params.rotation) {
    translate(width / 2, height / 2);
    rotate(radians(params.rotation));
    translate(-width / 2, -height / 2);
  }
  const spacing = height / (params.rows + 1);
  for (let r = 0; r < params.rows; r++) {
    const yCenter = spacing * (r + 1);
    const segWidth = width / params.segments;
    const amp = params.amplitude;
    const freq = params.frequency * 0.001;
    for (let s = 0; s < params.segments; s++) {
      const mode = random(["bordered", "dashed", "solid"]);
      const strokeCol = random(colors);
      const strokeW = 1;
      const points = [];
      const startX = s * segWidth;
      const endX = (s + 1) * segWidth;
      for (let x = startX; x <= endX; x += 2) {
        const y = yCenter + amp * sin(TWO_PI * freq * x);
        points.push({ x, y });
      }
      if (mode === "bordered") drawBorderedWave(points, strokeCol, strokeW);
      else drawWave(points, strokeCol, strokeW, mode === "dashed");
    }
  }
  setDash(false);
  pop();
}

function drawCircles(colors) {
  const cx = width / 2,
    cy = height / 2;
  const maxRadius = max(width, height) * 0.75 + random(100, 300);
  for (let i = 0; i < params.circleCount; i++) {
    const r = map(i, 0, params.circleCount - 1, 10, maxRadius);
    const strokeCol = colors[i % 2];
    const strokeW = 1;
    const dashed = random() < 0.5;
    if (dashed) drawDashedEllipse(cx, cy, r * 2, r * 2, strokeCol, strokeW);
    else drawBorderedEllipse(cx, cy, r * 2, r * 2, strokeCol, strokeW);
  }
  setDash(false);
}

function drawTruchet(colors) {
  const cols = params.tileCount;
  const rows = floor((cols * height) / width);
  const tileW = width / cols;
  const tileH = height / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * tileW;
      const py = y * tileH;
      const strokeCol = random(colors);
      const strokeW = 1;
      const borderCol = getBorderColor(params.bgColor);
      const borderW = strokeW + 4;
      const rot = getWaveRotation(x, y, cols);

      push();
      translate(px + tileW / 2, py + tileH / 2);
      rotate(rot);
      translate(-tileW / 2, -tileH / 2);

      stroke(borderCol);
      strokeWeight(borderW);
      noFill();
      drawTruchetTile(tileW, tileH, params.tileShape);

      stroke(strokeCol);
      strokeWeight(strokeW);
      drawTruchetTile(tileW, tileH, params.tileShape);

      pop();
    }
  }
}

function drawTruchetTile(w, h, type) {
  switch (type) {
    case "Arc":
      arc(0, 0, w * 2, h * 2, 0, HALF_PI);
      break;
    case "Line":
      line(0, 0, w, h);
      break;
    case "Bezier":
      bezier(0, h, w * 0.5, 0, w * 0.5, h, w, 0);
      break;
  }
}

function getWaveRotation(x, y, n) {
  const s = params.waveStrength;
  switch (params.waveType) {
    case "Sine":
      return sin(x * 0.2 + y * 0.1) * PI * s;
    case "Perlin":
      return map(noise(x * 0.15, y * 0.15), 0, 1, 0, PI * s);
    case "Spiral":
      return atan2(y - n / 2, x - n / 2) * s;
    case "Radial":
      return sin(dist(x, y, n / 2, n / 2) * 0.5) * PI * s;
    case "Linear":
      return map(x, 0, n - 1, 0, PI * s);
    case "Circular":
      return atan2(y - n / 2, x - n / 2) * s;
    case "Mix":
      const d = dist(x, y, n / 2, n / 2);
      return (sin(x * 0.3) + sin(d * 0.5)) * 0.5 * PI * s;
    default:
      return 0;
  }
}

function drawPolyline(points) {
  beginShape();
  for (const { x, y } of points) vertex(x, y);
  endShape();
}

function drawWave(points, col, w, dashed) {
  stroke(col);
  strokeWeight(w);
  setDash(dashed);
  drawPolyline(points);
}

function drawBorderedWave(points, col, w) {
  const borderCol = getBorderColor(params.bgColor),
    borderW = w + 4;
  stroke(borderCol);
  strokeWeight(borderW);
  setDash(false);
  drawPolyline(points);
  stroke(col);
  strokeWeight(w);
  drawPolyline(points);
}

function drawDashedEllipse(x, y, w, h, col, weight) {
  stroke(col);
  strokeWeight(weight);
  setDash(true);
  ellipse(x, y, w, h);
}

function drawBorderedEllipse(x, y, w, h, col, weight) {
  const borderCol = getBorderColor(params.bgColor),
    borderW = weight + 4;
  stroke(borderCol);
  strokeWeight(borderW);
  setDash(false);
  ellipse(x, y, w, h);
  stroke(col);
  strokeWeight(weight);
  ellipse(x, y, w, h);
}

function setDash(enabled) {
  drawingContext.setLineDash(
    enabled ? [params.dashLength, params.gapLength] : []
  );
}

function isLightColor(hex) {
  const c = color(hex);
  return (red(c) * 299 + green(c) * 587 + blue(c) * 114) / 1000 > 128;
}

function getBorderColor(bg) {
  return isLightColor(bg) ? "#041124" : "#FFFFFF";
}

function getRandomColorFromPalette() {
  const keys = Object.keys(palette);
  return palette[random(keys)];
}
