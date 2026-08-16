# AI-Powered E-Commerce Platform

Full-stack e-commerce app with **AI semantic search** (vector embeddings + MongoDB Atlas
Vector Search), authentication, product management, and a shopping cart/order flow.

**Stack:** React (Vite) · Node.js/Express · MongoDB Atlas · OpenAI embeddings · JWT auth

---

## ✨ Features

- JWT authentication (register/login), roles: `customer` / `admin`
- Product CRUD (admin-only writes, public reads), categories, text search
- Shopping cart (per user) and order placement with server-side stock/price validation
- **AI-powered semantic search**: product text is embedded (OpenAI `text-embedding-3-small`
  by default) and stored in MongoDB; search queries are embedded and matched with
  MongoDB Atlas **`$vectorSearch`** (cosine similarity), with an automatic in-memory
  cosine-similarity fallback if Atlas Vector Search isn't set up yet — so it's runnable
  even without an OpenAI key or a configured index (using a local deterministic
  fallback embedding for demo purposes).
- "You might also like" recommendations via vector similarity on the product detail page
- Scalable architecture: layered backend (routes → controllers → models), stateless
  JWT auth, rate limiting, helmet security headers, indexes on hot query paths, and a
  design that maps cleanly onto horizontal scaling (stateless API servers behind a load
  balancer + managed Atlas cluster).

---

## 📁 Project Structure

```
ai-ecommerce/
├── backend/
│   ├── config/db.js              # MongoDB Atlas connection
│   ├── models/                   # User, Product, Cart, Order (Mongoose)
│   ├── middleware/                # auth (JWT), error handling
│   ├── controllers/               # business logic
│   ├── routes/                    # Express routers
│   ├── utils/embeddings.js        # OpenAI embeddings + local fallback + cosine similarity
│   ├── scripts/seed.js            # seeds demo users + products (with embeddings)
│   ├── scripts/createVectorIndex.js  # creates the Atlas Vector Search index
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js           # API client (auto-attaches JWT)
        ├── context/                # Auth + Cart React contexts
        ├── components/             # Navbar, ProductCard, SearchBar, PrivateRoute
        └── pages/                  # Home, ProductDetail, Login, Register, Cart,
                                     # Checkout, Orders, AdminProducts
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (M0 tier is fine)
- (Optional but recommended) An [OpenAI API key](https://platform.openai.com/api-keys) for
  real semantic embeddings. **The app runs without one** — it falls back to a local
  deterministic embedding so you can try everything end-to-end for free — but real
  semantic search quality requires a real embedding model.

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env: paste your MONGO_URI (from Atlas), a JWT_SECRET, and OPENAI_API_KEY (optional)
npm install
npm run seed          # creates admin/demo users + 15 sample products with embeddings
npm run create-index  # creates the Atlas Vector Search index (Atlas only, takes ~1 min to build)
npm run dev            # starts the API on http://localhost:5000
```

> If `npm run create-index` fails (e.g. permissions, or you're on an older Atlas tier),
> it prints the exact JSON index definition to paste manually into
> **Atlas UI → your cluster → Search → Create Search Index → JSON Editor** (collection: `products`).
> Until the index exists, semantic search still works via the automatic in-memory fallback.

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env    # defaults to http://localhost:5000/api
npm install
npm run dev              # starts the app on http://localhost:5173
```

Open **http://localhost:5173**. Login with:
- Admin: `admin@example.com` / `admin123`
- Demo customer: `demo@example.com` / `demo1234`

---

## 🔎 How the AI semantic search works

1. On product create/update, `utils/embeddings.js` turns `name + description + category + tags`
   into a vector (1536 dimensions by default) via OpenAI's embeddings API, stored on
   `Product.embedding`.
2. `GET /api/search?q=...` embeds the query the same way, then runs a MongoDB Atlas
   `$vectorSearch` aggregation stage against the `product_vector_index` to find the
   nearest products by cosine similarity — this is real vector search, not keyword matching,
   so a query like *"something cozy for cold mornings"* can surface a French press or a
   throw blanket even without those exact words in the description.
3. If Atlas Vector Search isn't available (local MongoDB, or index still building), the
   same endpoint transparently falls back to computing cosine similarity in memory over
   all product embeddings, so the feature degrades gracefully rather than breaking.
4. `GET /api/search/similar/:id` reuses the same mechanism for "you might also like"
   recommendations on the product page.

---

## 🏗️ Scalability notes

- **Stateless API**: JWT auth means any backend instance can serve any request — run
  multiple Node instances behind a load balancer (e.g. via PM2 cluster mode, Docker + ECS/K8s, or a PaaS).
- **Managed, sharded data layer**: MongoDB Atlas handles replication, automated backups,
  and horizontal scaling (sharding) as data grows; Atlas Search/Vector Search runs on
  separate search nodes so it doesn't compete with OLTP workload.
- **Indexes**: text index on product name/description/category/tags for keyword search,
  a dedicated vector index for semantic search, and a unique index on `User.email`.
- **Rate limiting & security headers** via `express-rate-limit` and `helmet` protect
  against abuse at the edge of the API.
- **Separation of concerns**: routes → controllers → models keeps business logic testable
  and makes it straightforward to split into microservices later (e.g. a dedicated
  search/embeddings service) if traffic warrants it.
- For production: put a CDN in front of the React build, add a Redis cache for hot
  product/category reads, queue embedding generation (e.g. via a job queue) instead of
  generating it inline on every write, and add structured logging/metrics (e.g. via
  OpenTelemetry) for observability.

---

## 🔧 API Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Login, returns JWT |
| GET | `/api/products` | – | List/filter products |
| GET | `/api/products/:id` | – | Product detail |
| POST/PUT/DELETE | `/api/products/:id` | admin | Manage products |
| GET | `/api/search?q=` | – | AI semantic search |
| GET | `/api/search/similar/:id` | – | Similar products |
| GET/POST/PUT/DELETE | `/api/cart` | user | Manage cart |
| POST | `/api/orders` | user | Place order |
| GET | `/api/orders/mine` | user | Order history |
| GET | `/api/orders` | admin | All orders |

---

## Notes

- Payment integration is stubbed as "Cash on Delivery" — swap in Stripe/Razorpay in
  `orderController.js` for a production checkout.
- This is a learning/starter-grade implementation, not a production-hardened deployment —
  review auth, input validation, and secrets management before going live.
