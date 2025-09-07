document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const $id = id => document.getElementById(id);
  const $sel = sel => document.querySelector(sel);

  function capitalizeWords(str=''){return String(str).trim().split(/\s+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ')}
  function getDeclension(number, words=['золото','золота','золота']){
    const n=Math.abs(Number(number))%100; const n1=n%10; if(n>10 && n<20) return words[2]; if(n1>1 && n1<5) return words[1]; if(n1===1) return words[0]; return words[2];
  }
  function safeSetText(el, text){ if(el) el.textContent = text }
  function safeSetSrc(el, src){ if(el) el.src = src }
  function safeSetDisplay(el, value){ if(el) el.style.display = value }

  // DOM
  const previewContainer = $id('previewContainer');
  const captureContainer = $id('captureContainer');
  const scaledCaptureContainer = $id('scaledCaptureContainer');

  const imageInput = $id('imageInput');
  const previewImage = $id('previewImage');
  const rarityInput = $id('rarityInput');
  const authorInput = $id('authorInput');
  const priceInput = $id('priceInput');
  const iconCheckbox = $id('iconCheckbox');
  const iconSelect = $id('iconSelect');
  const authorLabelCheckbox = $id('authorLabelCheckbox');
  const priceLabelCheckbox = $id('priceLabelCheckbox');
  const rarityText = $id('rarityText');
  const authorLabel = $sel('.author-label');
  const authorName = $sel('.author-name');
  const costText = $id('costText');
  const iconImg = $id('iconImg');
  const priceLabel = $sel('.price-label');
  const resetButton = $id('resetButton');
  const downloadButton = $id('downloadButton');
  const costWrapper = $id('costWrapper');
  const customFileButton = $sel('.custom-file-button');
  const rarityStyleSelect = $id('rarityStyleSelect');

  const captureImage = $id('captureImage');
  const captureRarityText = $id('captureRarityText');
  const captureAuthorLabel = $sel('#captureAuthorText .author-label');
  const captureAuthorName = $sel('#captureAuthorText .author-name');
  const captureCostText = $id('captureCostText');
  const captureIconImg = $id('captureIconImg');
  const capturePriceLabel = $sel('#captureCostWrapper .price-label');
  const captureCostWrapper = $id('captureCostWrapper');

  const scaledImage = $id('scaledCaptureImage');
  const scaledRarityText = $id('scaledRarityText');
  const scaledAuthorLabel = $sel('#scaledAuthorText .author-label');
  const scaledAuthorName = $sel('#scaledAuthorText .author-name');
  const scaledCostText = $id('scaledCaptureCostText');
  const scaledIconImg = $id('scaledCaptureIconImg');
  const scaledPriceLabel = $sel('#scaledCostWrapper .price-label');
  const scaledCostWrapper = $id('scaledCostWrapper');

  const defaultPrice = '1200';
  const defaultAuthor = 'Kim Jacinto';
  const suffixes = {
    './img/icons/gold-icon.webp':['золото','золота','золота'],
    './img/icons/usd-icon2.webp':['доллар','доллара','долларов'],
    './img/icons/tokens_big.webp':['жетон','жетона','жетонов'],
    './img/icons/credits_big1.webp':['кредит','кредита','кредитов']
  };
  const rarityStyles = { rare:'Rare','super-rare':'Super Rare', ultimate:'Ultimate', spotlight:'Spotlight', 'conquest-reward':'Conquest Reward', bundle:'Bundle', 'webshop-reward':'Webshop Reward' };
  const allowedRarityClasses = Object.keys(rarityStyles);

  function setImgSrcSafe(img, src){
    if(!img) return;
    try{ img.removeAttribute('crossorigin'); }catch{};
    if(typeof src==='string' && /^https?:\/\//i.test(src)){
      try{ img.crossOrigin = 'anonymous'; }catch{}
    }
    img.src = src||'';
  }

  function renderCost(){
    const base = (priceInput && priceInput.value!==undefined) ? String(priceInput.value).trim() : defaultPrice;
    const textValue = base||defaultPrice;
    const number = parseInt(String(base).replace(/\s+/g,''),10)||0
