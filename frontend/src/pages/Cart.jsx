import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { cart, fetchCart, updateQty, removeItem, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  if (!user) {
    return (
      <div className="container">
        <p>Please <Link to="/login">login</Link> to view your cart.</p>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <p>Your cart is empty. <Link to="/">Browse products</Link></p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Shopping Cart</h2>
      <div className="cart-list">
        {cart.items.map((item) => (
          <div className="cart-row" key={item.product}>
            <img src={item.image} alt={item.name} />
            <span className="cart-name">{item.name}</span>
            <input
              type="number"
              min="1"
              value={item.qty}
              onChange={(e) => updateQty(item.product, Number(e.target.value))}
            />
            <span>${(item.price * item.qty).toFixed(2)}</span>
            <button onClick={() => removeItem(item.product)}>Remove</button>
          </div>
        ))}
      </div>
      <h3>Total: ${total.toFixed(2)}</h3>
      <button className="checkout-btn" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
    </div>
  );
}
