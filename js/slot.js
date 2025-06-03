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
    <div id="result" style="margin-top: 15px; font-weight: bold;"></div>
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
        img.onerror = () => img.remove();
        reel.appendChild(img);
      }

      const final = slotPool[Math.floor(Math.random() * slotPool.length)];
      reel.dataset.final = JSON.stringify(final);

      const finalImg = document.createElement('img');
      finalImg.src = final.image;
      finalImg.onerror = () => finalImg.remove();
      reel.appendChild(finalImg);

      reel.style.transition = 'none';
      reel.style.transform = 'translateY(0px)';
      setTimeout(() => {
        reel.style.transition = `transform ${1000 + index * 500}ms ease-out`;
        reel.style.transform = `translateY(${-180 * 19}px)`;
      }, 100);
    });

    setTimeout(() => {
      const selected = [];
      reels.forEach(id => {
        const data = document.getElementById(id).dataset.final;
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.image) {
              selected.push(parsed);
            }
          } catch (e) {}
        }
      });

      if (selected.length < 3) {
        document.getElementById("result").textContent = "Ошибка загрузки результатов.";
        return;
      }

      const names = selected.map(c => c.name);
      const sketchers = selected.map(c => (c.sketcher || '').trim());

      const sameName = names.every(n => n === names[0]);
      const allSameSketcher = sketchers.length === 3 && sketchers.every(s => s === sketchers[0]);
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
      } else if (!sameName && allSameSketcher && sketchers[0] && sketchers[0].length > 3) {
        reward = 50;
        msg = "🎨 Один художник! +50 токенов!";
      }

      balance.tokens += reward;
      document.getElementById('result').textContent = msg;
      updateBalanceUI();
    }, 2200); // подстраховка на длительность анимации
  };
}
