// Элементы
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const captureImage = document.getElementById("captureImage");
const scaledCaptureImage = document.getElementById("scaledCaptureImage");

const rarityInput = document.getElementById("rarityInput");
const rarityText = document.getElementById("rarityText");
const captureRarityText = document.getElementById("captureRarityText");
const scaledRarityText = document.getElementById("scaledRarityText");

const rarityStyleSelect = document.getElementById("rarityStyleSelect");

const authorInput = document.getElementById("authorInput");
const authorText = document.getElementById("authorText");
const captureAuthorText = document.getElementById("captureAuthorText");
const scaledAuthorText = document.getElementById("scaledAuthorText");

const priceInput = document.getElementById("priceInput");
const costText = document.getElementById("costText");
const captureCostText = document.getElementById("captureCostText");
const scaledCaptureCostText = document.getElementById("scaledCaptureCostText");

const iconSelect = document.getElementById("iconSelect");
const iconImg = document.getElementById("iconImg");
const captureIconImg = document.getElementById("captureIconImg");
const scaledCaptureIconImg = document.getElementById("scaledCaptureIconImg");

const priceLabelCheckbox = document.getElementById("priceLabelCheckbox");
const authorLabelCheckbox = document.getElementById("authorLabelCheckbox");
const iconCheckbox = document.getElementById("iconCheckbox");

const resetButton = document.getElementById("resetButton");
const downloadButton = document.getElementById("downloadButton");

// === Обновление всех контейнеров ===
function updateCaptureContainers() {
  // Редкость
  const rarityValue = rarityInput.value || rarityStyleSelect.options[rarityStyleSelect.selectedIndex].text;
  const rarityClass = rarityStyleSelect.value;

  [rarityText, captureRarityText, scaledRarityText].forEach(el => {
    el.textContent = rarityValue;
    el.className = "rarity-block " + rarityClass;
  });

  // Автор
  [authorText, captureAuthorText, scaledAuthorText].forEach(el => {
    el.querySelector(".author-name").textContent = authorInput.value || "Kim Jacinto";
    el.querySelector(".author-label").style.display = authorLabelCheckbox.checked ? "inline" : "none";
  });

  // Цена
  [costText, captureCostText, scaledCaptureCostText].forEach(el => {
    el.textContent = priceInput.value || "1200";
  });

  document.querySelectorAll(".price-label").forEach(el => {
    el.style.display = priceLabelCheckbox.checked ? "inline" : "none";
  });

  // Иконка
  [iconImg, captureIconImg, scaledCaptureIconImg].forEach(el => {
    el.src = iconSelect.value;
    el.style.display = iconCheckbox.checked ? "inline" : "none";
  });
}

// === Слушатели ===
imageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = evt => {
      previewImage.src = evt.target.result;
      captureImage.src = evt.target.result;
      scaledCaptureImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

[rarityInput, rarityStyleSelect, authorInput, priceInput,
 iconSelect, priceLabelCheckbox, authorLabelCheckbox, iconCheckbox]
.forEach(input => input.addEventListener("input", updateCaptureContainers));

resetButton.addEventListener("click", () => {
  rarityInput.value = "";
  rarityStyleSelect.value = "rare";
  authorInput.value = "";
  priceInput.value = "";
  priceLabelCheckbox.checked = true;
  authorLabelCheckbox.checked = true;
  iconCheckbox.checked = true;
  iconSelect.value = "./img/icons/gold-icon.webp";
  previewImage.src = "./img/card-preview.webp";
  captureImage.src = "./img/card-preview.webp";
  scaledCaptureImage.src = "./img/card-preview.webp";
  updateCaptureContainers();
});

// === Скачать PNG ===
downloadButton.addEventListener("click", () => {
  updateCaptureContainers();
  const node = document.getElementById("scaledCaptureContainer");

  html2canvas(node, { useCORS: true }).then(canvas => {
    const link = document.createElement("a");
    link.download = "card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

// Первичная инициализация
updateCaptureContainers();
