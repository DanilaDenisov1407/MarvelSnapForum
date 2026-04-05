// ============================================================
//  Marvel Snap Slot Machine — script.js v4
//  Fixes: убран жёсткий checkImage, исправлена анимация
// ============================================================

const CARDS_API = 'https://script.google.com/macros/s/AKfycbx3jwUPotluP3qIHNvM6HiizPdLU-QJQdcTKMJiOXpaWnR606yj9gWe1fj32sEGrve78Q/exec';
const reelIds   = ['reel1', 'reel2', 'reel3'];

// ── Состояние ────────────────────────────────
let spinning     = false;
let animationIds = [null, null, null];
let positions    = [0, 0, 0];
let isSpinning   = [false, false, false];
let stoppedCount = 0;
let finalSymbols = [null, null, null];
let stopIndices  = [0, 0, 0];

// ── Данные ───────────────────────────────────
let characters   = [];
let slotSymbols  = [];
let reelPool     = [];
let settings     = { jackpot_chance: 0.0001, win_chance: 0.05, slot_title: 'Слот-Машина у Баки 🦾' };
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

    if (data.settings) settings = Object.assign({}, settings, data.settings);
    if (settings.slot_title) document.querySelector('h1').textContent = settings.slot_title;

    characters = (data.characters || []).filter(function(c) {
      return c.variants && c.variants.length > 0;
    });
    if (characters.length === 0) throw new Error('Нет персонажей в ответе API');

    buildSlotSymbols();

    // Только фильтруем явно пустые URL — не предзагружаем все картинки
    // (предзагрузка через Image() падала из-за CORS на marvelsnapzone.com)
    slotSymbols = slotSymbols.filter(function(s) {
      return s.url && s.url.indexOf('http') === 0 && s.url.length > 15;
    });

    if (slotSymbols.length === 0) throw new Error('Нет валидных URL картинок');

    console.log('Загружено символов:', slotSymbols.length);
    initReels();
    btn.disabled    = false;
    btn.textContent = 'Крутить!';
    setStatus('');

  } catch (err) {
    console.error('Ошибка загрузки:', err.message);
    setStatus('Ошибка: ' + err.message);
    useFallback();
  }
}

// ─────────────────────────────────────────────
//  ПОСТРОЕНИЕ СИМВОЛОВ
// ─────────────────────────────────────────────
function buildSlotSymbols() {
  slotSymbols = characters.map(function(char) {
    var url = char.variants[Math.floor(Math.random() * char.variants.length)];
    return {
      characterId: String(char.id),
      name:        char.name  || 'Unknown',
      rarity:      char.rarity || '',
      status:      char.status || '',
      url:         url || ''
    };
  }).sort(function() { return Math.random() - 0.5; });
}

// ─────────────────────────────────────────────
//  ИНИЦИАЛИЗАЦИЯ БАРАБАНОВ
// ─────────────────────────────────────────────
function initReels() {
  symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);

  reelPool = [];
  for (var r = 0; r < 6; r++) {
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
      img.alt   = sym.name;
      img.title = sym.name + (sym.rarity ? ' · ' + sym.rarity : '');
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
      // Если картинка битая — скрываем div чтобы не было пустого места
      img.onerror = function() {
        div.style.visibility = 'hidden';
      };
      div.appendChild(img);
      reel.appendChild(div);
    });

    var startIdx = Math.floor(Math.random() * slotSymbols.length);
    positions[index] = -(startIdx * symbolHeight);
    reel.style.transform = 'translateY(' + positions[index] + 'px)';
  });
}

// ─────────────────────────────────────────────
//  АНИМАЦИЯ
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

    if (!isSpinning[index] && !landing) {
      landing = true;

      var targetSym  = slotSymbols[stopIndices[index]];
      var currentRow = Math.round(-positions[index] / symbolHeight);

      // Ищем ближайшее вхождение нужного символа впереди
      var targetRow = -1;
      for (var i = currentRow + 2; i < reelPool.length; i++) {
        if (reelPool[i] && reelPool[i].url === targetSym.url) {
          targetRow = i;
          break;
        }
      }
      if (targetRow === -1) {
        for (var j = 0; j < reelPool.length; j++) {
          if (reelPool[j] && reelPool[j].url === targetSym.url) {
            targetRow = j;
            break;
          }
        }
      }
      if (targetRow === -1) targetRow = stopIndices[index];

      var targetPos = -(targetRow * symbolHeight);
      reel.style.transition = 'transform 0.45s cubic-bezier(0.33, 1, 0.68, 1)';
      reel.style.transform  = 'translateY(' + targetPos + 'px)';
      positions[index]      = targetPos;
      animationIds[index]   = null;

      // Сохраняем index в замыкании
      (function(idx, sym) {
        setTimeout(function() {
          reel.style.transition = '';
          finalSymbols[idx]     = sym;
          stoppedCount++;
          if (stoppedCount === 3) finishSpin();
        }, 460);
      })(index, targetSym);

      return;
    }

    if (landing) return;

    speed = Math.min(maxSpeed, speed + accel * (delta / 16.67));
    positions[index] -= speed;

    // Зацикливание
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
  var JACKPOT = Number(settings.jackpot_chance) || 0.0001;
  var WIN     = Number(settings.win_chance)     || 0.05;

  if (roll < JACKPOT) {
    var idx = Math.floor(Math.random() * slotSymbols.length);
    stopIndices = [idx, idx, idx];

  } else if (roll < JACKPOT + WIN) {
    var winners = characters.filter(function(c) { return c.variants.length >= 3; });
    var pool2   = winners.length > 0 ? winners : characters;
    var winner  = pool2[Math.floor(Math.random() * pool2.length)];
    var picks   = winner.variants.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);

    stopIndices = picks.map(function(url) {
      var found = -1;
      for (var k = 0; k < slotSymbols.length; k++) {
        if (slotSymbols[k].url === url) { found = k; break; }
      }
      if (found === -1) {
        var ns = { characterId: String(winner.id), name: winner.name, url: url, rarity: winner.rarity || '', status: winner.status || '' };
        slotSymbols.push(ns);
        reelPool.push(ns);
        found = slotSymbols.length - 1;
      }
      return found;
    });

  } else {
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

    // Страховка 7с
    setTimeout(function() {
      if (!spinning) return;
      finalSymbols = finalSymbols.map(function(s, i) {
        return s || slotSymbols[stopIndices[i]] || slotSymbols[0];
      });
      finishSpin();
    }, 7000);

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

  finalSymbols = finalSymbols.map(function(s, i) {
    return s || slotSymbols[stopIndices[i]] || slotSymbols[0];
  });

  var s   = finalSymbols;
  var ids = s.map(function(sym) { return sym ? sym.characterId : null; });

  if (s[0].url === s[1].url && s[1].url === s[2].url) {
    result.innerHTML = '🎰 <b>ДЖЕКПОТ!</b> Три одинаковых! 🎉🎉🎉';
    result.className = 'result win jackpot';
    launchConfetti(80);

  } else if (ids[0] && ids[0] === ids[1] && ids[1] === ids[2]) {
    result.innerHTML = '🏆 <b>ПОБЕДА!</b> Три ' + s[0].name + '! Красавчик! 🎊';
    result.className = 'result win';
    launchConfetti(50);

  } else if (ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2]) {
    var pairName = (ids[0] === ids[1] || ids[0] === ids[2]) ? s[0].name : s[1].name;
    result.textContent = '😬 Почти! Два ' + pairName + ' — ещё разок!';
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
      + 'left:' + (Math.random() * 100) + 'vw;'
      + 'width:' + (6 + Math.random() * 8) + 'px;'
      + 'height:' + (6 + Math.random() * 8) + 'px;'
      + 'background:' + colors[Math.floor(Math.random() * colors.length)] + ';'
      + 'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';'
      + 'animation:confettiFall ' + (1.5 + Math.random() * 2) + 's ease-in forwards;'
      + 'animation-delay:' + (Math.random() * 0.6) + 's;';
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
  characters  = emojis.map(function(e, i) { return { id: String(i), name: e, variants: [e], rarity: '', status: '' }; });
  slotSymbols = characters.map(function(c) { return { characterId: c.id, name: c.name, url: c.variants[0], rarity: '', status: '' }; });
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
      div.style.cssText = 'font-size:' + Math.round(symbolHeight * 0.55) + 'px;line-height:' + symbolHeight + 'px;text-align:center;';
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
    t = setTimeout(function() {
      if (!spinning && slotSymbols.length > 0) initReels();
    }, 300);
  });
});

window.addEventListener('beforeunload', function() {
  reelIds.forEach(function(_, i) {
    if (animationIds[i]) cancelAnimationFrame(animationIds[i]);
  });
});
