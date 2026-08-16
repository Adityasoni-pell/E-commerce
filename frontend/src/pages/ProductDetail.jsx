import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
    api.get(`/search/similar/${id}`).then(({ data }) => setSimilar(data.results)).catch(() => {});
  }, [id]);

  const handleAdd = async () => {
    if (!user) {
      setMsg("Please login to add items to your cart.");
      return;
    }
    await addToCart(id, qty);
    setMsg("Added to cart!");
  };

  if (!product) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <div className="product-detail">
        <img src={product.image} alt={product.name} />
        <div>
          <h2>{product.name}</h2>
          <p className="category">{product.category} · {product.brand}</p>
          <p className="price">${product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          <p>{product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}</p>
          <div className="qty-row">
            <input type="number" min="1" max={product.countInStock} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            <button onClick={handleAdd} disabled={product.countInStock === 0}>Add to Cart</button>
          </div>
          {msg && <p className="msg">{msg}</p>}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="similar-section">
          <h3>You might also like (AI-recommended)</h3>
          <div className="product-grid">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
