# SN Store

A simple e-commerce website with an Express.js backend and a vanilla HTML/CSS/JS frontend.

## Features
- Product listing with category filters and search
- Product details page
- Shopping cart (cart drawer + full cart page), persisted in the browser via `localStorage`
- Order processing (checkout form → order created on the server → confirmation page)
- Prices shown in ₹ (INR)
- Product images sourced from Pexels
- Hover, transition and micro-animations throughout (cart bump, card lift, drawer slide, page fades)

## Project structure
```
sn-store/
├── server.js              Express server + API routes
├── package.json
├── data/
│   ├── products.json      Product catalog
│   └── orders.json        Created automatically once the first order is placed
└── public/
    ├── index.html          Homepage (product grid, filters, search)
    ├── product.html        Product details page
    ├── cart.html           Cart + checkout form
    ├── order-success.html  Order confirmation page
    ├── css/style.css
    └── js/
        ├── cart.js          Shared cart state + cart drawer (loaded on every page)
        ├── main.js          Homepage logic
        ├── product.js       Product page logic
        ├── checkout.js      Cart page + checkout logic
        └── order-success.js Order confirmation logic
```

## Setup

1. Make sure you have [Node.js](https://nodejs.org) 16+ installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser at:
   ```
   http://localhost:3000
   ```

The server runs on port `3000` by default. To use a different port:
```bash
PORT=4000 npm start
```

## API Endpoints

| Method | Endpoint             | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/products`       | List all products (supports `?category=` and `?search=`) |
| GET    | `/api/products/:id`   | Get a single product                 |
| POST   | `/api/orders`         | Place an order (`{ items, customer }`) |
| GET    | `/api/orders/:id`     | Look up an order by its ID           |

## Notes
- Orders are stored in `data/orders.json` on the server (created on first order).
- The cart is kept in the browser's `localStorage`, so it survives page reloads but is per-browser.
- Free shipping applies automatically once the cart subtotal reaches ₹1,999; otherwise a flat ₹79 shipping fee is added. A simplified 5% tax is applied at checkout.
