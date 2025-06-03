let autoOpenNext = false;

export function showPackOpen(images, balance, updateBalanceUI, auto = false) {
  const main = document.getElementById('main-content');

  const enough = balance.gold >= 50 && balance.tokens >= 10;

  if (!enough) {
    main.innerHTML = `
      <h2>Недостаточно средств</h2>
      <div class="box-container">
        <div id="box" style="width:180px;height:180px;background:url('https://i.imgur.com/u1Ml2nW.png') center/contain no-repeat;"></div>
        <img id="card" class="card-reveal" />
      </div>
      <div id="pack-buttons">
        <button id="top-up">Пополнить</button>
        <button onclick="location.reload()">Назад</button>
      </div>
    `;

    document.getElementById('top-up').onclick = () => {
      balance.coins += 2000;
      balance.gold += 2000;
      balance.tokens += 2000;
      updateBalanceUI();

      // После пополнения — пробуем открыть новый пак
      showPackOpen(images, balance, updateBalanceUI, true);
    };

    return;
  }

  // Списываем баланс
  balance.gold -= 50;
  balance.tokens -= 10;
  updateBalanceUI();

  main.innerHTML = `
    <h2>Открытие пака</h2>
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

    const againBtn = document.createElement('button');
    againBtn.textContent = "Открыть ещё";
    againBtn.onclick = () => showPackOpen(images, balance, updateBalanceUI, true);

    const btnContainer = document.getElementById('pack-buttons');

    if (balance.gold >= 50 && balance.tokens >= 10) {
      btnContainer.prepend(againBtn);
    } else {
      const topupBtn = document.createElement('button');
      topupBtn.textContent = "Пополнить";
      topupBtn.onclick = () => {
        balance.coins += 2000;
        balance.gold += 2000;
        balance.tokens += 2000;
        updateBalanceUI();
        showPackOpen(images, balance, updateBalanceUI, true);
      };
      btnContainer.prepend(topupBtn);
    }

    const openBtn = document.getElementById('open-pack-btn');
    if (openBtn) openBtn.remove();
  }

  if (auto) {
    setTimeout(openBox, 300);
  } else {
    document.getElementById('open-pack-btn').onclick = openBox;
  }
}
