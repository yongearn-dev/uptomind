/* ================== Basic settings — edit only these lines when needed ================== */
const PROMPTPAY_ID = '0887801158';
const SHOP_NAME = 'uptomind';
const SHOP_CITY = 'BANGKOK';
const LINE_OA_ID = '@598orgjd';           // LINE Official Account Basic ID
const SHEETS_WEBHOOK_URL = '';            // TODO: paste your deployed Google Apps Script URL here

/* ================== Shared color palette (used by product option pages) ================== */
window.COLOR_PALETTE = [
  { name:'Pink', hex:'#FF3D8D' },
  { name:'Red', hex:'#B23A2E' },
  { name:'Orange', hex:'#E8641C' },
  { name:'Bright Orange', hex:'#F2941D' },
  { name:'Flesh', hex:'#F2C79B' },
  { name:'Yellow', hex:'#F5D400' },
  { name:'Dark Pink', hex:'#B85C9E' },
  { name:'Purple', hex:'#5B1E91' },
  { name:'Brown', hex:'#6B4226' },
  { name:'Khaki', hex:'#C9A66B' },
  { name:'Gray', hex:'#A9A6A0' },
  { name:'White', hex:'#FFFFFF' },
  { name:'Light Green', hex:'#4CC98A' },
  { name:'Dark Green', hex:'#1F6B3A' },
  { name:'Tiffany Blue', hex:'#4FD3C4' },
  { name:'Cyan', hex:'#2CA9E1' },
  { name:'Blue', hex:'#1E3FBB' },
  { name:'Black', hex:'#1A1A1A' },
];

/* ================== Image placeholder helper ==================
   Use on any <img data-path="images/xxx.jpg" onerror="placeholderify(this)">.
   Until the real photo is added at that path, this shows a friendly placeholder
   instead of a broken-image icon — once the file exists, it just displays normally. */
function placeholderify(img){
  const path = img.getAttribute('data-path') || img.getAttribute('src') || '';
  const small = img.hasAttribute('data-small');
  const div = document.createElement('div');
  div.className = 'img-placeholder' + (small ? ' small' : '');
  div.innerHTML = small ? '📷' : `<span>📷</span><small>${path}</small>`;
  img.replaceWith(div);
}

/* ================== Cart storage (shared across pages via localStorage) ================== */
const CART_KEY = 'uptomind_cart_v1';
let _memCart = []; // fallback if localStorage is unavailable (e.g. private browsing)

function loadCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return _memCart; }
}
function saveCart(cart){
  try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  catch(e){ _memCart = cart; }
}
function addToCart(item){
  // item: { id, name, price, qty, customNote }
  const cart = loadCart();
  cart.push(item);
  saveCart(cart);
  updateCartFab();
}
function cartTotal(cart){ return cart.reduce((sum, i) => sum + i.price * i.qty, 0); }
function cartCount(cart){ return cart.reduce((sum, i) => sum + i.qty, 0); }

function updateCartFab(){
  const fab = document.getElementById('cart-fab');
  if (!fab) return;
  const cart = loadCart();
  document.getElementById('cart-count').textContent = cartCount(cart);
  fab.classList.toggle('hidden', cartCount(cart) === 0);
}

/* ================== Cart drawer ================== */
function openCartDrawer(){
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h2>My Cart</h2><button class="close-x">&times;</button></div>
      <div id="cart-items"></div>
      <div class="cart-total"><span>Total</span><span id="cart-total-amt"></span></div>
      <button class="btn dark" id="checkout-btn">Proceed to Payment</button>
    </div>`;
  document.body.appendChild(overlay);

  function renderItems(){
    const cart = loadCart();
    const wrap = overlay.querySelector('#cart-items');
    if (cart.length === 0){ wrap.innerHTML = '<div class="empty">Your cart is empty</div>'; return; }
    wrap.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div>
          ${item.name}
          ${item.customNote ? `<div class="custom-note">${item.customNote}</div>` : ''}
          <div class="hint">฿${item.price} x ${item.qty}</div>
        </div>
        <div class="qty-ctrl">
          <button data-dec="${idx}">−</button><span>${item.qty}</span><button data-inc="${idx}">+</button>
        </div>
      </div>`).join('');
    wrap.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
      const cart = loadCart(); cart[b.getAttribute('data-inc')].qty++; saveCart(cart); refresh();
    }));
    wrap.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
      const cart = loadCart(); const idx = b.getAttribute('data-dec');
      cart[idx].qty--; if (cart[idx].qty <= 0) cart.splice(idx, 1);
      saveCart(cart); refresh();
    }));
  }
  function refresh(){
    const cart = loadCart();
    renderItems();
    overlay.querySelector('#cart-total-amt').textContent = '฿' + cartTotal(cart);
    overlay.querySelector('#checkout-btn').disabled = cartCount(cart) === 0;
    updateCartFab();
  }
  refresh();
  overlay.querySelector('.close-x').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#checkout-btn').addEventListener('click', () => {
    if (cartCount(loadCart()) === 0) return;
    overlay.remove();
    openCheckoutModal();
  });
}

/* ================== PromptPay dynamic QR (EMVCo spec, pure client-side) ================== */
function tlv(id, value){
  const len = String(value.length).padStart(2, '0');
  return id + len + value;
}
function sanitizeTarget(raw){
  let t = (raw || '').replace(/[^0-9]/g, '');
  if (t.length >= 13) return t.padStart(13, '0');
  if (t.length === 10 && t.startsWith('0')) t = '66' + t.substring(1);
  return t.padStart(13, '0');
}
function crc16(str){
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    for (let b = 0; b < 8; b++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function buildPromptPayPayload(target, amount, merchantName, city){
  const account = tlv('00', 'A000000677010111') + tlv('01', sanitizeTarget(target));
  const body =
    tlv('00', '01') +
    tlv('01', amount ? '12' : '11') +
    tlv('29', account) +
    tlv('53', '764') +
    (amount ? tlv('54', Number(amount).toFixed(2)) : '') +
    tlv('58', 'TH') +
    tlv('59', (merchantName || 'SHOP').substring(0, 25)) +
    tlv('60', (city || 'BANGKOK').substring(0, 15)) +
    '6304';
  return body + crc16(body);
}

/* ================== Checkout: QR + copy order + LINE + sheet logging ================== */
function buildOrderText(orderId, cart, total){
  const lines = cart.map(item => `- ${item.name} x${item.qty}${item.customNote ? ` (${item.customNote})` : ''}`);
  return `[uptomind Order]\nOrder ID: ${orderId}\n${lines.join('\n')}\nTotal: ฿${total}`;
}

// Official Account prefilled-message deep link: opens LINE with the chat and message ready to send
function buildLineMessageLink(text){
  return `https://line.me/R/oaMessage/${encodeURIComponent(LINE_OA_ID)}/?${encodeURIComponent(text)}`;
}

async function logOrderToSheet(orderId, cart, total){
  if (!SHEETS_WEBHOOK_URL) return;
  const itemsText = cart.map(i => `${i.name} x${i.qty}${i.customNote ? ` (${i.customNote})` : ''}`).join('; ');
  try{
    await fetch(SHEETS_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ orderId, itemsText, total }) });
  }catch(e){ console.error('Failed to log order to sheet', e); }
}

function openCheckoutModal(){
  const cart = loadCart();
  const total = cartTotal(cart);
  const orderId = 'ORD' + Date.now().toString().slice(-8);
  const orderText = buildOrderText(orderId, cart, total);

  const overlay = document.createElement('div');
  overlay.className = 'overlay center';
  overlay.innerHTML = `
    <div class="panel modal">
      <div class="panel-head"><h2>Scan to Pay</h2><button class="close-x">&times;</button></div>
      <div class="order-id">Order ID: ${orderId}</div>
      <div class="qr-box">
        <div id="qr-canvas"></div>
        <div class="qr-amount">฿${total}</div>
        <div class="qr-note">Scan this PromptPay QR code with your banking app or LINE to pay</div>
      </div>
      <div class="order-summary">${orderText}</div>
      <div class="btn-row">
        <button class="btn ghost small" id="copy-btn">Copy Order Details</button>
        <button class="btn line small" id="line-btn">Send via LINE</button>
      </div>
      <button class="btn dark" id="done-btn">I've completed the steps above</button>
      <div class="hint">Sending via LINE already includes your order details — just attach your payment screenshot and send. We'll confirm and ship as soon as possible.</div>
    </div>`;
  document.body.appendChild(overlay);

  const payload = buildPromptPayPayload(PROMPTPAY_ID, total, SHOP_NAME, SHOP_CITY);
  new QRCode(overlay.querySelector('#qr-canvas'), { text: payload, width: 180, height: 180 });

  overlay.querySelector('.close-x').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(orderText).then(() => showToast('Order details copied'));
  });
  overlay.querySelector('#line-btn').addEventListener('click', () => {
    window.open(buildLineMessageLink(orderText), '_blank');
  });
  overlay.querySelector('#done-btn').addEventListener('click', async () => {
    await logOrderToSheet(orderId, cart, total);
    saveCart([]);
    overlay.remove();
    updateCartFab();
    showToast('Thank you! Please check LINE for updates');
  });
}

/* ================== toast (shared site-wide) ================== */
let _toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

/* ================== Wire up the cart button on every page load ================== */
document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('cart-fab');
  if (fab) fab.addEventListener('click', openCartDrawer);
  updateCartFab();
});
