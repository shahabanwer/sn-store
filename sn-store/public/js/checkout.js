function renderCartPage() {
  const cart = getCart();
  const listEl = document.querySelector('.cart-page-list');
  const layout = document.querySelector('.cart-page-layout');
  const emptyState = document.querySelector('.cart-page-empty');

  if (cart.length === 0) {
    layout.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  layout.style.display = 'grid';
  emptyState.style.display = 'none';

  listEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-page-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <div class="cpi-name">${item.name}</div>
        <div class="cpi-cat">${item.category}</div>
        <div class="qty-row">
          <button class="qty-btn" data-action="dec">&minus;</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc">+</button>
          <a href="#" class="remove-link" data-action="remove">Remove</a>
        </div>
      </div>
      <div class="cpi-price">${formatINR(item.price * item.qty)}</div>
    </div>`
    )
    .join('');

  listEl.querySelectorAll('.cart-page-item').forEach((row) => {
    const id = row.dataset.id;
    const item = cart.find((i) => i.id === id);
    row.querySelector('[data-action="inc"]').addEventListener('click', () => {
      updateCartQty(id, item.qty + 1);
      renderCartPage();
    });
    row.querySelector('[data-action="dec"]').addEventListener('click', () => {
      updateCartQty(id, item.qty - 1);
      renderCartPage();
    });
    row.querySelector('[data-action="remove"]').addEventListener('click', (e) => {
      e.preventDefault();
      removeFromCart(id);
      renderCartPage();
    });
  });

  renderSummary();
}

function renderSummary() {
  const subtotal = cartSubtotal();
  const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  document.querySelector('.sum-subtotal').textContent = formatINR(subtotal);
  document.querySelector('.sum-shipping').textContent = shipping === 0 ? 'Free' : formatINR(shipping);
  document.querySelector('.sum-tax').textContent = formatINR(tax);
  document.querySelector('.sum-total').textContent = formatINR(total);
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.querySelector('.form-error');
  errorEl.textContent = '';

  const customer = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    city: form.city.value.trim(),
    pincode: form.pincode.value.trim()
  };

  const cart = getCart();
  if (cart.length === 0) {
    errorEl.textContent = 'Your cart is empty.';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Placing order...';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
        customer
      })
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Something went wrong. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
      return;
    }

    localStorage.removeItem(CART_KEY);
    window.location.href = `order-success.html?id=${data.id}`;
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  document.querySelector('.checkout-form').addEventListener('submit', handleCheckoutSubmit);
});
