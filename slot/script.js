// ============================================================
//  Marvel Snap Slot Machine — script.js v3
//  Фикс: надёжная остановка барабанов, нет "Ошибка анимации"
// ============================================================

const CARDS_API = 'https://script.google.com/macros/s/AKfycbx3jwUPotluP3qIHNvM6HiizPdLU-QJQdcTKMJiOXpaWnR606yj9gWe1fj32sEGrve78Q/exec';
const reelIds   = ['reel1', 'reel2', 'reel3'];

// ── Состояние ────────────────────────────────
let spinning     = false;
let animationIds = [null, null, null];
let positions    = [0, 0, 0];
let isSpinning   = [false, false, false];
let stoppedCount = 0;           // сколько барабанов финально остановились
let finalSymbols = [null, null, null];
let stopIndices  = [0, 0, 0];   // индексы в slotSymbols (НЕ в пуле)

// ── Данные ───────────────────────────────────
let characters   = [];
let slotSymbols  = [];   // [{characterId, name, url, series, rarity}]
let reelPool     = [];   // slotSymbols повторённые N раз
let settings     = { jackpot_chance: 0.0001, win_chance: 0.05, slot_title: 'Слот-Машина у Баки' };
let symbolHeight = 200;
let reelHeight   = 0;

// ─────────────────────────────────────────────
//  ЗАГРУЗКА ДАННЫХ
// ─────────────────────────────────────────────
async function loadCards() {
  const btn = document.getElementById('spinBtn');
  setStatus('Загрузка карт...');
  btn.disabled = true;
  btn.textContent = 'Загрузка...';

  try {
    const res  = await fetch(CARDS_API);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    if (data.settings) settings = { ...settings, ...data.settings };
    if (settings.slot_title) document.querySelector('h1').textContent = settings.slot_title;

    characters = (data.characters || []).filter(c => c.variants && c.variants.length > 0);
    if (characters.length === 0) throw new Error('Нет персонажей');

    buildSlotSymbols();
    setStatus('Проверка картинок... ' + slotSymbols.length + ' шт.');
    await filterBrokenImages();
    if (slotSymbols.length === 0) throw new Error('Все картинки битые!');

    initReels();
    btn.disabled    = false;
    btn.textContent = 'Крутить!';
    setStatus('');
  } catch (err) {
    console.error('Ошибка:', err);
    setStatus('Резервный режим');
    useFallback();
  }
}

function buildSlotSymbols() {
  slotSymbols = characters.map(function(char) {
    var url = char.variants[Math.floor(Math.random() * char.variants.length)];
    return { characterId: char.id, name: char.name, series: char.series || '', rarity: char.rarity || '', cost: char.cost || 0, url: url };
  }).sort(function() { return Math.random() - 0.5; });
}

// ─────────────────────────────────────────────
//  ФИЛЬТР БИТЫХ КАРТИНОК (батчами по 20)
// ─────────────────────────────────────────────
async function filterBrokenImages() {
  var BATCH = 20, TIMEOUT = 5000;
  var valid = [];
  for (var i = 0; i < slotSymbols.length; i += BATCH) {
    var batch   = slotSymbols.slice(i, i + BATCH);
    var results = await Promise.all(batch.map(function(s) { return checkImage(s.url, TIMEOUT); }));
    batch.forEach(function(s, j) { if (results[j]) valid.push(s); });
    setStatus('Проверено ' + Math.min(i + BATCH, slotSymbols.length) + '/' + slotSymbols.length + ' ок: ' + valid.length);
  }
  slotSymbols = valid;
}

function checkImage(url, ms) {
  return new Promise(function(resolve) {
    if (!url || url.indexOf('http') !== 0) return resolve(false);
    var img = new Image();
    var t   = setTimeout(function() { img.src = ''; resolve(false); }, ms);
    img.onload  = function() { clearTimeout(t); resolve(img.naturalWidth > 0); };
    img.onerror = function() { clearTimeout(t); resolve(false); };
    img.src = url;
  });
}

// ─────────────────────────────────────────────
//  ИНИЦИАЛИЗАЦИЯ БАРАБАНОВ
// ─────────────────────────────────────────────
function initReels() {
  symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);

  // 6 повторений — достаточно места чтобы найти цель впереди текущей позиции
  var repeatCount = 6;
  reelPool = [];
  for (var r = 0; r < repeatCount; r++) {
    slotSymbols.forEach(function(s) { reelPool.push(s); });
  }
  reelHeight = reelPool.length * symbolHeight;

  reelIds.forEach(function(reelId, index) {
    var reel = document.getElementById(reelId);
    reel.innerHTML = '';
    reel.style.transition = '';

    reelPool.forEach(function(sym) {
      var div = document.createElement('div');
      div.className = 'symbol';
      var img = document.createElement('img');
      img.src   = sym.url;
      img.alt   = sym.name || '';
      img.title = sym.name + ' | ' + sym.series + ' | ' + sym.rarity;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
      img.onerror = function() { div.style.opacity = '0'; };
      div.appendChild(img);
      reel.appendChild(div);
    });

    // Стартуем из первого повторения
    var startIdx = Math.floor(Math.random() * slotSymbols.length);
    positions[index] = -(startIdx * symbolHeight);
    reel.style.transform = 'translateY(' + positions[index] + 'px)';
  });
}

// ─────────────────────────────────────────────
//  АНИМАЦИЯ ОДНОГО БАРАБАНА
// ─────────────────────────────────────────────
function startReelAnimation(index) {
  var reel     = document.getElementById(reelIds[index]);
  var isMobile = window.innerWidth < 480;
  var accel    = isMobile ? 3 : 5;
  var maxSpeed = isMobile ? 16 : 24;

  var speed    = 0;
  var lastTime = performance.now();
  var landing  = false;

  function animate(now) {
    var delta = now - lastTime;
    lastTime  = now;

    // Сигнал остановки получен — ищем цель и плавно доезжаем
    if (!isSpinning[index] && !landing) {
      landing = true;

      var targetSym  = slotSymbols[stopIndices[index]];
      var currentRow = Math.round(-positions[index] / symbolHeight);

      // Ищем ближайший targetSym в пуле ВПЕРЁД от текущей позиции (минимум +2 строки)
      var targetRow = -1;
      for (var i = currentRow + 2; i < reelPool.length; i++) {
        if (reelPool[i] && reelPool[i].url === targetSym.url) {
          targetRow = i;
          break;
        }
      }
      // Fallback — первое вхождение в пуле
      if (targetRow === -1) {
        for (var j = 0; j < reelPool.length; j++) {
          if (reelPool[j] && reelPool[j].url === targetSym.url) {
            targetRow = j;
            break;
          }
        }
      }
      // Крайний fallback
      if (targetRow === -1) targetRow = stopIndices[index];

      var targetPos = -(targetRow * symbolHeight);

      // Плавный доезд через CSS transition
      reel.style.transition = 'transform 0.45s cubic-bezier(0.33, 1, 0.68, 1)';
      reel.style.transform  = 'translateY(' + targetPos + 'px)';
      positions[index]      = targetPos;
      animationIds[index]   = null;

      // После transition фиксируем результат
      setTimeout(function() {
        reel.style.transition = '';
        finalSymbols[index]   = targetSym;
        stoppedCount++;
        if (stoppedCount === 3) finishSpin();
      }, 460);

      return;
    }

    if (landing) return;

    // Разгон и кручение
    speed = Math.min(maxSpeed, speed + accel * (delta / 16.67));
    positions[index] -= speed;

    // Зацикливание — когда ушли в первые 60% пула, прыгаем назад на 30%
    if (-positions[index] > reelPool.length * 0.6 * symbolHeight) {
      positions[index] += Math.floor(reelPool.length * 0.3) * symbolHeight;
    }

    reel.style.transform = 'translateY(' + Math.round(positions[index]) + 'px)';
    animationIds[index]  = requestAnimationFrame(animate);
  }

  animationIds[index] = requestAnimationFrame(animate);
}

// ─────────────────────────────────────────────
//  СПИН
// ─────────────────────────────────────────────
function spin() {
  if (spinning || slotSymbols.length === 0) return;
  spinning     = true;
  stoppedCount = 0;
  finalSymbols = [null, null, null];

  document.getElementById('spinBtn').disabled    = true;
  document.getElementById('spinBtn').textContent = 'Крутит...';
  document.getElementById('result').textContent  = '';
  document.getElementById('result').className    = 'result';

  var roll    = Math.random();
  var JACKPOT = settings.jackpot_chance || 0.0001;
  var WIN     = settings.win_chance     || 0.05;

  if (roll < JACKPOT) {
    // Джекпот — три одинаковых
    var idx = Math.floor(Math.random() * slotSymbols.length);
    stopIndices = [idx, idx, idx];

  } else if (roll < JACKPOT + WIN) {
    // Победа — три варианта одного персонажа
    var winners = characters.filter(function(c) { return c.variants.length >= 3; });
    var pool    = winners.length > 0 ? winners : characters;
    var winner  = pool[Math.floor(Math.random() * pool.length)];
    var picks   = winner.variants.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);

    stopIndices = picks.map(function(url) {
      var idx2 = slotSymbols.findIndex(function(s) { return s.url === url; });
      if (idx2 === -1) {
        var newSym = { characterId: winner.id, name: winner.name, url: url, series: winner.series || '', rarity: winner.rarity || '' };
        slotSymbols.push(newSym);
        reelPool.push(newSym); // добавляем в конец пула
        idx2 = slotSymbols.length - 1;
      }
      return idx2;
    });

  } else {
    // Случайный результат
    stopIndices = [0, 1, 2].map(function() { return Math.floor(Math.random() * slotSymbols.length); });
  }

  setTimeout(function() {
    reelIds.forEach(function(_, i) {
      isSpinning[i] = true;
      if (animationIds[i]) cancelAnimationFrame(animationIds[i]);
      startReelAnimation(i);
    });

    var isMobile = window.innerWidth < 480;
    var delays   = isMobile ? [1200, 1900, 2600] : [1800, 2700, 3600];
    delays.forEach(function(delay, i) {
      setTimeout(function() { isSpinning[i] = false; }, delay);
    });

    // Страховка 6с — заполняем finalSymbols и финишируем принудительно
    setTimeout(function() {
      if (!spinning) return;
      finalSymbols = finalSymbols.map(function(s, i) {
        return s || slotSymbols[stopIndices[i]] || slotSymbols[0];
      });
      finishSpin();
    }, 6000);

  }, 150);
}

// ─────────────────────────────────────────────
//  ФИНИШ
// ─────────────────────────────────────────────
function finishSpin() {
  if (!spinning) return;
  spinning = false;

  reelIds.forEach(function(_, i) {
    isSpinning[i] = false;
    if (animationIds[i]) { cancelAnimationFrame(animationIds[i]); animationIds[i] = null; }
  });

  var btn    = document.getElementById('spinBtn');
  var result = document.getElementById('result');
  btn.disabled    = false;
  btn.textContent = 'Крутить!';

  // Страховка от null
  finalSymbols = finalSymbols.map(function(s, i) {
    return s || slotSymbols[stopIndices[i]] || slotSymbols[0];
  });

  var s   = finalSymbols;
  var ids = s.map(function(sym) { return sym ? sym.characterId : null; });

  if (s[0].url === s[1].url && s[1].url === s[2].url) {
    result.innerHTML = '<b>ДЖЕКПОТ!</b> Три одинаковых! 🎉🎉🎉';
    result.className = 'result win jackpot';
    launchConfetti(80);

  } else if (ids[0] && ids[0] === ids[1] && ids[1] === ids[2]) {
    result.innerHTML = '<b>ПОБЕДА!</b> Три ' + s[0].name + '! Красавчик! 🎊';
    result.className = 'result win';
    launchConfetti(50);

  } else if (ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2]) {
    var pairName = (ids[0] === ids[1] || ids[0] === ids[2]) ? s[0].name : s[1].name;
    result.textContent = 'Почти! Два ' + pairName + ' — ещё разок! 😬';
    result.className   = 'result near';

  } else {
    var phrases = [
      'Мимо! 😅 Бака-машина не жалеет никого',
      'Не повезло! 💸 Попробуй ещё',
      'Слот смеётся над тобой 😈',
      'Облом! Карты не в твою пользу 🃏'
    ];
    result.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    result.className   = 'result lose';
  }
}

// ─────────────────────────────────────────────
//  КОНФЕТТИ
// ─────────────────────────────────────────────
function launchConfetti(count) {
  count = count || 50;
  var colors = ['#FFD700','#FF4500','#00BFFF','#FF69B4','#7FFF00','#FF1493'];
  for (var i = 0; i < count; i++) {
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:-10px;pointer-events:none;z-index:9999;'
      + 'left:' + (Math.random()*100) + 'vw;'
      + 'width:' + (6+Math.random()*8) + 'px;height:' + (6+Math.random()*8) + 'px;'
      + 'background:' + colors[Math.floor(Math.random()*colors.length)] + ';'
      + 'border-radius:' + (Math.random()>.5?'50%':'2px') + ';'
      + 'animation:confettiFall ' + (1.5+Math.random()*2) + 's ease-in forwards;'
      + 'animation-delay:' + (Math.random()*0.6) + 's;';
    document.body.appendChild(el);
    el.addEventListener('animationend', function() { this.remove(); });
  }
}

// ─────────────────────────────────────────────
//  УТИЛИТЫ
// ─────────────────────────────────────────────
function setStatus(msg) {
  var el = document.getElementById('result');
  if (el) el.textContent = msg;
}

function useFallback() {
  var emojis = ['🍋','🍒','🍊','🍇','🔔','⭐','💎','🃏','🎯','🏆'];
  characters  = emojis.map(function(e, i) { return {id:String(i), name:e, variants:[e], series:'', rarity:''}; });
  slotSymbols = characters.map(function(c) { return {characterId:c.id, name:c.name, url:c.variants[0], series:'', rarity:''}; });
  symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);
  reelPool = [];
  for (var r = 0; r < 6; r++) slotSymbols.forEach(function(s) { reelPool.push(s); });
  reelHeight = reelPool.length * symbolHeight;

  reelIds.forEach(function(reelId, index) {
    var reel = document.getElementById(reelId);
    reel.innerHTML = '';
    reelPool.forEach(function(sym) {
      var div = document.createElement('div');
      div.className = 'symbol';
      div.style.cssText = 'font-size:' + (symbolHeight*.55) + 'px;line-height:' + symbolHeight + 'px;text-align:center;';
      div.textContent = sym.url;
      reel.appendChild(div);
    });
    positions[index] = 0;
    reel.style.transform = 'translateY(0px)';
  });

  document.getElementById('spinBtn').disabled    = false;
  document.getElementById('spinBtn').textContent = 'Крутить!';
  setStatus('');
}

// ─────────────────────────────────────────────
//  СОБЫТИЯ
// ─────────────────────────────────────────────
document.getElementById('spinBtn').addEventListener('click', spin);

window.addEventListener('load', function() {
  loadCards();
  var t;
  window.addEventListener('resize', function() {
    clearTimeout(t);
    t = setTimeout(function() { if (!spinning && slotSymbols.length > 0) initReels(); }, 300);
  });
});

window.addEventListener('beforeunload', function() {
  reelIds.forEach(function(_, i) { if (animationIds[i]) cancelAnimationFrame(animationIds[i]); });
});
