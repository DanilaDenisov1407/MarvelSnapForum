document.addEventListener('DOMContentLoaded', () => {
  function capitalizeWords(str) {
    return str
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // ----------------------- Элементы -----------------------
  const imageInput = document.getElementById('imageInput');
  const previewImage = document.getElementById('previewImage');
  const rarityInput = document.getElementById('rarityInput');
  const authorInput = document.getElementById('authorInput');
  const priceInput = document.getElementById('priceInput');
  const iconCheckbox = document.getElementById('iconCheckbox');
  const iconSelect = document.getElementById('iconSelect');
  const authorLabelCheckbox = document.getElementById('authorLabelCheckbox');
  const priceLabelCheckbox = document.getElementById('priceLabelCheckbox');
  const rarityText = document.getElementById('rarityText');
  const authorLabel = document.querySelector('.author-label');
  const authorName = document.querySelector('.author-name');
  const costText = document.getElementById('costText');
  const iconImg = document.getElementById('iconImg');
  const priceLabel = document.querySelector('.price-label');
  const resetButton = document.getElementById('resetButton');
  const downloadButton = document.getElementById('downloadButton');
  const costWrapper = document.getElementById('costWrapper');
  const customFileButton = document.querySelector('.custom-file-button');
  const rarityStyleSelect = document.getElementById('rarityStyleSelect');

  const captureImage = document.getElementById('captureImage');
  const captureRarityText = document.getElementById('captureRarityText');
  const captureAuthorLabel = document.querySelector('#captureAuthorText .author-label');
  const captureAuthorName = document.querySelector('#captureAuthorText .author-name');
  const captureCostText = document.getElementById('captureCostText');
  const captureIconImg = document.getElementById('captureIconImg');
  const capturePriceLabel = document.querySelector('#captureCostWrapper .price-label');
  const captureCostWrapper = document.getElementById('captureCostWrapper');

  const scaledCaptureContainer = document.getElementById('scaledCaptureContainer');
  const scaledImage = scaledCaptureContainer.querySelector('#scaledCaptureImage');
  const scaledRarityText = scaledCaptureContainer.querySelector('#scaledRarityText');
  const scaledAuthorLabel = scaledCaptureContainer.querySelector('#scaledAuthorText .author-label');
  const scaledAuthorName = scaledCaptureContainer.querySelector('#scaledAuthorText .author-name');
  const scaledCostText = scaledCaptureContainer.querySelector('#scaledCaptureCostText');
  const scaledIconImg = scaledCaptureContainer.querySelector('#scaledCaptureIconImg');
  const scaledPriceLabel = scaledCaptureContainer.querySelector('#scaledCostWrapper .price-label');
  const scaledCostWrapper = scaledCaptureContainer.querySelector('#scaledCostWrapper');

  const previewContainer = document.querySelector('.preview-container');
  const captureContainer = document.querySelector('.capture-container');
  const scaledContainer = document.querySelector('.scaled-capture-container');

  const defaultPrice = '1200';
  const defaultAuthor = 'Kim Jacinto';

  const rarityStyles = {
    rare: 'Rare',
    'super-rare': 'Super Rare',
    ultimate: 'Ultimate',
    spotlight: 'Spotlight',
    'conquest-reward': 'Conquest Reward',
    'webshop-reward': 'Webshop Reward',
    bundle: 'Bundle',
  };

  const ALL_RARITY_CLASSES = [
    'rare',
    'super-rare',
    'ultimate',
    'spotlight',
    'conquest-reward',
    'webshop-reward',
    'bundle',
  ];

  // ----------------------- Функции -----------------------
  function renderCost() {
    const base = priceInput.value || defaultPrice;
    costText.textContent = base;

    if (iconCheckbox.checked) {
      iconImg.src = iconSelect.value;
      iconImg.style.display = 'inline';
    } else {
      iconImg.style.display = 'none';
    }

    updateCostWrapperVisibility();
  }

  function renderAuthor() {
    const name = capitalizeWords(authorInput.value || defaultAuthor);
    authorName.textContent = name;
  }

  function updateLabelsVisibility() {
    authorLabel.style.display = authorLabelCheckbox.checked ? 'inline' : 'none';
    priceLabel.style.display = priceLabelCheckbox.checked ? 'inline' : 'none';
    updateCostWrapperVisibility();
  }

  function updateCostWrapperVisibility() {
    const hasPrice = priceInput.value.trim() !== '';
    const showPriceLabel = priceLabelCheckbox.checked;
    const showIcon = iconCheckbox.checked;
    const visible = hasPrice || showPriceLabel || showIcon;

    costWrapper.style.display = visible ? 'flex' : 'none';
    costWrapper.classList.toggle('with-border', visible);

    captureCostWrapper.style.display = visible ? 'flex' : 'none';
    captureCostWrapper.classList.toggle('with-border', visible);

    scaledCostWrapper.style.display = visible ? 'flex' : 'none';
    scaledCostWrapper.classList.toggle('with-border', visible);
  }

  function toggleActiveClass(input) {
    if (!input || !input.closest) return;
    const parent = input.closest('.input-value');
    if (parent) {
      parent.classList.toggle('active', input.value.trim() !== '');
    }
  }

  function clearInput(input) {
    if (!input) return;
    input.value = '';
    toggleActiveClass(input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (input === rarityInput) {
      rarityText.querySelector('span').textContent = rarityStyles[rarityStyleSelect.value];
    }
  }

  function updateRarityStyle() {
    const selectedStyle = rarityStyleSelect.value;

    ALL_RARITY_CLASSES.forEach(c => {
      rarityText.classList.remove(c);
      captureRarityText.classList.remove(c);
      previewContainer.classList.remove(c);
      captureContainer.classList.remove(c);
      scaledContainer.classList.remove(c);
    });

    if (selectedStyle && ALL_RARITY_CLASSES.includes(selectedStyle)) {
      rarityText.classList.add(selectedStyle);
      captureRarityText.classList.add(selectedStyle);
      previewContainer.classList.add(selectedStyle);
      captureContainer.classList.add(selectedStyle);
      scaledContainer.classList.add(selectedStyle);
    }

    if (!rarityInput.value.trim()) {
      rarityText.querySelector('span').textContent = rarityStyles[selectedStyle] || '';
      captureRarityText.querySelector('span').textContent = rarityStyles[selectedStyle] || '';
    }
  }

  function updateCaptureContainer() {
    captureImage.src = previewImage.src;
    captureRarityText.querySelector('span').textContent = rarityText.querySelector('span').textContent;
    captureRarityText.className = rarityText.className;

    captureAuthorLabel.style.display = authorLabel.style.display;
    captureAuthorName.textContent = authorName.textContent;
    captureCostText.textContent = costText.textContent;
    captureIconImg.src = iconImg.src;
    captureIconImg.style.display = iconImg.style.display;
    capturePriceLabel.style.display = priceLabel.style.display;
    captureCostWrapper.style.display = costWrapper.style.display;
    captureCostWrapper.classList.toggle('with-border', costWrapper.classList.contains('with-border'));
  }

  function updateScaledContainer() {
    scaledImage.src = previewImage.src;
    scaledRarityText.querySelector('span').textContent = rarityText.querySelector('span').textContent;
    scaledRarityText.className = rarityText.className;
    scaledAuthorLabel.style.display = authorLabel.style.display;
    scaledAuthorName.textContent = authorName.textContent;
    scaledCostText.textContent = costText.textContent;
    scaledIconImg.src = iconImg.src;
    scaledIconImg.style.display = iconImg.style.display;
    scaledPriceLabel.style.display = priceLabel.style.display;
    scaledCostWrapper.style.display = costWrapper.style.display;
    scaledCostWrapper.classList.toggle('with-border', costWrapper.classList.contains('with-border'));
  }

  function updatePreview() {
    if (rarityInput.value) {
      rarityText.querySelector('span').textContent = capitalizeWords(rarityInput.value);
    } else {
      rarityText.querySelector('span').textContent = rarityStyles[rarityStyleSelect.value];
    }
    renderCost();
    renderAuthor();
    updateLabelsVisibility();
    updateCaptureContainer();
  }

  // ----------------------- События -----------------------
  customFileButton.addEventListener('click', () => imageInput.click());

  [rarityInput, authorInput, priceInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        toggleActiveClass(input);
        updatePreview();
      });
      toggleActiveClass(input);
    }
  });

  document.querySelectorAll('.input-value').forEach(inputValue => {
    inputValue.addEventListener('click', e => {
      if (inputValue.classList.contains('active')) {
        const input = inputValue.querySelector('input');
        if (input && e.offsetX > inputValue.offsetWidth - 30) clearInput(input);
      }
    });
  });

  imageInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    previewImage.src = url;
    captureImage.src = url;
    updateCaptureContainer();
  });

  iconCheckbox.addEventListener('change', () => {
    iconSelect.disabled = !iconCheckbox.checked;
    updatePreview();
  });
  iconSelect.addEventListener('change', updatePreview);
  authorLabelCheckbox.addEventListener('change', updatePreview);
  priceLabelCheckbox.addEventListener('change', updatePreview);
  rarityStyleSelect.addEventListener('change', () => {
    updateRarityStyle();
    updatePreview();
  });

  resetButton.addEventListener('click', () => {
    imageInput.value = '';
    previewImage.src = './img/card-preview.webp';
    captureImage.src = './img/card-preview.webp';
    rarityInput.value = '';
    rarityStyleSelect.value = 'rare';
    rarityText.querySelector('span').textContent = rarityStyles['rare'];
    authorInput.value = '';
    priceInput.value = '';
    iconCheckbox.checked = true;
    iconSelect.disabled = false;
    iconSelect.value = './img/icons/gold-icon.webp';
    authorLabelCheckbox.checked = true;
    priceLabelCheckbox.checked = true;
    updateRarityStyle();
    renderCost();
    renderAuthor();
    updateLabelsVisibility();
    updateCaptureContainer();
    [rarityInput, authorInput, priceInput].forEach(toggleActiveClass);
  });

  downloadButton.addEventListener('click', () => {
    updateScaledContainer();
    const scaledContainerElement = document.getElementById('scaledCaptureContainer');
    const originalStyles = {
      display: scaledContainerElement.style.display,
      position: scaledContainerElement.style.position,
      left: scaledContainerElement.style.left,
      top: scaledContainerElement.style.top,
    };

    scaledContainerElement.style.display = 'flex';
    scaledContainerElement.style.position = 'absolute';
    scaledContainerElement.style.left = '-9999px';
    scaledContainerElement.style.top = '-9999px';

    html2canvas(scaledContainerElement, {
      scale: 1,
      width: 615,
      height: 850,
      backgroundColor: null, // прозрачный фон
      useCORS: true,
    }).then(canvas => {
      Object.assign(scaledContainerElement.style, originalStyles);

      const now = new Date();
      const fileName = `Card_${now.getHours()}-${now.getMinutes()}_${now.getDate()}.${now.getMonth()+1}.${now.getFullYear()}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(err => {
      console.error('Ошибка при рендеринге:', err);
      Object.assign(scaledContainerElement.style, originalStyles);
    });
  });

  // ----------------------- Инициализация -----------------------
  renderCost();
  renderAuthor();
  updateLabelsVisibility();
  updateRarityStyle();
  updateCaptureContainer();
});
