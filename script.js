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

  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  const x = Math.floor(e.offsetX * scaleX);
  const y = Math.floor(e.offsetY * scaleY);

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

    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    rSrgbSum += r;
    gSrgbSum += g;
    bSrgbSum += b;

    rLinSum += srgbToLinear(rNorm);
    gLinSum += srgbToLinear(gNorm);
    bLinSum += srgbToLinear(bNorm);
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
  const suggestionEl = document.getElementById("materialSuggestion");
  if (brightness < 0.04) {
    suggestionEl.textContent = "Suggested: Charcoal, soot, black rubber";
  } else if (brightness < 0.1) {
    suggestionEl.textContent = "Suggested: Asphalt, dark fabric, soil";
  } else if (brightness < 0.2) {
    suggestionEl.textContent = "Suggested: Wood, leather, concrete";
  } else if (brightness < 0.4) {
    suggestionEl.textContent = "Suggested: Dry sand, bricks, skin tones";
  } else if (brightness < 0.6) {
    suggestionEl.textContent = "Suggested: Painted surfaces, plastic, cloth";
  } else if (brightness < 0.8) {
    suggestionEl.textContent = "Suggested: Snow, paper, light stone";
  } else {
    suggestionEl.textContent = "Suggested: Too bright – clamp or recheck";
  }

  const statusEl = document.getElementById("status");
  const minRange = parseFloat(document.getElementById("minRange").value);
  const maxRange = parseFloat(document.getElementById("maxRange").value);
  if (brightness >= minRange && brightness <= maxRange) {
    statusEl.textContent = "✔ In range";
    statusEl.style.color = "#4CAF50";
  } else {
    statusEl.textContent = "✖ Out of range";
    statusEl.style.color = "#F08080";
  }

  ctx.drawImage(imageCanvas, 0, 0);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  
  const showOverlay = document.getElementById("showOverlay").checked;
  if (showOverlay) {
    const overlayImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const overlayData = overlayImage.data;
    const imgFull = imageCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const minRange = parseFloat(document.getElementById("minRange").value);
    const maxRange = parseFloat(document.getElementById("maxRange").value);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const r = imgFull[index] / 255;
        const g = imgFull[index + 1] / 255;
        const b = imgFull[index + 2] / 255;
        const rLin = srgbToLinear(r);
        const gLin = srgbToLinear(g);
        const bLin = srgbToLinear(b);
        const bright = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
        if (bright < minRange) {
          const check = ((x >> 2) + (y >> 2)) % 2 === 0;
          overlayData[index] = check ? 255 : 255;
          overlayData[index + 1] = check ? 0 : 255;
          overlayData[index + 2] = check ? 0 : 255;
          overlayData[index + 3] = 178;
        } else if (bright > maxRange) {
          const check = ((x >> 2) + (y >> 2)) % 2 === 0;
          overlayData[index] = check ? 128 : 255;
          overlayData[index + 1] = check ? 0 : 255;
          overlayData[index + 2] = check ? 128 : 255;
          overlayData[index + 3] = 178;
        }
      }
    }
    ctx.putImageData(overlayImage, 0, 0);
  }
  ctx.strokeRect(startX, startY, size, size);
});

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

areaSizeSelect.addEventListener("change", () => {
  areaSize = parseInt(areaSizeSelect.value);
});
