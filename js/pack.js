let waitingForOpen = false;

export function showPackOpen(images, balance, updateBalanceUI, forceAutoOpen = false) {
  const main = document.getElementById('main-content');

  const enoughBalance = balance.gold >= 50 && balance.tokens >= 10;

  if (!enoughBalance) {
    main.innerHTML = `
      <h2>Недостаточно средств</h2>
      <div class="box-container">
        <div id="box" style="width:180px;height:180px;background:url('https://i.imgur.com/u1Ml2nW.png') center/contain no-repeat;"></div>
        <img id="card" class="card-reveal" />
      </div>
      <div id="pack-buttons">
        <button onclick="location.reload()">Назад</button>
      </div>
    `;
    waitingForOpen = true;
    return;
  }

  // Списываем ресурсы
  balance.gold -= 50;
  balance.tokens -= 10;
  updateBalanceUI();

  main.innerHTML = `
    <h2>Открытие пака 0% гарантии, что без пикселей</h2>
    <div class="box-container">
      <div id="box" style="width:180px;height:180px;background:url('https://i.imgur.com/u1Ml2nW.png') center/contain no-repeat;"></div>
      <img id="card" class="card-reveal" />
    </div>
    <div id="pack-buttons">
      <button id="open-pack-btn">Открыть</button>
      <button onclick="location.reload()">Назад</button>
    </div>
  `;

  const box = document.getElementById('box');
  const card = document.getElementById('card');

  function openBox() {
    box.remove();
    const random = images[Math.floor(Math.random() * images.length)];
    if (random && random.image) {
      card.src = random.image;
      card.classList.add('visible');
    } else {
      card.remove();
    }

    // Добавляем кнопку "Открыть ещё"
    const again = document.createElement('button');
    again.textContent = "Открыть ещё";
    again.onclick = () => showPackOpen(images, balance, updateBalanceUI, true);

    const openBtn = document.getElementById('open-pack-btn');
    if (openBtn) openBtn.remove();
    document.getElementById('pack-buttons').prepend(again);
  }

  if (forceAutoOpen) {
    setTimeout(openBox, 500);
  } else {
    document.getElementById('open-pack-btn').onclick = openBox;
  }
}

// 💡 В main.js добавь после addFunds() обновление экрана, если ждём открытия
import { showPackOpen } from './pack.js';

window.addFunds = function () {
  balance.coins += 2000;
  balance.gold += 2000;
  balance.tokens += 2000;
  updateBalanceUI();

  if (waitingForOpen) {
    waitingForOpen = false;
    showPackOpen(images, balance, updateBalanceUI);
  }
};
