import { useEffect, useState } from "react";
import api from "../api/axios.js";

const empty = { name: "", description: "", category: "", brand: "", price: "", countInStock: "", image: "", tags: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/products", { params: { limit: 100 } });
    setProducts(data.products);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      countInStock: Number(form.countInStock),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, description: p.description, category: p.category, brand: p.brand,
      price: p.price, countInStock: p.countInStock, image: p.image, tags: (p.tags || []).join(", "),
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="container">
      <h2>Admin · Product Management</h2>
      <form onSubmit={submit} className="admin-form">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Stock" type="number" value={form.countInStock} onChange={(e) => setForm({ ...form, countInStock: e.target.value })} required />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <button type="submit">{editingId ? "Update Product" : "Create Product"}</button>
        {editingId && <button type="button" onClick={() => { setForm(empty); setEditingId(null); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}

      <table className="orders-table">
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.countInStock}</td>
              <td>
                <button onClick={() => edit(p)}>Edit</button>
                <button onClick={() => remove(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
