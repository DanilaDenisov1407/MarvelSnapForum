 <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      'use strict';

      const $id = id => document.getElementById(id);
      const $sel = sel => document.querySelector(sel);

      function capitalizeWords(str = ''){return String(str).trim().split(/\s+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ')}
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

      // capture elements
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

      // defaults
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

      // Helpers
      function setImgSrcSafe(img, src){
        if(!img) return;
        try{ img.removeAttribute('crossorigin'); }catch{};
        if(typeof src === 'string' && /^https?:\/\//i.test(src)){
          try{ img.crossOrigin = 'anonymous'; }catch{}
        }
        img.src = src || '';
      }

      function renderCost(){
        const base = (priceInput && priceInput.value !== undefined) ? String(priceInput.value).trim() : defaultPrice;
        const textValue = base || defaultPrice;
        const number = parseInt(String(base).replace(/\s+/g, ''), 10) || 0;

        if(iconCheckbox && iconCheckbox.checked){
          // When icon visible — show only number + icon (no declension word)
          safeSetText(costText, textValue);
          if(iconSelect && iconImg) setImgSrcSafe(iconImg, iconSelect.value);
          if(iconImg) iconImg.style.display = 'inline-block';
        } else {
          // No icon — show number + declension word
          const suffixArray = (iconSelect && suffixes[iconSelect.value]) ? suffixes[iconSelect.value] : ['золото','золота','золота'];
          safeSetText(costText, textValue + ' ' + getDeclension(number, suffixArray));
          if(iconImg) iconImg.style.display = 'none';
        }
        updateCostWrapperVisibility();
      }

      function renderAuthor(){
        const name = (authorInput && authorInput.value) ? authorInput.value : defaultAuthor;
        safeSetText(authorName, capitalizeWords(name));
      }

      function updateLabelsVisibility(){
        if(authorLabel) authorLabel.style.display = (authorLabelCheckbox && authorLabelCheckbox.checked) ? 'inline' : 'none';
        if(priceLabel) priceLabel.style.display = (priceLabelCheckbox && priceLabelCheckbox.checked) ? 'inline' : 'none';
        updateCostWrapperVisibility();
      }

      function updateCostWrapperVisibility(){
        const hasPrice = (priceInput && String(priceInput.value || '').trim() !== '');
        if(costWrapper){
          costWrapper.style.display = (hasPrice || (priceLabelCheckbox && priceLabelCheckbox.checked) || (iconCheckbox && iconCheckbox.checked)) ? 'flex' : 'none';
        }
      }

      function toggleActiveClass(input){ if(!input) return; const parent=input.closest('.input-value'); if(parent) parent.classList.toggle('active', String(input.value||'').trim() !== ''); }

      function clearInput(input){ if(!input) return; input.value=''; toggleActiveClass(input); input.dispatchEvent(new Event('input',{bubbles:true})); if(input===rarityInput && rarityStyleSelect){ const style = rarityStyleSelect.value || 'rare'; if(rarityText) safeSetText(rarityText.querySelector('span'), rarityStyles[style]); if(captureRarityText) safeSetText(captureRarityText.querySelector('span'), rarityStyles[style]); if(scaledRarityText) safeSetText(scaledRarityText.querySelector('span'), rarityStyles[style]); } }

      function updateRarityStyle(){
        const style = (rarityStyleSelect && rarityStyleSelect.value) ? rarityStyleSelect.value : 'rare';
        if(rarityText) rarityText.className = 'rarity-block ' + style;
        if(captureRarityText) captureRarityText.className = 'rarity-block ' + style;
        if(scaledRarityText) scaledRarityText.className = 'rarity-block ' + style;

        [previewContainer, captureContainer, scaledCaptureContainer].forEach(container=>{
          if(!container) return;
          allowedRarityClasses.forEach(c=>container.classList.remove(c));
          container.classList.add(style);
        });

        if(rarityInput && String(rarityInput.value||'').trim()===''){
          const mapped = rarityStyles[style] || capitalizeWords(style);
          if(rarityText) safeSetText(rarityText.querySelector('span'), mapped);
          if(captureRarityText) safeSetText(captureRarityText.querySelector('span'), mapped);
          if(scaledRarityText) safeSetText(scaledRarityText.querySelector('span'), mapped);
        }
      }

      // update capture copies
      function updateCaptureContainer(){
        // images (use safe setter for cross-origin safety)
        if(previewImage && captureImage) setImgSrcSafe(captureImage, previewImage.src || '');
        if(previewImage && scaledImage) setImgSrcSafe(scaledImage, previewImage.src || '');

        // rarity
        if(rarityText && captureRarityText){ const spanText = rarityText.querySelector('span') ? rarityText.querySelector('span').textContent : ''; safeSetText(captureRarityText.querySelector('span'), spanText); captureRarityText.className = rarityText.className; }
        if(rarityText && scaledRarityText){ const spanText = rarityText.querySelector('span') ? rarityText.querySelector('span').textContent : ''; safeSetText(scaledRarityText.querySelector('span'), spanText); scaledRarityText.className = rarityText.className; }

        // author
        if(authorLabel && captureAuthorLabel) captureAuthorLabel.style.display = authorLabel.style.display;
        if(authorName && captureAuthorName) captureAuthorName.textContent = authorName.textContent || '';
        if(authorLabel && scaledAuthorLabel) scaledAuthorLabel.style.display = authorLabel.style.display;
        if(authorName && scaledAuthorName) scaledAuthorName.textContent = authorName.textContent || '';

        // price
        if(costText && captureCostText) captureCostText.textContent = costText.textContent || '';
        if(iconImg && captureIconImg) setImgSrcSafe(captureIconImg, iconImg.src || '');
        if(priceLabel && capturePriceLabel) capturePriceLabel.style.display = priceLabel.style.display;
        if(costWrapper && captureCostWrapper) captureCostWrapper.style.display = costWrapper.style.display;

        if(costText && scaledCostText) scaledCostText.textContent = costText.textContent || '';
        if(iconImg && scaledIconImg) setImgSrcSafe(scaledIconImg, iconImg.src || '');
        if(priceLabel && scaledPriceLabel) scaledPriceLabel.style.display = priceLabel.style.display;
        if(costWrapper && scaledCostWrapper) scaledCostWrapper.style.display = costWrapper.style.display;

        // telegram link
        const previewTelegram = $sel('.preview-container .telegram-link');
        const captureTelegram = $sel('#captureContainer .telegram-link');
        const scaledTelegram = $sel('#scaledCaptureContainer .telegram-link');
        if(previewTelegram && captureTelegram) captureTelegram.textContent = previewTelegram.textContent;
        if(previewTelegram && scaledTelegram) scaledTelegram.textContent = previewTelegram.textContent;
      }

      // Wait for images + fonts
      function waitForImages(container, timeout = 4000){
        const imgs = Array.from(container.querySelectorAll('img'));
        if(imgs.length===0) return Promise.resolve();
        return Promise.all(imgs.map(img=> new Promise(resolve=>{
          if(img.complete && img.naturalWidth && img.naturalHeight) return resolve();
          const t = setTimeout(() => resolve(), timeout);
          img.addEventListener('load', ()=>{ clearTimeout(t); resolve(); }, {once:true});
          img.addEventListener('error', ()=>{ clearTimeout(t); resolve(); }, {once:true});
        })));
      }

      // Events
      if(customFileButton && imageInput){
        customFileButton.addEventListener('click', e=>{ e.preventDefault(); imageInput.click(); });
      }

      [rarityInput, authorInput, priceInput].filter(Boolean).forEach(input=>{
        input.addEventListener('input', ()=>{ toggleActiveClass(input); updatePreview(); });
        toggleActiveClass(input);
      });

      document.querySelectorAll('.input-value').forEach(wrapper=>{
        wrapper.addEventListener('click', e=>{
          const input = wrapper.querySelector('input'); if(!input) return;
          if(wrapper.classList.contains('active') && (e.offsetX > wrapper.offsetWidth - 30)){
            clearInput(input);
          }
        });
      });

      if(imageInput){
        imageInput.addEventListener('change', e=>{
          const file = e.target.files && e.target.files[0]; if(!file) return;
          const url = URL.createObjectURL(file);
          if(previewImage) { previewImage.removeAttribute('crossorigin'); previewImage.src = url; }
          if(captureImage) { captureImage.removeAttribute('crossorigin'); captureImage.src = url; }
          if(scaledImage) { scaledImage.removeAttribute('crossorigin'); scaledImage.src = url; }
          updateCaptureContainer();
        });
      }

      if(iconCheckbox){ iconCheckbox.addEventListener('change', ()=>{ if(iconSelect) iconSelect.disabled = !iconCheckbox.checked; updatePreview(); }); }
      if(iconSelect) iconSelect.addEventListener('change', updatePreview);
      if(authorLabelCheckbox) authorLabelCheckbox.addEventListener('change', updatePreview);
      if(priceLabelCheckbox) priceLabelCheckbox.addEventListener('change', updatePreview);
      if(rarityStyleSelect) rarityStyleSelect.addEventListener('change', ()=>{ updateRarityStyle(); updatePreview(); });

      function updatePreview(){
        if(rarityInput && String(rarityInput.value||'').trim() !== ''){
          const text = capitalizeWords(rarityInput.value);
          if(rarityText && rarityText.querySelector('span')) safeSetText(rarityText.querySelector('span'), text);
          if(captureRarityText && captureRarityText.querySelector('span')) safeSetText(captureRarityText.querySelector('span'), text);
          if(scaledRarityText && scaledRarityText.querySelector('span')) safeSetText(scaledRarityText.querySelector('span'), text);
        }
        renderCost();
        renderAuthor();
        updateLabelsVisibility();
        updateCaptureContainer();
      }

      // init
      try{ renderCost(); renderAuthor(); updateLabelsVisibility(); updateRarityStyle(); updateCaptureContainer(); }catch(err){ console.warn('Init warning:', err); }

      if(resetButton){
        resetButton.addEventListener('click', ()=>{
          if(imageInput) imageInput.value='';
          if(previewImage) previewImage.src='./img/card-preview.webp';
          if(captureImage) captureImage.src='./img/card-preview.webp';
          if(scaledImage) scaledImage.src='./img/card-preview.webp';
          if(rarityInput) rarityInput.value='';
          if(rarityStyleSelect) rarityStyleSelect.value='rare';
          if(rarityText && rarityText.querySelector('span')) safeSetText(rarityText.querySelector('span'), rarityStyles['rare']);
          if(authorInput) authorInput.value='';
          if(priceInput) priceInput.value='';
          if(iconCheckbox) iconCheckbox.checked = true;
          if(iconSelect){ iconSelect.disabled = false; iconSelect.value = './img/icons/gold-icon.webp'; }
          if(authorLabelCheckbox) authorLabelCheckbox.checked = true;
          if(priceLabelCheckbox) priceLabelCheckbox.checked = true;
          updateRarityStyle(); renderCost(); renderAuthor(); updateLabelsVisibility(); updateCaptureContainer();
          [rarityInput, authorInput, priceInput].filter(Boolean).forEach(input=> toggleActiveClass(input));
        });
      }

      // Download PNG
      if(downloadButton){
        downloadButton.addEventListener('click', async ()=>{
          if(!scaledCaptureContainer) return;
          // show scaled container
          scaledCaptureContainer.classList.add('visible');
          updateCaptureContainer();

          // wait fonts + images
          try{
            const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
            await Promise.all([fontsReady, waitForImages(scaledCaptureContainer, 4000)]);
          }catch(e){ console.warn('Resources load timeout', e); }

          html2canvas(scaledCaptureContainer, { scale:1, width:615, height:850, backgroundColor:'#050505', useCORS:true }).then(canvas=>{
            const now = new Date();
            const pad = n => String(n).padStart(2,'0');
            const hours = pad(now.getHours()); const minutes = pad(now.getMinutes()); const day = pad(now.getDate()); const month = pad(now.getMonth()+1); const year = now.getFullYear();
            let artist = (authorName && authorName.textContent) ? authorName.textContent : 'Unknown'; artist = String(artist).replace(/[<>"'\/\\|?*]/g,'').trim();
            const fileName = `Artist_-_${artist}_${hours}-${minutes}_${day}.${month}.${year}.png`.replace(/\s+/g,'_');
            const link = document.createElement('a'); link.download = fileName; link.href = canvas.toDataURL('image/png'); link.click();
          }).catch(err=>{ console.error('html2canvas error:', err); }).finally(()=>{
            scaledCaptureContainer.classList.remove('visible');
          });
        });
      }

    });
  </script>
</body>
</html>
