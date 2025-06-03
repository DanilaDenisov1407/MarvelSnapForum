export function showPackOpen(images, balance, updateBalanceUI, auto = false) {
  const main = document.getElementById('main-content');
  const enough = balance.gold >= 50;

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
      balance.coins += 1000;
      balance.gold += 1000;
      balance.tokens += 1000;
      updateBalanceUI();

      showPackOpen(images, balance, updateBalanceUI);
    };

    return;
  }

  balance.gold -= 50;
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
    if (random?.image) {
      card.src = random.image;
      card.classList.add('visible');

      card.onerror = () => {
        console.warn("❌ Битое изображение:", random.image);
        card.remove();
      };
    } else {
      card.remove();
    }

    const btnContainer = document.getElementById('pack-buttons');
    btnContainer.innerHTML = '';

    const againBtn = document.createElement('button');
    againBtn.textContent = balance.gold >= 50 ? "Открыть ещё" : "Пополнить";
    againBtn.onclick = () => {
      if (balance.gold < 50) {
        balance.coins += 1000;
        balance.gold += 1000;
        balance.tokens += 1000;
        updateBalanceUI();
      }
      showPackOpen(images, balance, updateBalanceUI, true);
    };
    btnContainer.appendChild(againBtn);

    const backBtn = document.createElement('button');
    backBtn.textContent = "Назад";
    backBtn.onclick = () => location.reload();
    btnContainer.appendChild(backBtn);
  }

  if (auto) {
    setTimeout(openBox, 300);
  } else {
    document.getElementById('open-pack-btn').onclick = openBox;
  }
}
