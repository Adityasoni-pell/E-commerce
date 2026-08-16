import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  const fetchCart = useCallback(async () => {
    if (!user) return;
    const { data } = await api.get("/cart");
    setCart(data);
  }, [user]);

  const addToCart = async (productId, qty = 1) => {
    const { data } = await api.post("/cart", { productId, qty });
    setCart(data);
  };

  const updateQty = async (productId, qty) => {
    const { data } = await api.put(`/cart/${productId}`, { qty });
    setCart(data);
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete("/cart");
    setCart({ items: [] });
  };

  const itemCount = cart.items?.reduce((s, i) => s + i.qty, 0) || 0;
  const total = cart.items?.reduce((s, i) => s + i.qty * i.price, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, fetchCart, addToCart, updateQty, removeItem, clearCart, itemCount, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
