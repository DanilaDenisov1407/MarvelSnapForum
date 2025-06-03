export function showSlotMachine(images, balance, updateBalanceUI) {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2>Слот Машина</h2>
    <div class="slot-machine">
      <div class="slot"><div class="reel" id="reel1"></div></div>
      <div class="slot"><div class="reel" id="reel2"></div></div>
      <div class="slot"><div class="reel" id="reel3"></div></div>
    </div>
    <button id="spin-btn">Крутить</button>
    <div id="result" style="margin-top: 15px; font-weight: bold;"></div>
    <button onclick="location.reload()">Назад</button>
  `;

  const reels = ['reel1', 'reel2', 'reel3'];

  function getRandomItems(array, count) {
    return array.slice().sort(() => 0.5 - Math.random()).slice(0, count);
  }

  document.getElementById('spin-btn').onclick = () => {
    if (balance.tokens < 10) {
      document.getElementById("result").textContent = "Недостаточно токенов!";
      return;
    }

    balance.tokens -= 10;
    updateBalanceUI();

    const slotPool = getRandomItems(images, 12);
    const finalImages = [];

    reels.forEach((id, index) => {
      const reel = document.getElementById(id);
      reel.innerHTML = '';

      for (let i = 0; i < 18; i++) {
        const fake = new Image();
        fake.src = slotPool[Math.floor(Math.random() * slotPool.length)].image;
        fake.onerror = () => fake.remove();
        reel.appendChild(fake);
      }

      const final = slotPool[Math.floor(Math.random() * slotPool.length)];
      finalImages.push(final);

      const img = new Image();
      img.src = final.image;
      img.onerror = () => img.remove();
      reel.appendChild(img);

      reel.style.transition = 'none';
      reel.style.transform = 'translateY(0px)';
      setTimeout(() => {
        reel.style.transition = `transform ${1000 + index * 500}ms ease-out`;
        reel.style.transform = `translateY(${-180 * 18}px)`;
      }, 100);
    });

    setTimeout(() => {
      const names = finalImages.map(c => c.name);
      const sketchers = finalImages.map(c => (c.sketcher || '').trim());

      const sameName = names.every(n => n === names[0]);
      const allSameSketcher = sketchers.every(s => s === sketchers[0]);
      const uniqueSketchers = [...new Set(sketchers)];
      const sketcherMatchCount = sketchers.filter(s => s === sketchers[0]).length;

      let reward = 0;
      let msg = "😅 Попробуй ещё раз";

      const jackpot = sameName && allSameSketcher && Math.random() < 0.01;

      if (jackpot) {
        reward = 500;
        msg = "🎉 Джекпот! +500 токенов!";
      } else if (sameName && sketcherMatchCount >= 2) {
        reward = 250;
        msg = "✨ Почти джекпот! +250 токенов!";
      } else if (sameName && uniqueSketchers.length === 3) {
        reward = 100;
        msg = "🔥 Один герой, разные стили! +100 токенов!";
      } else if (!sameName && allSameSketcher && sketchers[0].length > 3) {
        reward = 50;
        msg = "🎨 Один художник! +50 токенов!";
      }

      balance.tokens += reward;
      document.getElementById('result').textContent = msg;
      updateBalanceUI();
    }, 2200);
  };
}
