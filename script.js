const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageUpload = document.getElementById("imageUpload");
const avgRGBEl = document.getElementById("avgRGB");
const brightnessEl = document.getElementById("brightness");
const areaSizeSelect = document.getElementById("areaSize");

let img = new Image();
let areaSize = parseInt(areaSizeSelect.value);
let imageCanvas = document.createElement('canvas');
let imageCtx = imageCanvas.getContext('2d');

imageUpload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

img.onload = () => {
  const scale = Math.min(1024 / img.width, 1024 / img.height, 1);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  canvas.width = drawWidth;
  canvas.height = drawHeight;
  imageCanvas.width = drawWidth;
  imageCanvas.height = drawHeight;
  imageCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
  drawImage();
};

function drawImage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imageCanvas, 0, 0);
}

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  const size = areaSize;
  const imgData = imageCtx.getImageData(x, y, size, size).data;

  let r = 0, g = 0, b = 0;
  for (let i = 0; i < imgData.length; i += 4) {
    r += imgData[i];
    g += imgData[i + 1];
    b += imgData[i + 2];
  }
  const pixels = imgData.length / 4;
  const rAvg = r / pixels;
  const gAvg = g / pixels;
  const bAvg = b / pixels;
  avgRGBEl.textContent = `${rAvg.toFixed(1)}, ${gAvg.toFixed(1)}, ${bAvg.toFixed(1)}`;
  const lin = v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  const brightness = 0.2126 * lin(rAvg / 255) + 0.7152 * lin(gAvg / 255) + 0.0722 * lin(bAvg / 255);
  brightnessEl.textContent = brightness.toFixed(4);
  const suggestionEl = document.getElementById("materialSuggestion");
  suggestionEl.textContent = brightness < 0.04 ? "Suggested: Charcoal, soot"
    : brightness < 0.1 ? "Suggested: Asphalt, dark fabric"
    : brightness < 0.2 ? "Suggested: Wood, leather"
    : brightness < 0.4 ? "Suggested: Brick, concrete"
    : brightness < 0.6 ? "Suggested: Plastic, painted wall"
    : brightness < 0.8 ? "Suggested: Paper, snow"
    : "Too bright — clamp or adjust.";
});

areaSizeSelect.addEventListener("change", () => {
  areaSize = parseInt(areaSizeSelect.value);
});

const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("drag-hover");
});
dropZone.addEventListener("dragleave", e => {
  e.preventDefault();
  dropZone.classList.remove("drag-hover");
});
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("drag-hover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    imageUpload.files = e.dataTransfer.files;
    imageUpload.dispatchEvent(new Event("change"));
  }
});

function toggleInfo(e) {
  const el = document.getElementById("pbrInfo");
  el.classList.toggle("hidden");
  e.currentTarget.textContent = el.classList.contains("hidden") ? "⚠ PBR Compliance ▾" : "⚠ PBR Compliance ▴";
}
function toggleSettings(e) {
  const el = document.getElementById("settingsPanel");
  el.classList.toggle("hidden");
  e.currentTarget.textContent = el.classList.contains("hidden") ? "Settings ▾" : "Settings ▴";
}
