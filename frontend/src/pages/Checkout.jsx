import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/orders", {
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: "COD",
      });
      await fetchCart();
      navigate(`/orders`);
      alert(`Order placed! Order ID: ${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    }
  };

  return (
    <div className="container auth-form">
      <h2>Checkout</h2>
      <form onSubmit={submit}>
        <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <input placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
        <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
        <button type="submit">Place Order</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
