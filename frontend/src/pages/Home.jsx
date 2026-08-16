import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import SearchBar from "../components/SearchBar.jsx";

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
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
      } else {
        const { data } = await api.get("/products", { params: { category } });
        setProducts(data.products);
      }
      setLoading(false);
    };
    load();
  }, [search, category]);

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

      {!search && (
        <div className="category-filter">
          <button className={!category ? "active" : ""} onClick={() => setCategory("")}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
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
