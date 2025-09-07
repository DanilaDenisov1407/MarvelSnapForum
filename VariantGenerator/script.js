document.addEventListener('DOMContentLoaded', () => {
  // ====== Вспомогательные функции ======
  
  // Функция для капитализации слов
  function capitalizeWords(str) {
    return str
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  // Склонение слов (например, золото/золота/золота)
  function getDeclension(number, words) {
    const n = Math.abs(number) % 100
    const n1 = n % 10
    if (n > 10 && n < 20) return words[2]
    if (n1 > 1 && n1 < 5) return words[1]
    if (n1 === 1) return words[0]
    return words[2]
  }

  // ====== Получение DOM элементов ======
  const imageInput = document.getElementById('imageInput')
  const previewImage = document.getElementById('previewImage')
  const rarityInput = document.getElementById('rarityInput')
  const authorInput = document.getElementById('authorInput')
  const priceInput = document.getElementById('priceInput')
  const iconCheckbox = document.getElementById('iconCheckbox')
  const iconSelect = document.getElementById('iconSelect')
  const authorLabelCheckbox = document.getElementById('authorLabelCheckbox')
  const priceLabelCheckbox = document.getElementById('priceLabelCheckbox')
  const rarityText = document.getElementById('rarityText')
  const authorLabel = document.querySelector('.author-label')
  const authorName = document.querySelector('.author-name')
  const costText = document.getElementById('costText')
  const iconImg = document.getElementById('iconImg')
  const priceLabel = document.querySelector('.price-label')
  const resetButton = document.getElementById('resetButton')
  const downloadButton = document.getElementById('downloadButton')
  const costWrapper = document.getElementById('costWrapper')
  const customFileButton = document.querySelector('.custom-file-button')
  const rarityStyleSelect = document.getElementById('rarityStyleSelect')

  // Capture контейнеры для PNG
  const captureImage = document.getElementById('captureImage')
  const captureRarityText = document.getElementById('captureRarityText')
  const captureAuthorLabel = document.querySelector('#captureAuthorText .author-label')
  const captureAuthorName = document.querySelector('#captureAuthorText .author-name')
  const captureCostText = document.getElementById('captureCostText')
  const captureIconImg = document.getElementById('captureIconImg')
  const capturePriceLabel = document.querySelector('#captureCostWrapper .price-label')
  const captureCostWrapper = document.getElementById('captureCostWrapper')

  const scaledCaptureContainer = document.getElementById('scaledCaptureContainer')
  const scaledImage = document.getElementById('scaledCaptureImage')
  const scaledRarityText = document.getElementById('scaledRarityText')
  const scaledAuthorLabel = document.querySelector('#scaledAuthorText .author-label')
  const scaledAuthorName = document.querySelector('#scaledAuthorText .author-name')
  const scaledCostText = document.getElementById('scaledCaptureCostText')
  const scaledIconImg = document.getElementById('scaledCaptureIconImg')
  const scaledPriceLabel = document.querySelector('#scaledCostWrapper .price-label')
  const scaledCostWrapper = document.getElementById('scaledCostWrapper')

  // ====== Настройки по умолчанию ======
  const defaultPrice = '1200'
  const defaultAuthor = 'Kim Jacinto'
  const suffixes = {
    './img/icons/gold-icon.webp': ['золото', 'золота', 'золота'],
    './img/icons/usd-icon2.webp': ['доллар', 'доллара', 'долларов'],
    './img/icons/tokens_big.webp': ['жетон', 'жетона', 'жетонов'],
    './img/icons/credits_big1.webp': ['кредит', 'кредита', 'кредитов']
  }

  const rarityStyles = {
    rare: 'Rare',
    'super-rare': 'Super Rare',
    ultimate: 'Ultimate',
    spotlight: 'Spotlight',
    'conquest-reward': 'Conquest Reward',
    bundle: 'Bundle',
    'webshop-reward': 'Webshop Reward'
  }

  // ====== Функции обновления интерфейса ======

  function renderCost() {
    const base = priceInput.value || defaultPrice
    let text = base
    if (iconCheckbox.checked) {
      iconImg.src = iconSelect.value
      iconImg.style.display = 'inline'
      const number = parseInt(base, 10) || 0
      const suffixArray = suffixes[iconSelect.value] || ['золото', 'золота', 'золота']
      text += ' ' + getDeclension(number, suffixArray)
    } else {
      iconImg.style.display = 'none'
    }
    costText.textContent = text
    updateCostWrapperVisibility()
  }

  function renderAuthor() {
    authorName.textContent = capitalizeWords(authorInput.value || defaultAuthor)
  }

  function updateLabelsVisibility() {
    authorLabel.style.display = authorLabelCheckbox.checked ? 'inline' : 'none'
    priceLabel.style.display = priceLabelCheckbox.checked ? 'inline' : 'none'
    updateCostWrapperVisibility()
  }

  function updateCostWrapperVisibility() {
    const hasPrice = priceInput.value.trim() !== ''
    costWrapper.style.display = (hasPrice || priceLabelCheckbox.checked || iconCheckbox.checked) ? 'flex' : 'none'
  }

  function toggleActiveClass(input) {
    const parent = input.closest('.input-value')
    if (parent) parent.classList.toggle('active', input.value.trim() !== '')
  }

  function clearInput(input) {
    input.value = ''
    toggleActiveClass(input)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    if (input === rarityInput) {
      rarityText.querySelector('span').textContent = rarityStyles[rarityStyleSelect.value]
    }
  }

  function updateRarityStyle() {
    const style = rarityStyleSelect.value
    rarityText.className = 'rarity-block ' + style
    captureRarityText.className = 'rarity-block ' + style
    if (!rarityInput.value.trim()) {
      rarityText.querySelector('span').textContent = rarityStyles[style]
      captureRarityText.querySelector('span').textContent = rarityStyles[style]
    }
  }

  function updateCaptureContainer() {
    captureImage.src = previewImage.src
    captureRarityText.querySelector('span').textContent = rarityText.querySelector('span').textContent
    captureRarityText.className = rarityText.className
    captureAuthorLabel.style.display = authorLabel.style.display
    captureAuthorName.textContent = authorName.textContent
    captureCostText.textContent = costText.textContent
    captureIconImg.src = iconImg.src
    captureIconImg.style.display = iconImg.style.display
    capturePriceLabel.style.display = priceLabel.style.display
    captureCostWrapper.style.display = costWrapper.style.display

    if (scaledCaptureContainer.classList.contains('visible')) {
      scaledImage.src = previewImage.src
      scaledRarityText.querySelector('span').textContent = rarityText.querySelector('span').textContent
      scaledRarityText.className = rarityText.className
      scaledAuthorLabel.style.display = authorLabel.style.display
      scaledAuthorName.textContent = authorName.textContent
      scaledCostText.textContent = costText.textContent
      scaledIconImg.src = iconImg.src
      scaledIconImg.style.display = iconImg.style.display
      scaledPriceLabel.style.display = priceLabel.style.display
      scaledCostWrapper.style.display = costWrapper.style.display
    }
  }

  function updatePreview() {
    if (rarityInput.value.trim()) {
      rarityText.querySelector('span').textContent = capitalizeWords(rarityInput.value)
      captureRarityText.querySelector('span').textContent = capitalizeWords(rarityInput.value)
    }
    renderCost()
    renderAuthor()
    updateLabelsVisibility()
    updateCaptureContainer()
  }

  // ====== События ======

  // Кнопка выбора файла
  customFileButton.addEventListener('click', () => imageInput.click())

  // Ввод текста
[rarityInput, authorInput, priceInput]
  .filter(Boolean) // убираем undefined/null, если вдруг элемент не найден
  .forEach(input => {
    input.addEventListener('input', () => {
      toggleActiveClass(input)
      updatePreview()
    })
    toggleActiveClass(input)
  })

  // Крестик для очистки поля
  document.querySelectorAll('.input-value').forEach(wrapper => {
    wrapper.addEventListener('click', e => {
      const input = wrapper.querySelector('input')
      if (input && wrapper.classList.contains('active') && e.offsetX > wrapper.offsetWidth - 30) {
        clearInput(input)
      }
    })
  })

  // Загрузка изображения
  imageInput.addEventListener('change', e => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    previewImage.src = url
    captureImage.src = url
    updateCaptureContainer()
  })

  // Чекбоксы и селекты
  iconCheckbox.addEventListener('change', () => {
    iconSelect.disabled = !iconCheckbox.checked
    updatePreview()
  })
  iconSelect.addEventListener('change', updatePreview)
  authorLabelCheckbox.addEventListener('change', updatePreview)
  priceLabelCheckbox.addEventListener('change', updatePreview)
  rarityStyleSelect.addEventListener('change', () => {
    updateRarityStyle()
    updatePreview()
  })

  // ====== Инициализация ======
  renderCost()
  renderAuthor()
  updateLabelsVisibility()
  updateRarityStyle()
  updateCaptureContainer()

  // ====== Сброс ======
  resetButton.addEventListener('click', () => {
    imageInput.value = ''
    previewImage.src = './img/card-preview.webp'
    captureImage.src = './img/card-preview.webp'
    rarityInput.value = ''
    rarityStyleSelect.value = 'rare'
    rarityText.querySelector('span').textContent = rarityStyles['rare']
    authorInput.value = ''
    priceInput.value = ''
    iconCheckbox.checked = true
    iconSelect.disabled = false
    iconSelect.value = './img/icons/gold-icon.webp'
    authorLabelCheckbox.checked = true
    priceLabelCheckbox.checked = true
    updateRarityStyle()
    renderCost()
    renderAuthor()
    updateLabelsVisibility()
    updateCaptureContainer()
    [rarityInput, authorInput, priceInput].forEach(toggleActiveClass.bind(null))
  })

  // ====== Скачивание PNG ======
  downloadButton.addEventListener('click', () => {
    scaledCaptureContainer.classList.add('visible')
    updateCaptureContainer()

    html2canvas(scaledCaptureContainer, {
      scale: 1,
      width: 615,
      height: 850,
      backgroundColor: '#050505',
      useCORS: true
    }).then(canvas => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      let artist = authorName.textContent || 'Unknown'
      artist = artist.replace(/[<>"'/\\|?*]/g, '').trim()
      const fileName = `Artist_-_${artist}_${hours}-${minutes}_${day}.${month}.${year}.png`.replace(/\s+/g, '_')

      const link = document.createElement('a')
      link.download = fileName
      link.href = canvas.toDataURL('image/png')
      link.click()
    }).finally(() => scaledCaptureContainer.classList.remove('visible'))
  })

})
