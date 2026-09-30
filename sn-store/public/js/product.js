let CURRENT_PRODUCT = null;
let SELECTED_QTY = 1;

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadProduct() {
  const id = getProductIdFromUrl();
  const container = document.querySelector('.pd-layout');
  if (!id) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h2>No product selected</h2><p><a href="index.html">Go back to shopping</a></p></div>`;
    return;
  }

  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h2>Product not found</h2><p><a href="index.html">Go back to shopping</a></p></div>`;
    return;
  }
  CURRENT_PRODUCT = await res.json();
  renderProduct(CURRENT_PRODUCT);
}

function renderProduct(p) {
  document.title = `${p.name} · SN Store`;
  document.querySelector('#breadcrumb-name').textContent = p.name;

  const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const lowStock = p.stock <= 15;

  document.querySelector('.pd-image img').src = p.image;
  document.querySelector('.pd-image img').alt = p.name;
  document.querySelector('.pd-category').textContent = p.category;
  document.querySelector('.pd-name').textContent = p.name;
  document.querySelector('.pd-rating').innerHTML = `&#9733; <strong>${p.rating}</strong> &middot; ${p.reviews} ratings`;
  document.querySelector('.pd-price').textContent = formatINR(p.price);
  document.querySelector('.pd-mrp').textContent = formatINR(p.mrp);
  document.querySelector('.pd-discount').textContent = `${discount}% off`;
  document.querySelector('.pd-tagline').textContent = p.tagline;
  document.querySelector('.pd-desc').textContent = p.description;
  document.querySelector('.stock-note').textContent = lowStock
    ? `Only ${p.stock} left in stock`
    : 'In stock, ready to ship';
  document.querySelector('.stock-note').classList.toggle('low', lowStock);

  document.querySelector('.pd-specs ul').innerHTML = p.specs
    .map((s) => `<li>${s}</li>`)
    .join('');

  document.querySelector('.qty-value').textContent = SELECTED_QTY;
}

function bindQtyControls() {
  document.querySelector('.qty-minus').addEventListener('click', () => {
    if (SELECTED_QTY > 1) SELECTED_QTY -= 1;
    document.querySelector('.qty-value').textContent = SELECTED_QTY;
  });
  document.querySelector('.qty-plus').addEventListener('click', () => {
    if (CURRENT_PRODUCT && SELECTED_QTY < CURRENT_PRODUCT.stock) SELECTED_QTY += 1;
    document.querySelector('.qty-value').textContent = SELECTED_QTY;
  });
}

function bindActions() {
  document.querySelector('.btn-add').addEventListener('click', () => {
    if (!CURRENT_PRODUCT) return;
    addToCart(CURRENT_PRODUCT, SELECTED_QTY);
    showToast(`${CURRENT_PRODUCT.name} added to cart`);
  });
  document.querySelector('.btn-buy').addEventListener('click', () => {
    if (!CURRENT_PRODUCT) return;
    addToCart(CURRENT_PRODUCT, SELECTED_QTY);
    window.location.href = 'cart.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindQtyControls();
  bindActions();
  loadProduct();
});
