// JavaScript placeholder - actual script should be from previous working version

function scrollToClosestMaterial(brightness) {
  const list = document.getElementById("suggestionList");
  const items = Array.from(list.children);
  let closest = items[0];
  let closestDiff = Math.abs(brightness - parseFloat(closest.dataset.brightness));
  for (let item of items) {
    const b = parseFloat(item.dataset.brightness);
    const diff = Math.abs(brightness - b);
    if (diff < closestDiff) {
      closest = item;
      closestDiff = diff;
    }
  }
  closest.scrollIntoView({ behavior: "smooth", block: "center" });
  items.forEach(i => i.style.backgroundColor = "");
  closest.style.backgroundColor = "#e0f0ff";
}
