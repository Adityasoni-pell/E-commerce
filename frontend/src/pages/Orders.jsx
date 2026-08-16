import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/mine").then(({ data }) => setOrders(data));
  }, []);

  if (orders.length === 0) {
    return <div className="container"><p>You have no orders yet. <Link to="/">Start shopping</Link></p></div>;
  }

  return (
    <div className="container">
      <h2>My Orders</h2>
      <table className="orders-table">
        <thead>
          <tr><th>Order ID</th><th>Date</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>${o.totalPrice.toFixed(2)}</td>
              <td><span className={`status ${o.status}`}>{o.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
