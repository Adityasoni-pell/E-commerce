import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form className="search-bar" onSubmit={submit}>
      <input
        type="text"
        placeholder='Try "something cozy for cold mornings" — AI semantic search'
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit">✨ AI Search</button>
    </form>
  );
}
