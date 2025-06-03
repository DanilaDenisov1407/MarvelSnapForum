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

      // Показываем кнопку "Открыть ещё", но не запускаем автооткрытие
      main.innerHTML = `
        <h2>Готов к открытию!</h2>
        <div class="box-container">
          <div id="box" style="width:180px;height:180px;background:url('https://i.imgur.com/u1Ml2nW.png') center/contain no-repeat;"></div>
          <img id="card" class="card-reveal" />
        </div>
        <div id="pack-buttons">
          <button id="open-next">Открыть ещё</button>
          <button onclick="location.reload()">Назад</button>
        </div>
      `;

      document.getElementById('open-next').onclick = () =>
        showPackOpen(images, balance, updateBalanceUI, true);
    };

    return;
  }

  // Списываем баланс
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
    if (random && random.image) {
      card.src = random.image;
      card.classList.add('visible');

      // 💡 Защита от битых ссылок
      card.onerror = () => {
        console.warn("❌ Битое изображение:", random.image);
        card.remove();
      };
    } else {
      card.remove(); // если данных нет
    }

    const btnContainer = document.getElementById('pack-buttons');

    if (balance.gold >= 50 && balance.tokens >= 10) {
      const againBtn = document.createElement('button');
      againBtn.textContent = "Открыть ещё";
      againBtn.onclick = () => showPackOpen(images, balance, updateBalanceUI, true);
      btnContainer.prepend(againBtn);
    } else {
      const topupBtn = document.createElement('button');
      topupBtn.textContent = "Пополнить";
      topupBtn.onclick = () => {
        balance.coins += 2000;
        balance.gold += 2000;
        balance.tokens += 2000;
        updateBalanceUI();

        // После пополнения — показать "Открыть ещё" вручную
        const openNext = document.createElement('button');
        openNext.textContent = "Открыть ещё";
        openNext.onclick = () => showPackOpen(images, balance, updateBalanceUI, true);

        btnContainer.innerHTML = '';
        btnContainer.appendChild(openNext);

        const backBtn = document.createElement('button');
        backBtn.textContent = "Назад";
        backBtn.onclick = () => location.reload();
        btnContainer.appendChild(backBtn);
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
