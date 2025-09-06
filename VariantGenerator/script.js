const fileInput = document.getElementById("fileInput");
const cardImage = document.getElementById("cardImage");
const raritySelect = document.getElementById("raritySelect");
const rarityLabel = document.getElementById("rarityLabel");
const card = document.getElementById("card");
const priceInput = document.getElementById("priceInput");
const priceEl = document.getElementById("price");
const currencySelect = document.getElementById("currencySelect");
const artistInput = document.getElementById("artistInput");
const artistEl = document.getElementById("artist");
const downloadPngBtn = document.getElementById("downloadPng");
const downloadGifBtn = document.getElementById("downloadGif");

let uploadedFile = null;

// загрузка файла
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    cardImage.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// выбор редкости
raritySelect.addEventListener("change", () => {
  const rarity = raritySelect.value;
  rarityLabel.innerText = rarity;

  card.classList.remove("Bundle", "Conquest", "Rare");

  if (rarity === "Bundle") {
    card.classList.add("Bundle");
  } else if (rarity === "Conquest Reward") {
    card.classList.add("Conquest");
  } else if (rarity === "Rare") {
    card.classList.add("Rare");
  }
});

// цена
priceInput.addEventListener("input", () => {
  priceEl.innerText = "Цена: " + priceInput.value + " " + currencySelect.value;
});
currencySelect.addEventListener("change", () => {
  priceEl.innerText = "Цена: " + priceInput.value + " " + currencySelect.value;
});

// художник
artistInput.addEventListener("input", () => {
  artistEl.innerText = "Художник: " + artistInput.value;
});

// скачать PNG (скриншот карточки)
downloadPngBtn.addEventListener("click", () => {
  html2canvas(card, {
    backgroundColor: "#000"
  }).then((canvas) => {
    canvas.toBlob((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "card.png";
      link.click();
    }, "image/png");
  });
});

// скачать GIF
downloadGifBtn.addEventListener("click", () => {
  if (!uploadedFile || !uploadedFile.type.includes("gif")) {
    alert("Загрузите GIF файл!");
    return;
  }

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: card.offsetWidth,
    height: card.offsetHeight,
    workerScript: "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js"
  });

  let frameCount = 15; // кадров для анимации
  let delay = 150; // задержка между кадрами

  let captured = 0;
  function captureFrame() {
    html2canvas(card, { backgroundColor: "#000" }).then((canvas) => {
      gif.addFrame(canvas, { delay: delay });
      captured++;
      if (captured < frameCount) {
        requestAnimationFrame(captureFrame);
      } else {
        gif.on("finished", (blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "card.gif";
          link.click();
        });
        gif.render();
      }
    });
  }

  captureFrame();
});
