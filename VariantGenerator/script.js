document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ====== Вспомогательные функции ======
  const $id = (id) => document.getElementById(id);
  const $sel = (sel) => document.querySelector(sel);

  function capitalizeWords(str = '') {
    return String(str)
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  function getDeclension(number, words = ['золото', 'золота', 'золота']) {
    const n = Math.abs(Number(number)) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return words[2];
    if (n1 > 1 && n1 < 5) return words[1];
    if (n1 === 1) return words[0];
    return words[2];
  }

  function safeSetText(el, text) { if (el) el.textContent = text }
  function safeSetSrc(el, src) { if (el) el.src = src }
  function safeSetDisplay(el, value) { if (el) el.style.display = value }

  // ====== Получение DOM элементов (без падения если чего-то нет) ======
  const previewContainer = $id('previewContainer');
  const captureContainer = $id('captureContainer');
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

  // Capture контейнеры для PNG
  const captureImage = $id('captureImage');
  const captureRarityText = $id('captureRarityText');
  const captureAuthorLabel = $sel('#captureAuthorText .author-label');
  const captureAuthorName = $sel('#captureAuthorText .author-name');
  const captureCostText = $id('captureCostText');
  const captureIconImg = $id('captureIconImg');
  const capturePriceLabel = $sel('#captureCostWrapper .price-label');
  const captureCostWrapper = $id('captureCostWrapper');

  const scaledCaptureContainer = $id('scaledCaptureContainer');
  const scaledImage = $id('scaledCaptureImage');
  const scaledRarityText = $id('scaledRarityText');
  const scaledAuthorLabel = $sel('#scaledAuthorText .author-label');
  const scaledAuthorName = $sel('#scaledAuthorText .author-name');
  const scaledCostText = $id('scaledCaptureCostText');
  const scaledIconImg = $id('scaledCaptureIconImg');
  const scaledPriceLabel = $sel('#scaledCostWrapper .price-label');
  const scaledCostWrapper = $id('scaledCostWrapper');

  // ====== Настройки по умолчанию ======
  const defaultPrice = '1200';
  const defaultAuthor = 'Kim Jacinto';
  const suffixes = {
    './img/icons/gold-icon.webp': ['золото', 'золота', 'золота'],
    './img/icons/usd-icon2.webp': ['доллар', 'доллара', 'долларов'],
    './img/icons/tokens_big.webp': ['жетон', 'жетона', 'жетонов'],
    './img/icons/credits_big1.webp': ['кредит', 'кредита', 'кредитов']
  };

  const rarityStyles = {
    rare: 'Rare',
    'super-rare': 'Super Rare',
    ultimate: 'Ultimate',
    spotlight: 'Spotlight',
    'conquest-reward': 'Conquest Reward',
    bundle: 'Bundle',
    'webshop-reward': 'Webshop Reward'
  };

  const allowedRarityClasses = Object.keys(rarityStyles);

  // ====== Функции обновления интерфейса ======
  function renderCost() {
    const base = (priceInput && priceInput.value !== undefined) ? String(priceInput.value).trim() : defaultPrice;
    let text = base || defaultPrice;
    if (iconCheckbox && iconCheckbox.checked) {
      if (iconSelect && iconImg) iconImg.src = iconSelect.value;
      if (iconImg) iconImg.style.display = 'inline';
      const number = parseInt(base, 10) || 0;
      const suffixArray = (iconSelect && suffixes[iconSelect.value]) ? suffixes[iconSelect.value] : ['золото', 'золота', 'золота'];
      text += ' ' + getDeclension(number, suffixArray);
    } else {
      if (iconImg) iconImg.style.display = 'none';
    }
    safeSetText(costText, text);
    updateCostWrapperVisibility();
  }

  function renderAuthor() {
    const name = (authorInput && authorInput.value) ? authorInput.value : defaultAuthor;
    safeSetText(authorName, capitalizeWords(name));
  }

  function updateLabelsVisibility() {
    if (authorLabel) authorLabel.style.display = (authorLabelCheckbox && authorLabelCheckbox.checked) ? 'inline' : 'none';
    if (priceLabel) priceLabel.style.display = (priceLabelCheckbox && priceLabelCheckbox.checked) ? 'inline' : 'none';
    updateCostWrapperVisibility();
  }

  function updateCostWrapperVisibility() {
    const hasPrice = (priceInput && String(priceInput.value || '').trim() !== '');
    if (costWrapper) {
      costWrapper.style.display = (hasPrice || (priceLabelCheckbox && priceLabelCheckbox.checked) || (iconCheckbox && iconCheckbox.checked)) ? 'flex' : 'none';
    }
  }

  function toggleActiveClass(input) {
    if (!input) return;
    const parent = input.closest('.input-value');
    if (parent) parent.classList.toggle('active', String(input.value || '').trim() !== '');
  }

  function clearInput(input) {
    if (!input) return;
    input.value = '';
    toggleActiveClass(input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (input === rarityInput && rarityStyleSelect) {
      const style = rarityStyleSelect.value || 'rare';
      if (rarityText) safeSetText(rarityText.querySelector('span'), rarityStyles[style]);
      if (captureRarityText) safeSetText(captureRarityText.querySelector('span'), rarityStyles[style]);
    }
  }

  function updateRarityStyle() {
    const style = (rarityStyleSelect && rarityStyleSelect.value) ? rarityStyleSelect.value : 'rare';
    // set rarity-block classes
    if (rarityText) rarityText.className = 'rarity-block ' + style;
    if (captureRarityText) captureRarityText.className = 'rarity-block ' + style;
    if (scaledRarityText) scaledRarityText.className = 'rarity-block ' + style;

    // update container border classes (preview, capture, scaled)
    [previewContainer, captureContainer, scaledCaptureContainer].forEach(container => {
      if (!container) return;
      // remove any known rarity classes
      allowedRarityClasses.forEach(c => container.classList.remove(c));
      container.classList.add(style);
    });

    // if no custom rarity entered, show the styled text
    if (rarityInput && String(rarityInput.value || '').trim() === '') {
      const mapped = rarityStyles[style] || capitalizeWords(style);
      if (rarityText) safeSetText(rarityText.querySelector('span'), mapped);
      if (captureRarityText) safeSetText(captureRarityText.querySelector('span'), mapped);
      if (scaledRarityText) safeSetText(scaledRarityText.querySelector('span'), mapped);
    }
  }

  function updateCaptureContainer() {
    if (previewImage && captureImage) captureImage.src = previewImage.src || '';
    if (rarityText && captureRarityText) {
      const spanText = rarityText.querySelector('span') ? rarityText.querySelector('span').textContent : '';
      safeSetText(captureRarityText.querySelector('span'), spanText);
      captureRarityText.className = rarityText.className;
    }

    if (authorLabel && captureAuthorLabel) captureAuthorLabel.style.display = authorLabel.style.display;
    if (authorName && captureAuthorName) captureAuthorName.textContent = authorName.textContent || '';

    if (costText && captureCostText) captureCostText.textContent = costText.textContent || '';
    if (iconImg && captureIconImg) { captureIconImg.src = iconImg.src || ''; captureIconImg.style.display = iconImg.style.display || 'none'; }
    if (priceLabel && capturePriceLabel) capturePriceLabel.style.display = priceLabel.style.display;
    if (costWrapper && captureCostWrapper) captureCostWrapper.style.display = costWrapper.style.display;

    if (scaledCaptureContainer && scaledCaptureContainer.classList.contains('visible')) {
      if (previewImage && scaledImage) scaledImage.src = previewImage.src || '';
      if (rarityText && scaledRarityText) {
        const spanText = rarityText.querySelector('span') ? rarityText.querySelector('span').textContent : '';
        safeSetText(scaledRarityText.querySelector('span'), spanText);
        scaledRarityText.className = rarityText.className;
      }
      if (authorLabel && scaledAuthorLabel) scaledAuthorLabel.style.display = authorLabel.style.display;
      if (authorName && scaledAuthorName) scaledAuthorName.textContent = authorName.textContent || '';
      if (costText && scaledCostText) scaledCostText.textContent = costText.textContent || '';
      if (iconImg && scaledIconImg) { scaledIconImg.src = iconImg.src || ''; scaledIconImg.style.display = iconImg.style.display || 'none'; }
      if (priceLabel && scaledPriceLabel) scaledPriceLabel.style.display = priceLabel.style.display;
      if (costWrapper && scaledCostWrapper) scaledCostWrapper.style.display = costWrapper.style.display;
    }
  }

  function updatePreview() {
    if (rarityInput && String(rarityInput.value || '').trim() !== '') {
      const text = capitalizeWords(rarityInput.value);
      if (rarityText && rarityText.querySelector('span')) safeSetText(rarityText.querySelector('span'), text);
      if (captureRarityText && captureRarityText.querySelector('span')) safeSetText(captureRarityText.querySelector('span'), text);
      if (scaledRarityText && scaledRarityText.querySelector('span')) safeSetText(scaledRarityText.querySelector('span'), text);
    }
    renderCost();
    renderAuthor();
    updateLabelsVisibility();
    updateCaptureContainer();
  }

  // ====== События ======
  if (customFileButton && imageInput) {
    customFileButton.addEventListener('click', (e) => {
      e.preventDefault();
      imageInput.click();
    });
  }

  // Ввод текста — только существующие inputs
  [rarityInput, authorInput, priceInput].filter(Boolean).forEach(input => {
    input.addEventListener('input', () => {
      toggleActiveClass(input);
      updatePreview();
    });
    // начальная подсветка
    toggleActiveClass(input);
  });

  // Крестик для очистки поля (работает на .input-value)
  document.querySelectorAll('.input-value').forEach(wrapper => {
    wrapper.addEventListener('click', e => {
      const input = wrapper.querySelector('input');
      if (!input) return;
      // только если активна и клик по правой части (иконке)
      if (wrapper.classList.contains('active') && (e.offsetX > wrapper.offsetWidth - 30)) {
        clearInput(input);
      }
    });
  });

  // Загрузка изображения
  if (imageInput) {
    imageInput.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (previewImage) previewImage.src = url;
      if (captureImage) captureImage.src = url;
      updateCaptureContainer();
    });
  }

  // Чекбоксы и селекты — подключаем если есть
  if (iconCheckbox) {
    iconCheckbox.addEventListener('change', () => {
      if (iconSelect) iconSelect.disabled = !iconCheckbox.checked;
      updatePreview();
    });
  }
  if (iconSelect) iconSelect.addEventListener('change', updatePreview);
  if (authorLabelCheckbox) authorLabelCheckbox.addEventListener('change', updatePreview);
  if (priceLabelCheckbox) priceLabelCheckbox.addEventListener('change', updatePreview);
  if (rarityStyleSelect) rarityStyleSelect.addEventListener('change', () => {
    updateRarityStyle();
    updatePreview();
  });

  // ====== Инициализация ======
  try {
    renderCost();
    renderAuthor();
    updateLabelsVisibility();
    updateRarityStyle();
    updateCaptureContainer();
  } catch (err) {
    // защищаемся от неожиданных ошибок при загрузке
    console.warn('Init warning:', err);
  }

  // ====== Сброс ======
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (imageInput) imageInput.value = '';
      if (previewImage) previewImage.src = './img/card-preview.webp';
      if (captureImage) captureImage.src = './img/card-preview.webp';
      if (rarityInput) rarityInput.value = '';
      if (rarityStyleSelect) rarityStyleSelect.value = 'rare';
      if (rarityText && rarityText.querySelector('span')) safeSetText(rarityText.querySelector('span'), rarityStyles['rare']);
      if (authorInput) authorInput.value = '';
      if (priceInput) priceInput.value = '';
      if (iconCheckbox) iconCheckbox.checked = true;
      if (iconSelect) { iconSelect.disabled = false; iconSelect.value = './img/icons/gold-icon.webp'; }
      if (authorLabelCheckbox) authorLabelCheckbox.checked = true;
      if (priceLabelCheckbox) priceLabelCheckbox.checked = true;

      updateRarityStyle();
      renderCost();
      renderAuthor();
      updateLabelsVisibility();
      updateCaptureContainer();

      // обновляем классы active
      [rarityInput, authorInput, priceInput].filter(Boolean).forEach(input => toggleActiveClass(input));
    });
  }

  // ====== Скачивание PNG ======
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      if (!scaledCaptureContainer) return;
      // показываем scaled контейнер (он hidden offscreen по умолчанию)
      scaledCaptureContainer.classList.add('visible');
      updateCaptureContainer();

      // даем браузеру немного времени (рендер) — html2canvas справится, но мы уже сделали visible
      html2canvas(scaledCaptureContainer, {
        scale: 1,
        width: 615,
        height: 850,
        backgroundColor: '#050505',
        useCORS: true
      }).then(canvas => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        let artist = (authorName && authorName.textContent) ? authorName.textContent : 'Unknown';
        artist = String(artist).replace(/[<>"'/\\|?*]/g, '').trim();
        const fileName = `Artist_-_${artist}_${hours}-${minutes}_${day}.${month}.${year}.png`.replace(/\s+/g, '_');

        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error('html2canvas error:', err);
      }).finally(() => {
        // скрываем обратно
        scaledCaptureContainer.classList.remove('visible');
      });
    });
  }

  // GIF button оставляем, как просил (disabled). Позже можно подключить логику.
});
