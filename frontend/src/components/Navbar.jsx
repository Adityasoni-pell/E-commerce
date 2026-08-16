import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🛍️ AI Shop</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {user?.role === "admin" && <Link to="/admin/products">Admin</Link>}
        {user && <Link to="/orders">My Orders</Link>}
        <Link to="/cart">Cart ({itemCount})</Link>
        {user ? (
          <>
            <span className="hello">Hi, {user.name.split(" ")[0]}</span>
            <button
              className="link-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
