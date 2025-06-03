export function showSlotMachine(images, balance, updateBalanceUI) {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2>Однорукий бандит</h2>
    <div class="slot-machine">
      <div class="slot"><div class="reel" id="reel1"></div></div>
      <div class="slot"><div class="reel" id="reel2"></div></div>
      <div class="slot"><div class="reel" id="reel3"></div></div>
    </div>
    <button id="spin-btn">Крутить</button>
    <div id="result"></div>
    <button onclick="location.reload()">Назад</button>
  `;

  const reels = ['reel1', 'reel2', 'reel3'];

  function getRandomItems(array, count) {
    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  document.getElementById('spin-btn').onclick = () => {
    if (balance.tokens < 10) {
      document.getElementById("result").textContent = "Недостаточно токенов!";
      return;
    }

    balance.tokens -= 10;
    updateBalanceUI();

    const slotPool = getRandomItems(images, 12);
    const selected = [];

    reels.forEach((id, index) => {
      const reel = document.getElementById(id);
      reel.innerHTML = '';

      for (let i = 0; i < 19; i++) {
        const item = slotPool[Math.floor(Math.random() * slotPool.length)];
        const img = document.createElement('img');
        img.src = item.image;
        reel.appendChild(img);
      }

      const final = slotPool[Math.floor(Math.random() * slotPool.length)];
      const finalImg = document.createElement('img');
      finalImg.src = final.image;
      reel.appendChild(finalImg);
      selected.push(final);

      reel.style.transition = 'none';
      reel.style.transform = 'translateY(0px)';
      setTimeout(() => {
        reel.style.transition = `transform ${1000 + index * 500}ms ease-out`;
        reel.style.transform = `translateY(${-180 * 19}px)`;
      }, 100);
    });

    setTimeout(() => {
      const names = selected.map(c => c.name);
      const imgs = selected.map(c => c.image);
      const allSameName = names.every(n => n === names[0]);

      let reward = 0;
      let msg = "😅 Попробуй ещё раз";

      if (allSameName) {
        const uniqueImgs = [...new Set(imgs)];
        if (uniqueImgs.length === 1) {
          reward = 300;
          msg = "🎉 Джекпот! +300 токенов!";
        } else if (uniqueImgs.length === 2) {
          reward = 150;
          msg = "🃏 2 совпали (один герой)! +150 токенов!";
        } else {
          reward = 50;
          msg = "🎨 Все разные, но один герой! +50 токенов!";
        }
      }

      balance.tokens += reward;
      document.getElementById("result").textContent = msg;
      updateBalanceUI();
    }, 2000);
  };
}
