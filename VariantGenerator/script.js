document.addEventListener('DOMContentLoaded', () => {
  function capitalizeWords(str) {
    return str
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

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

  const captureImage = document.getElementById('captureImage')
  const captureRarityText = document.getElementById('captureRarityText')
  const captureAuthorLabel = document.querySelector('#captureAuthorText .author-label')
  const captureAuthorName = document.querySelector('#captureAuthorText .author-name')
  const captureCostText = document.getElementById('captureCostText')
  const captureIconImg = document.getElementById('captureIconImg')
  const capturePriceLabel = document.querySelector('#captureCostWrapper .price-label')
  const captureCostWrapper = document.getElementById('captureCostWrapper')

  const scaledCaptureContainer = document.getElementById('scaledCaptureContainer')
  const scaledImage = scaledCaptureContainer.querySelector('#scaledCaptureImage')
  const scaledRarityText = scaledCaptureContainer.querySelector('#scaledRarityText')
  const scaledAuthorLabel = scaledCaptureContainer.querySelector('#scaledAuthorText .author-label')
  const scaledAuthorName = scaledCaptureContainer.querySelector('#scaledAuthorText .author-name')
  const scaledCostText = scaledCaptureContainer.querySelector('#scaledCaptureCostText')
  const scaledIconImg = scaledCaptureContainer.querySelector('#scaledCaptureIconImg')
  const scaledPriceLabel = scaledCaptureContainer.querySelector('#scaledCostWrapper .price-label')
  const scaledCostWrapper = scaledCaptureContainer.querySelector('#scaledCostWrapper')

  const previewContainer = document.querySelector('.preview-container')
  const captureContainer = document.querySelector('.capture-container')
  const scaledContainer = document.querySelector('.scaled-capture-container')

  const defaultPrice = '1200'
  const defaultAuthor = 'Kim Jacinto'

  const rarityStyles = {
    rare: 'Rare',
    'super-rare': 'Super Rare',
    ultimate: 'Ultimate',
    spotlight: 'Spotlight',
    'conquest-reward': 'Conquest Reward',
    'webshop-reward': 'Webshop Reward',
    bundle: 'Bundle',
  }

  function renderCost() {
    const base = priceInput.value || defaultPrice
    costText.textContent = base

    if (iconCheckbox.checked) {
      iconImg.src = iconSelect.value
      iconImg.style.display = 'inline'
    } else {
      iconImg.style.display = 'none'
    }

    updateCostWrapperVisibility()
  }

  function renderAuthor() {
    const name = capitalizeWords(authorInput.value || defaultAuthor)
    authorName.textContent = name
  }

  function updateLabelsVisibility() {
    authorLabel.style.display = authorLabelCheckbox.checked ? 'inline' : 'none'
    priceLabel.style.display = priceLabelCheckbox.checked ? 'inline' : 'none'
    updateCostWrapperVisibility()
  }

  function updateCostWrapperVisibility() {
    const hasPrice = priceInput.value.trim() !== ''
    const showPriceLabel = priceLabelCheckbox.checked
    const showIcon = iconCheckbox.checked
    const visible = hasPrice || showPriceLabel || showIcon

    costWrapper.style.display = visible ? 'flex' : 'none'
    costWrapper.classList.toggle('with-border', visible)

    captureCostWrapper.style.display = visible ? 'flex' : 'none'
    captureCostWrapper.classList.toggle('with-border', visible)

    scaledCostWrapper.style.display = visible ? 'flex' : 'none'
    scaledCostWrapper.classList.toggle('with-border', visible)
  }

  function toggleActiveClass(input) {
    if (!input || !input.closest) return
    const parent = input.closest('.input-value')
    if (parent) {
      parent.classList.toggle('active', input.value.trim() !== '')
    }
  }

  function clearInput(input) {
    if (!input) return
    input.value = ''
    toggleActiveClass(input)
    const event = new Event('input', { bubbles: true })
    input.dispatchEvent(event)
    if (input === rarityInput) {
      rarityText.querySelector('span').textContent = rarityStyles[rarityStyleSelect.value]
    }
  }

  const ALL_RARITY_CLASSES = [
    'rare',
    'super-rare',
    'ultimate',
    'spotlight',
    'conquest-reward',
    'webshop-reward',
    'bundle',
  ]

  function updateRarityStyle() {
    const selectedStyle = rarityStyleSelect.value

    ALL_RARITY_CLASSES.forEach((c) => {
      rarityText.classList.remove(c)
      captureRarityText.classList.remove(c)
    })
    if (selectedStyle && ALL_RARITY_CLASSES.includes(selectedStyle)) {
      rarityText.classList.add(selectedStyle)
      captureRarityText.classList.add(selectedStyle)
    }

    if (!rarityInput.value.trim()) {
      rarityText.querySelector('span').textContent = rarityStyles[selectedStyle] || ''
      captureRarityText.querySelector('span').textContent = rarityStyles[selectedStyle] || ''
    }

    if (previewContainer) {
      ALL_RARITY_CLASSES.forEach((c) => previewContainer.classList.remove(c))
      if (selectedStyle) previewContainer.classList.add(selectedStyle)
    }
    if (captureContainer) {
      ALL_RARITY_CLASSES.forEach((c) => captureContainer.classList.remove(c))
      if (selectedStyle) captureContainer.classList.add(selectedStyle)
    }
    if (scaledContainer) {
      ALL_RARITY_CLASSES.forEach((c) => scaledContainer.classList.remove(c))
      if (selectedStyle) scaledContainer.classList.add(selectedStyle)
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
    captureCostWrapper.classList.toggle('with-border', costWrapper.classList.contains('with-border'))

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
      scaledCostWrapper.classList.toggle('with-border', costWrapper.classList.contains('with-border'))
    }
  }

  function updatePreview() {
    if (rarityInput.value) {
      rarityText.querySelector('span').textContent = capitalizeWords(rarityInput.value)
    } else {
      rarityText.querySelector('span').textContent = rarityStyles[rarityStyleSelect.value]
    }
    renderCost()
    renderAuthor()
    updateLabelsVisibility()
    updateCaptureContainer()
  }

  customFileButton.addEventListener('click', () => imageInput.click())

  ;[rarityInput, authorInput, priceInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        toggleActiveClass(input)
        updatePreview()
      })
      toggleActiveClass(input)
    }
  })

  document.querySelectorAll('.input-value').forEach((inputValue) => {
    inputValue.addEventListener('click', (e) => {
      if (inputValue.classList.contains('active')) {
        const input = inputValue.querySelector('input')
        if (input && e.offsetX > inputValue.offsetWidth - 30) {
          clearInput(input)
        }
      }
    })
  })

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    previewImage.src = url
    captureImage.src = url
    updateCaptureContainer()
  })

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

  renderCost()
  renderAuthor()
  updateLabelsVisibility()
  updateRarityStyle()
  updateCaptureContainer()

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
    ;[rarityInput, authorInput, priceInput].forEach(toggleActiveClass)
  })

  downloadButton.addEventListener('click', () => {
    const scaledContainerElement = document.getElementById('scaledCaptureContainer')

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
    scaledCostWrapper.classList.toggle('with-border', costWrapper.classList.contains('with-border'))

    const originalDisplay = scaledContainerElement.style.display
    const originalPosition = scaledContainerElement.style.position
    const originalLeft = scaledContainerElement.style.left
    const originalTop = scaledContainerElement.style.top

    scaledContainerElement.style.display = 'flex'
    scaledContainerElement.style.position = 'absolute'
    scaledContainerElement.style.left = '-9999px'
    scaledContainerElement.style.top = '-9999px'

    html2canvas(scaledContainerElement, {
      scale: 2, // HQ
      width: 615,
      height: 850,
      backgroundColor: '#9801e7',
      useCORS: true,
    })
      .then((canvas) => {
        scaledContainerElement.style.display = originalDisplay
        scaledContainerElement.style.position = originalPosition
        scaledContainerElement.style.left = originalLeft
        scaledContainerElement.style.top = originalTop

        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const year = now.getFullYear()
        const time = `${hours}_${minutes}`
        const date = `${day}.${month}.${year}`
        let artist = authorName.textContent || 'Unknown'
        artist = artist.replace(/[<>"'/\\|?*]/g, '').trim()
        const fileName = `Artist_-_${artist}_${time}_${date}.png`.replace(/\s+/g, '_')

        const link = document.createElement('a')
        link.download = fileName
        link.href = canvas.toDataURL('image/png')
        link.click()
      })
      .catch((err) => {
        console.error('Ошибка при рендеринге:', err)
        scaledContainerElement.style.display = originalDisplay
        scaledContainerElement.style.position = originalPosition
        scaledContainerElement.style.left = originalLeft
        scaledContainerElement.style.top = originalTop
      })
  })
})
