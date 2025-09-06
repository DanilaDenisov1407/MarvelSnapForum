document.addEventListener('DOMContentLoaded', () => {
  function capitalizeWords(str) {
    return str
      .split(' ')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
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
  const downloadGifButton = document.getElementById('downloadGifButton')
  const costWrapper = document.getElementById('costWrapper')
  const customFileButton = document.querySelector('.custom-file-button')
  const rarityStyleSelect = document.getElementById('rarityStyleSelect')

  const previewContainer = document.querySelector('.preview-container')
  const captureContainer = document.getElementById('captureContainer')
  const scaledCaptureContainer = document.getElementById('scaledCaptureContainer')

  const captureImage = document.getElementById('captureImage')
  const captureRarityText = document.getElementById('captureRarityText')
  const captureAuthorLabel = document.querySelector('#captureAuthorText .author-label')
  const captureAuthorName = document.querySelector('#captureAuthorText .author-name')
  const captureCostText = document.getElementById('captureCostText')
  const captureIconImg = document.getElementById('captureIconImg')
  const capturePriceLabel = document.querySelector('#captureCostWrapper .price-label')
  const captureCostWrapper = document.getElementById('captureCostWrapper')

  const scaledImage = document.getElementById('scaledCaptureImage')
  const scaledRarityText = document.getElementById('scaledRarityText')
  const scaledAuthorLabel = document.querySelector('#scaledAuthorText .author-label')
  const scaledAuthorName = document.querySelector('#scaledAuthorText .author-name')
  const scaledCostText = document.getElementById('scaledCaptureCostText')
  const scaledIconImg = document.getElementById('scaledCaptureIconImg')
  const scaledPriceLabel = document.querySelector('#scaledCostWrapper .price-label')
  const scaledCostWrapper = document.getElementById('scaledCostWrapper')

  const defaultPrice = '1200'
  const defaultAuthor = 'Kim Jacinto'

  const rarityStyles = {
    rare: 'Rare',
    'super-rare': 'Super Rare',
    ultimate: 'Ultimate',
    spotlight: 'Spotlight',
    'conquest-reward': 'Conquest Reward',
    bundle: 'Bundle',
    'webshop-reward': 'Webshop Reward',
  }

  const ALL_STYLE_KEYS = Object.keys(rarityStyles)

  function setRarityText(node, cls, text) {
    if (!node) return
    ALL_STYLE_KEYS.forEach((k) => node.classList.remove(k))
    node.classList.add(cls)
    const span = node.querySelector('span')
    if (span) span.textContent = text
  }

  function setContainerRarityClass(cls) {
    ;[previewContainer, captureContainer, scaledCaptureContainer].forEach((el) => {
      if (!el) return
      ALL_STYLE_KEYS.forEach((k) => el.classList.remove(k))
      el.classList.add(cls)
    })
  }

  function renderCost() {
    const base = priceInput.value || defaultPrice
    costText.textContent = base

    if (iconCheckbox && iconCheckbox.checked) {
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
    if (authorLabel) authorLabel.style.display = authorLabelCheckbox.checked ? 'inline' : 'none'
    if (priceLabel) priceLabel.style.display = priceLabelCheckbox.checked ? 'inline' : 'none'
    updateCostWrapperVisibility()
  }

  function updateCostWrapperVisibility() {
    const hasPrice = priceInput.value && priceInput.value.trim() !== ''
    const showPriceLabel = priceLabelCheckbox.checked
    const showIcon = iconCheckbox.checked
    const visible = hasPrice || showPriceLabel || showIcon

    if (costWrapper) {
      costWrapper.style.display = visible ? 'flex' : 'none'
      costWrapper.classList.toggle('with-border', visible)
    }

    if (captureCostWrapper) {
      captureCostWrapper.style.display = visible ? 'flex' : 'none'
      captureCostWrapper.classList.toggle('with-border', visible)
    }

    if (scaledCostWrapper) {
      scaledCostWrapper.style.display = visible ? 'flex' : 'none'
      scaledCostWrapper.classList.toggle('with-border', visible)
    }
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
      const cls = rarityStyleSelect.value
      setRarityText(rarityText, cls, rarityStyles[cls])
      setRarityText(captureRarityText, cls, rarityStyles[cls])
      setRarityText(scaledRarityText, cls, rarityStyles[cls])
    }
  }

  function updateRarityStyle() {
    const selectedStyle = rarityStyleSelect.value
    const text =
      rarityInput.value && rarityInput.value.trim() !== ''
        ? capitalizeWords(rarityInput.value.trim())
        : rarityStyles[selectedStyle]

    setRarityText(rarityText, selectedStyle, text)
    setRarityText(captureRarityText, selectedStyle, text)
    setRarityText(scaledRarityText, selectedStyle, text)

    setContainerRarityClass(selectedStyle)
  }

  function updateCaptureContainer() {
    if (captureImage) captureImage.src = previewImage.src
    if (captureAuthorLabel) captureAuthorLabel.style.display = authorLabel.style.display
    if (captureAuthorName) captureAuthorName.textContent = authorName.textContent
    if (captureCostText) captureCostText.textContent = costText.textContent
    if (captureIconImg) {
      captureIconImg.src = iconImg.src
      captureIconImg.style.display = iconImg.style.display
    }
    if (capturePriceLabel) capturePriceLabel.style.display = priceLabel.style.display
    if (captureCostWrapper) captureCostWrapper.style.display = costWrapper.style.display
    captureCostWrapper.classList.toggle('with-border', costWrapper.classList.contains('with-border'))

    if (scaledCaptureContainer) {
      scaledImage.src = previewImage.src
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
    const cls = rarityStyleSelect.value
    const text =
      rarityInput.value && rarityInput.value.trim() !== ''
        ? capitalizeWords(rarityInput.value.trim())
        : rarityStyles[cls]

    setRarityText(rarityText, cls, text)
    setRarityText(captureRarityText, cls, text)
    setRarityText(scaledRarityText, cls, text)
    setContainerRarityClass(cls)

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

  // === загрузка картинки / гифа ===
  let uploadedFile = null
  let isGif = false

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return

    uploadedFile = file
    isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')
    if (downloadGifButton) downloadGifButton.disabled = !isGif

    const url = URL.createObjectURL(file)
    previewImage.src = url
    captureImage.src = url
    scaledImage.src = url
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

  // init
  renderCost()
  renderAuthor()
  updateLabelsVisibility()
  updateRarityStyle()
  updateCaptureContainer()

  resetButton.addEventListener('click', () => {
    imageInput.value = ''
    previewImage.src = './img/card-preview.webp'
    captureImage.src = './img/card-preview.webp'
    scaledImage.src = './img/card-preview.webp'
    rarityInput.value = ''
    rarityStyleSelect.value = 'rare'
    setRarityText(rarityText, 'rare', rarityStyles['rare'])
    setRarityText(captureRarityText, 'rare', rarityStyles['rare'])
    setRarityText(scaledRarityText, 'rare', rarityStyles['rare'])
    authorInput.value = ''
    priceInput.value = ''
    iconCheckbox.checked = true
    iconSelect.disabled = false
    iconSelect.value = './img/icons/gold-icon.webp'
    authorLabelCheckbox.checked = true
    priceLabelCheckbox.checked = true
    setContainerRarityClass('rare')
    renderCost()
    renderAuthor()
    updateLabelsVisibility()
    updateCaptureContainer()
    ;[rarityInput, authorInput, priceInput].forEach(toggleActiveClass)
    uploadedFile = null
    isGif = false
    if (downloadGifButton) downloadGifButton.disabled = true
  })

downloadButton.addEventListener('click', () => {
  const scaled = scaledCaptureContainer;

  // Обновляем содержимое полностью
  updateCaptureContainer();

  // Делаем контейнер видимым за экраном
  const originalDisplay = scaled.style.display;
  const originalPosition = scaled.style.position;
  const originalLeft = scaled.style.left;
  const originalTop = scaled.style.top;

  scaled.style.display = 'flex';
  scaled.style.position = 'absolute';
  scaled.style.left = '-9999px';
  scaled.style.top = '-9999px';

  html2canvas(scaled, {
    scale: 1,
    width: 615,
    height: 850,
    useCORS: true, // ✅ важно!
    backgroundColor: null // ✅ прозрачный, возьмёт градиент из CSS
  }).then((canvas) => {
    const link = document.createElement('a');
    link.download = 'card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Возвращаем оригинальные стили
    scaled.style.display = originalDisplay;
    scaled.style.position = originalPosition;
    scaled.style.left = originalLeft;
    scaled.style.top = originalTop;
  });
});

  // ===== GIF export (compose frames + overlay via html2canvas) =====
  downloadGifButton.addEventListener('click', async () => {
    if (!uploadedFile || !isGif) {
      alert('Сначала загрузите анимированный GIF (файл *.gif).')
      return
    }

    // ensure gifuct functions exist
    if (typeof parseGIF !== 'function' || typeof decompressFrames !== 'function') {
      // если библиотека не загружена — просто отдаём оригинал
      const link = document.createElement('a')
      link.href = URL.createObjectURL(uploadedFile)
      link.download = uploadedFile.name || 'card.gif'
      link.click()
      return
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer()
      const parsedGif = parseGIF(arrayBuffer)
      const frames = decompressFrames(parsedGif, true)

      // base canvas — логический размер GIF
      const gifWidth = parsedGif.lsd.width
      const gifHeight = parsedGif.lsd.height
      const baseCanvas = document.createElement('canvas')
      baseCanvas.width = gifWidth
      baseCanvas.height = gifHeight
      const baseCtx = baseCanvas.getContext('2d')

      // encoder — итоговый GIF (размер 615x850)
      const encoder = new window.GIF({
        workers: 2,
        workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
        quality: 10,
        width: 615,
        height: 850,
      })

      const waitImg = (img) =>
        new Promise((res) => {
          if (img.complete) return res()
          img.onload = () => res()
          img.onerror = () => res()
        })

      // показать scaled контейнер offscreen
      const scaled = scaledCaptureContainer
      const originalDisplay = scaled.style.display
      const originalPosition = scaled.style.position
      const originalLeft = scaled.style.left
      const originalTop = scaled.style.top

      scaled.style.display = 'flex'
      scaled.style.position = 'absolute'
      scaled.style.left = '-9999px'
      scaled.style.top = '-9999px'

      // очистить базовый кадр
      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height)

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i]

        // создаём ImageData для патча кадра
        try {
          const imgData = baseCtx.createImageData(frame.dims.width, frame.dims.height)
          imgData.data.set(frame.patch)
          baseCtx.putImageData(imgData, frame.dims.left, frame.dims.top)
        } catch (err) {
          // если putImageData не проходит — fallback: пропустить кадр
          console.warn('Ошибка putImageData для кадра', i, err)
        }

        // вставляем изображение в scaled контейнер (масштабируем baseCanvas до визуального размера)
        // scaledImage отображает картинку; мы используем её src
        scaledImage.src = baseCanvas.toDataURL('image/png')
        await waitImg(scaledImage)

        // рендерим DOM (scaled) в canvas
        // важно: html2canvas вернёт canvas с размерами 615x850
        // eslint-disable-next-line no-await-in-loop
        const rendered = await html2canvas(scaled, {
          scale: 1,
          width: 615,
          height: 850,
          useCORS: true,
          backgroundColor: null,
        })

        // задержка кадра (gifuct-js дает delay в сотых секунды)
        const delayHundredths = frame.delay || 10 // если 0 — ставим 10
        const delayMs = Math.max(20, delayHundredths * 10)

        // добавляем кадр в энкодер: передаем контекст
        encoder.addFrame(rendered.getContext('2d'), { copy: true, delay: delayMs })

        // обработка удаления (disposalType)
        // если disposalType === 2 => очистить область кадра
        if (frame.disposalType === 2) {
          baseCtx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height)
        }
      }

      encoder.on('finished', (blob) => {
        // восстановим scaled
        scaled.style.display = originalDisplay
        scaled.style.position = originalPosition
        scaled.style.left = originalLeft
        scaled.style.top = originalTop

        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'card.gif'
        a.click()
      })

      encoder.render()
    } catch (e) {
      console.error('GIF export error:', e)
      // fallback: отдать оригинальный файл
      const link = document.createElement('a')
      link.href = URL.createObjectURL(uploadedFile)
      link.download = uploadedFile.name || 'card.gif'
      link.click()
    }
  })
})
