import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="category">{product.category}</p>
        <p className="price">${product.price?.toFixed(2)}</p>
        {typeof product.score === "number" && (
          <p className="score">Match: {(product.score * 100).toFixed(0)}%</p>
        )}
      </div>
    </Link>
  );
}
