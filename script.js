const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageCanvas = document.createElement("canvas");
const imageCtx = imageCanvas.getContext("2d");
const brightnessEl = document.getElementById("brightness");
const statusEl = document.getElementById("status");
const upload = document.getElementById("upload");

let img = new Image();
let size = 64;

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      const scale = Math.min(1024 / img.width, 1024 / img.height, 1);
      canvas.width = imageCanvas.width = Math.floor(img.width * scale);
      canvas.height = imageCanvas.height = Math.floor(img.height * scale);
      imageCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      draw();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener("mousemove", (e) => {
  draw();
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left));
  const y = Math.floor((e.clientY - rect.top));
  drawSampleRect(x, y);
});

function draw() {
  ctx.drawImage(imageCanvas, 0, 0);
  const showOverlay = document.getElementById("showOverlay").checked;
  if (showOverlay) {
    const overlay = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const original = imageCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const minRange = parseFloat(document.getElementById("minRange").value);
    const maxRange = parseFloat(document.getElementById("maxRange").value);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const r = original[index] / 255;
        const g = original[index + 1] / 255;
        const b = original[index + 2] / 255;
        const rLin = srgbToLinear(r);
        const gLin = srgbToLinear(g);
        const bLin = srgbToLinear(b);
        const bright = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;

        if (bright < minRange) {
          overlay.data[index] = 255;
          overlay.data[index + 1] = 0;
          overlay.data[index + 2] = 0;
          overlay.data[index + 3] = 178;
        } else if (bright > maxRange) {
          overlay.data[index] = 128;
          overlay.data[index + 1] = 0;
          overlay.data[index + 2] = 128;
          overlay.data[index + 3] = 178;
        }
      }
    }
    ctx.putImageData(overlay, 0, 0);
  }
}

function drawSampleRect(x, y) {
  const startX = Math.max(0, Math.min(canvas.width - size, x - size / 2));
  const startY = Math.max(0, Math.min(canvas.height - size, y - size / 2));
  const imageData = imageCtx.getImageData(startX, startY, size, size);
  const data = imageData.data;

  let rSum = 0, gSum = 0, bSum = 0;
  const pixelCount = size * size;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    rSum += srgbToLinear(r);
    gSum += srgbToLinear(g);
    bSum += srgbToLinear(b);
  }

  const rAvg = rSum / pixelCount;
  const gAvg = gSum / pixelCount;
  const bAvg = bSum / pixelCount;

  const brightness = 0.2126 * rAvg + 0.7152 * gAvg + 0.0722 * bAvg;
  brightnessEl.textContent = brightness.toFixed(4);

  const min = parseFloat(document.getElementById("minRange").value);
  const max = parseFloat(document.getElementById("maxRange").value);
  if (brightness < min || brightness > max) {
    statusEl.textContent = "Out of range";
    statusEl.style.color = "#F08080";
  } else {
    statusEl.textContent = "In range";
    statusEl.style.color = "#4CAF50";
  }

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

  ctx.strokeStyle = "rgba(255, 255, 255, 1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, startY, size, size);
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
