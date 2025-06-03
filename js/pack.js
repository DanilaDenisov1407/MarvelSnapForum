export function showPackOpen(images, balance, updateBalanceUI) {
  const main = document.getElementById('main-content');

  if (balance.gold < 50 || balance.tokens < 10) {
    main.innerHTML = `<h2>Недостаточно средств</h2><button onclick="location.reload()">Назад</button>`;
    return;
  }

  balance.gold -= 50;
  balance.tokens -= 10;
  updateBalanceUI();

  main.innerHTML = `
    <h2>Открытие пака 0% гарантии что без пикселей</h2>
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

  document.getElementById('open-pack-btn').onclick = () => {
    box.remove();
    const random = images[Math.floor(Math.random() * images.length)];
    card.src = random.image;
    card.classList.add('visible');

    const again = document.createElement('button');
    again.textContent = "Открыть ещё";
    again.onclick = () => showPackOpen(images, balance, updateBalanceUI);

    document.getElementById('open-pack-btn').remove();
    document.getElementById('pack-buttons').prepend(again);
  };
}
