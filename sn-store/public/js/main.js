let ALL_PRODUCTS = [];
let ACTIVE_CATEGORY = 'All';

async function fetchProducts() {
  const res = await fetch('/api/products');
  ALL_PRODUCTS = await res.json();
  buildCategoryChips();
  renderGrid(ALL_PRODUCTS);
}

function buildCategoryChips() {
  const wrap = document.querySelector('.categories');
  const categories = ['All', ...new Set(ALL_PRODUCTS.map((p) => p.category))];
  wrap.innerHTML = categories
    .map(
      (cat) =>
        `<button class="chip ${cat === ACTIVE_CATEGORY ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
    )
    .join('');

  wrap.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      ACTIVE_CATEGORY = chip.dataset.cat;
      wrap.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters();
    });
  });
}

function applyFilters() {
  const query = document.querySelector('#search-input').value.trim().toLowerCase();
  let result = ALL_PRODUCTS;
  if (ACTIVE_CATEGORY !== 'All') {
    result = result.filter((p) => p.category === ACTIVE_CATEGORY);
  }
  if (query) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }
  renderGrid(result);
}

function renderGrid(products) {
  const grid = document.querySelector('.product-grid');
  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">
      <h2>No products found</h2>
      <p>Try a different search term or category.</p>
    </div>`;
    return;
  }

  grid.innerHTML = products
    .map((p, idx) => {
      const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
      return `
      <article class="product-card" style="animation-delay:${Math.min(idx * 0.04, 0.4)}s">
        <a href="product.html?id=${p.id}">
          <div class="product-thumb"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        </a>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <a href="product.html?id=${p.id}"><h3 class="product-name">${p.name}</h3></a>
          <div class="product-rating">&#9733; <strong>${p.rating}</strong> (${p.reviews})</div>
          <div class="product-price-row">
            <span class="price">${formatINR(p.price)}</span>
            <span class="mrp">${formatINR(p.mrp)}</span>
            <span class="discount">${discount}% off</span>
          </div>
          <button class="add-btn" data-id="${p.id}">Add to Cart</button>
        </div>
      </article>`;
    })
    .join('');

  grid.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = ALL_PRODUCTS.find((p) => p.id === btn.dataset.id);
      addToCart(product, 1);
      btn.textContent = 'Added ✓';
      btn.classList.add('added');
      showToast(`${product.name} added to cart`);
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.classList.remove('added');
      }, 1200);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  document.querySelector('#search-input').addEventListener('input', applyFilters);
});
