import { showPackOpen } from './pack.js';Add commentMore actions

export let images = [];
export let balance = { coins: 100, gold: 50, tokens: 10 };
export let balance = { coins: 100, gold: 100, tokens: 100 };

export function updateBalanceUI() {
  document.getElementById('coins').textContent = balance.coins;
@@ -11,21 +11,24 @@ export function updateBalanceUI() {
}

window.addFunds = function () {
  balance.coins += 2000;
  balance.gold += 2000;
  balance.tokens += 2000;
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
          images.push({ name: card.name, image: url });
          images.push({ name, sketcher, image: url });
        }
      });
    });
