import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import SearchBar from "../components/SearchBar.jsx";

// Themed banner colors per category, purely cosmetic, matched with seed.js placeholder images
const CATEGORY_THEME = {
  "Electronics": { color: "#6c5ce7", emoji: "🎧" },
  "Clothing": { color: "#00b894", emoji: "👕" },
  "Footwear": { color: "#e17055", emoji: "👟" },
  "Home & Kitchen": { color: "#fdcb6e", emoji: "🍳" },
  "Accessories": { color: "#0984e3", emoji: "🎒" },
  "Sports & Outdoors": { color: "#00cec9", emoji: "🏕️" },
  "Beauty & Personal Care": { color: "#fd79a8", emoji: "💄" },
  "Books": { color: "#2d3436", emoji: "📚" },
  "Toys & Games": { color: "#fab1a0", emoji: "🧸" },
  "Grocery": { color: "#636e72", emoji: "🛒" },
  "Furniture": { color: "#a29bfe", emoji: "🛋️" },
  "Pet Supplies": { color: "#55efc4", emoji: "🐾" },
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search");
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api.get("/products/meta/categories").then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    setMeta(null);
    const load = async () => {
      if (search) {
        const { data } = await api.get(`/search?q=${encodeURIComponent(search)}`);
        setProducts(data.results);
        setMeta(data);
      } else if (category) {
        const { data } = await api.get("/products", { params: { category, limit: 100 } });
        setProducts(data.products);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    load();
  }, [search, category]);

  const goToCategory = (cat) => setSearchParams(cat ? { category: cat } : {});
  const backToShops = () => setSearchParams({});

  // Landing view: a grid of clickable "shop" tiles, one per category
  const showShopGrid = !search && !category;

  return (
    <div className="container">
      <SearchBar />

      {search && (
        <div className="search-meta">
          <p>
            AI results for <strong>“{search}”</strong>
            {meta && (
              <span className="badge">
                {meta.mode === "atlas_vector_search" ? "Atlas Vector Search" : "In-memory fallback"} ·{" "}
                {meta.usingRealEmbeddings ? "OpenAI embeddings" : "local demo embeddings"}
              </span>
            )}
          </p>
        </div>
      )}

      {!search && category && (
        <div className="shop-header">
          <button className="back-btn" onClick={backToShops}>← All Shops</button>
          <h2>{CATEGORY_THEME[category]?.emoji || "🛍️"} {category}</h2>
        </div>
      )}

      {showShopGrid ? (
        <>
          <h2 className="shops-title">Shop by Category</h2>
          <div className="shop-grid">
            {categories.map((c) => (
              <button key={c} className="shop-tile" style={{ "--tile-color": CATEGORY_THEME[c]?.color || "#6c5ce7" }} onClick={() => goToCategory(c)}>
                <span className="shop-tile-emoji">{CATEGORY_THEME[c]?.emoji || "🛍️"}</span>
                <span className="shop-tile-name">{c}</span>
              </button>
            ))}
          </div>
        </>
      ) : loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
