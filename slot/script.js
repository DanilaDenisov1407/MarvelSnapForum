const reels = [
  document.getElementById("r0"),
  document.getElementById("r1"),
  document.getElementById("r2")
];

const resultDiv = document.getElementById("result");
const spinBtn = document.getElementById("spin");

let cards = [];

// Загрузка JSON
fetch("Cards.json")
  .then(res => res.json())
  .then(data => { cards = data; })
  .catch(err => { resultDiv.textContent = "⚠️ Не удалось загрузить Cards.json"; });

// Функция крутить слот
function spin() {
  if (cards.length === 0) return;

  reels.forEach(reel => {
    reel.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const img = document.createElement("img");
      img.src = cards[Math.floor(Math.random() * cards.length)];
      reel.appendChild(img);
    }
  });

  resultDiv.textContent = "🎉 Крутим!";
}

spinBtn.addEventListener("click", spin);
