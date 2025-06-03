import { showSlotMachine } from './slot.js';
import { showPackOpen } from './pack.js';

export let images = [];
export let balance = { coins: 100, gold: 100, tokens: 100 };

export function updateBalanceUI() {
  document.getElementById('coins').textContent = balance.coins;
  document.getElementById('gold').textContent = balance.gold;
  document.getElementById('tokens').textContent = balance.tokens;
}

window.addFunds = function () {
  balance.coins += 1000;
  balance.gold += 1000;
  balance.tokens += 1000;
  updateBalanceUI();
};

fetch('data/cards.json')
  .then(res => res.json())
  .then(data => {
    const cards = data.success?.cards || [];

    cards.forEach(card => {
      const name = card.name;
      const sketcher = card.sketcher || '';
      (card.variants || []).forEach(v => {
        const url = v.art;
        if (url && url.includes('http') && !url.includes('None') && !url.includes('Not Available')) {
          images.push({ name, sketcher, image: url });
        }
      });
    });

    document.getElementById('btn-slot').onclick = () =>
      showSlotMachine(images, balance, updateBalanceUI);

    document.getElementById('btn-pack').onclick = () =>
      showPackOpen(images, balance, updateBalanceUI, false);
  });
