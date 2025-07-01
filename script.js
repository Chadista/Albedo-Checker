const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageUpload = document.getElementById("imageUpload");
const avgRGBEl = document.getElementById("avgRGB");
const brightnessEl = document.getElementById("brightness");
const areaSizeSelect = document.getElementById("areaSize");

let img = new Image();
let imgLoaded = false;
let areaSize = parseInt(areaSizeSelect.value);
let displayScale = 1;
let imageCanvas = document.createElement('canvas');
let imageCtx = imageCanvas.getContext('2d');

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

img.onload = function () {
  let drawWidth = img.width;
  let drawHeight = img.height;

  if (drawWidth > 1024 || drawHeight > 1024) {
    const scale = 1024 / Math.max(drawWidth, drawHeight);
    drawWidth = Math.round(drawWidth * scale);
    drawHeight = Math.round(drawHeight * scale);
    displayScale = scale;
  } else {
    displayScale = 1;
  }

  canvas.width = drawWidth;
  canvas.height = drawHeight;
  imageCanvas.width = drawWidth;
  imageCanvas.height = drawHeight;

  imageCtx.clearRect(0, 0, drawWidth, drawHeight);
  imageCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
  ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

  imgLoaded = true;
};

canvas.addEventListener("mousemove", (e) => {
  if (!imgLoaded) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);

  const halfSize = areaSize / 2;
  const startX = Math.max(0, x - halfSize);
  const startY = Math.max(0, y - halfSize);
  const size = Math.min(areaSize, canvas.width - startX, canvas.height - startY);

  const imgData = imageCtx.getImageData(startX, startY, size, size);
  const data = imgData.data;

  let rSrgbSum = 0, gSrgbSum = 0, bSrgbSum = 0;
  let rLinSum = 0, gLinSum = 0, bLinSum = 0;
  const totalPixels = size * size;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    rSrgbSum += r;
    gSrgbSum += g;
    bSrgbSum += b;

    rLinSum += srgbToLinear(r);
    gLinSum += srgbToLinear(g);
    bLinSum += srgbToLinear(b);
  }

  const rAvg = rSrgbSum / totalPixels;
  const gAvg = gSrgbSum / totalPixels;
  const bAvg = bSrgbSum / totalPixels;
  avgRGBEl.textContent = `${rAvg.toFixed(1)}, ${gAvg.toFixed(1)}, ${bAvg.toFixed(1)}`;

  const rLinAvg = rLinSum / totalPixels;
  const gLinAvg = gLinSum / totalPixels;
  const bLinAvg = bLinSum / totalPixels;

  const brightness = 0.2126 * rLinAvg + 0.7152 * gLinAvg + 0.0722 * bLinAvg;
  brightnessEl.textContent = brightness.toFixed(4);

  ctx.drawImage(imageCanvas, 0, 0);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, startY, size, size);
});

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

areaSizeSelect.addEventListener("change", () => {
  areaSize = parseInt(areaSizeSelect.value);
});
