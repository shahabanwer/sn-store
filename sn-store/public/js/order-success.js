async function loadOrder() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const box = document.querySelector('.order-id-box');
  const wrap = document.querySelector('.success-wrap');

  if (!id) {
    wrap.innerHTML = `<h1>No order found</h1><p>Head back and place an order first.</p><a class="hero-cta" href="index.html">Continue Shopping</a>`;
    return;
  }

  try {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('not found');
    const order = await res.json();

    document.querySelector('.order-id-value').textContent = order.id;
    document.querySelector('.order-eta').textContent = new Date(order.eta).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    box.innerHTML = `
      <div class="row"><span>Order ID</span><span><strong>${order.id}</strong></span></div>
      <div class="row"><span>Items</span><span>${order.items.reduce((s, i) => s + i.qty, 0)}</span></div>
      <div class="row"><span>Subtotal</span><span>${formatINR(order.subtotal)}</span></div>
      <div class="row"><span>Shipping</span><span>${order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</span></div>
      <div class="row"><span>Tax</span><span>${formatINR(order.tax)}</span></div>
      <div class="row total"><span>Total paid</span><span>${formatINR(order.total)}</span></div>
      <div class="row"><span>Delivering to</span><span>${order.customer.name}, ${order.customer.city}</span></div>
    `;
  } catch (e) {
    box.innerHTML = `<p>We couldn't find that order. It may have expired.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadOrder);
