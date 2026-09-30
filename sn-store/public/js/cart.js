/* Shared cart state (localStorage) + cart drawer UI + toast helper.
   Loaded on every page before the page-specific script. */

const CART_KEY = 'sn_store_cart';
const RUPEE = '\u20B9';

function formatINR(amount) {
  return RUPEE + Math.round(amount).toLocaleString('en-IN');
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      qty
    });
  }
  saveCart(cart);
  renderCartDrawer();
  bumpCartCount();
}

function updateCartQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  } else {
    const item = cart.find((i) => i.id === id);
    if (item) item.qty = qty;
  }
  saveCart(cart);
  renderCartDrawer();
}

function removeFromCart(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  renderCartDrawer();
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartSubtotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = cartCount();
  });
}

function bumpCartCount() {
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.classList.remove('bump');
    void el.offsetWidth; // restart animation
    el.classList.add('bump');
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Cart drawer (present on every page) ---------- */

function buildCartDrawer() {
  if (document.querySelector('.cart-drawer')) return;

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-header">
      <h2>Your Cart</h2>
      <button class="close-btn" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-items"></div>
    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span class="summary-subtotal">${formatINR(0)}</span>
      </div>
      <div class="summary-row total">
        <span>Estimated total</span>
        <span class="summary-total">${formatINR(0)}</span>
      </div>
      <button class="checkout-btn">Go to Checkout</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
  overlay.addEventListener('click', closeDrawer);
  drawer.querySelector('.close-btn').addEventListener('click', closeDrawer);
  drawer.querySelector('.checkout-btn').addEventListener('click', () => {
    window.location.href = 'cart.html';
  });

  document.querySelectorAll('.cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
    });
  });
}

function renderCartDrawer() {
  const drawer = document.querySelector('.cart-drawer');
  if (!drawer) return;
  const cart = getCart();
  const itemsEl = drawer.querySelector('.cart-items');

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Start adding something you like.</div>`;
  } else {
    itemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatINR(item.price)} &times; ${item.qty}</div>
          <div class="qty-row">
            <button class="qty-btn" data-action="dec">&minus;</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc">+</button>
            <a href="#" class="remove-link" data-action="remove">Remove</a>
          </div>
        </div>
      </div>`
      )
      .join('');
  }

  const subtotal = cartSubtotal();
  drawer.querySelector('.summary-subtotal').textContent = formatINR(subtotal);
  drawer.querySelector('.summary-total').textContent = formatINR(subtotal);
  drawer.querySelector('.checkout-btn').disabled = cart.length === 0;

  itemsEl.querySelectorAll('.cart-item').forEach((row) => {
    const id = row.dataset.id;
    const item = cart.find((i) => i.id === id);
    row.querySelector('[data-action="inc"]').addEventListener('click', () =>
      updateCartQty(id, item.qty + 1)
    );
    row.querySelector('[data-action="dec"]').addEventListener('click', () =>
      updateCartQty(id, item.qty - 1)
    );
    row.querySelector('[data-action="remove"]').addEventListener('click', (e) => {
      e.preventDefault();
      removeFromCart(id);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildCartDrawer();
  renderCartDrawer();
  updateCartCount();
});
