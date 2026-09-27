/* This file only handles the homepage product grid / category filter / custom-text modal.
   Cart, checkout, PromptPay QR, LINE and sheet logging now live in shop-common.js (shared across pages). */

let currentCategory = 'All';

/* ================== Category tabs ================== */
function renderCategoryTabs(){
  const wrap = document.getElementById('cat-tabs');
  wrap.innerHTML = window.CATEGORIES.map(c =>
    `<button data-cat="${c}" class="${c === currentCategory ? 'active' : ''}">${c}</button>`
  ).join('');
  wrap.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-cat');
      renderCategoryTabs();
      renderProducts();
    });
  });
}

/* ================== Product grid ================== */
function renderProducts(){
  const grid = document.getElementById('product-grid');
  const list = window.PRODUCTS.filter(p => currentCategory === 'All' || p.category === currentCategory);
  grid.innerHTML = list.map(p => `
    <div class="card">
      <div class="card-thumb">${p.image ? `<img src="${p.image}" data-path="${p.image}" onerror="placeholderify(this)" alt="${p.name}">` : p.icon}</div>
      ${p.custom ? '<span class="tag-custom">Custom text available</span>' : ''}
      <h3>${p.name}</h3>
      <div class="desc">${p.desc}</div>
      <div class="row">
        <div class="price">฿${p.price}<small> /${p.priceUnit || 'pc'}</small></div>
        <button class="btn" data-open="${p.id}">${p.detailPage ? 'View Options' : (p.custom ? 'Customize' : 'Add to Cart')}</button>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = window.PRODUCTS.find(p => p.id === btn.getAttribute('data-open'));
      if (product.detailPage){
        window.location.href = product.detailPage;
      } else if (product.custom){
        openCustomModal(product);
      } else {
        addToCart({ id: product.id, name: product.name, price: product.price, qty: 1, customNote: '' });
        showToast('Added to cart');
      }
    });
  });
}

/* ================== Custom text modal (for simple customizable products) ================== */
function openCustomModal(product){
  const overlay = document.createElement('div');
  overlay.className = 'overlay center';
  overlay.innerHTML = `
    <div class="panel modal">
      <div class="panel-head"><h2>${product.name}</h2><button class="close-x">&times;</button></div>
      <div class="preview-box preview-font-serif" id="preview-text">Type your text</div>
      <div class="field">
        <label>Engraving text (10 characters or fewer recommended)</label>
        <input id="custom-text" maxlength="20" placeholder="e.g. Amy / Happy Birthday">
      </div>
      <div class="field">
        <label>Font style</label>
        <select id="custom-font">
          <option value="serif">Classic Serif</option>
          <option value="sans">Bold Sans</option>
        </select>
      </div>
      <div class="hint">This is an illustrative preview — actual engraving may vary slightly.</div>
      <button class="btn dark" id="add-custom-btn">Add to Cart</button>
    </div>`;
  document.body.appendChild(overlay);

  const textInput = overlay.querySelector('#custom-text');
  const fontSelect = overlay.querySelector('#custom-font');
  const preview = overlay.querySelector('#preview-text');
  function refreshPreview(){
    preview.textContent = textInput.value.trim() || 'Type your text';
    preview.className = 'preview-box ' + (fontSelect.value === 'sans' ? 'preview-font-sans' : 'preview-font-serif');
  }
  textInput.addEventListener('input', refreshPreview);
  fontSelect.addEventListener('change', refreshPreview);

  overlay.querySelector('.close-x').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#add-custom-btn').addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text){ textInput.focus(); return; }
    const fontLabel = fontSelect.value === 'sans' ? 'Bold Sans' : 'Classic Serif';
    addToCart({ id: product.id, name: product.name, price: product.price, qty: 1, customNote: `Text: "${text}", Font: ${fontLabel}` });
    showToast('Added to cart');
    overlay.remove();
  });
}

/* ================== init ================== */
renderCategoryTabs();
renderProducts();
