import React, { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: ""
  });
  const [search, setSearch] = useState("");

  // Fetch all recipes
  const fetchRecipes = async () => {
    let url = `${API_URL}/recipes`;
    if (search.trim()) {
      url = `${API_URL}/recipes/search?query=${search}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setRecipes(data);
  };

  useEffect(() => {
    fetchRecipes();
  }, [search]);

  // Handle form input changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit new recipe
  const handleSubmit = async e => {
    e.preventDefault();
    // Split ingredients by comma and trim spaces
    const ingredients = form.ingredients
      .split(",")
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const newRecipe = {
      title: form.title,
      description: form.description,
      ingredients: ingredients
    };

    const res = await fetch(`${API_URL}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecipe)
    });

    if (res.ok) {
      setForm({ title: "", description: "", ingredients: "" });
      fetchRecipes();
    } else {
      alert("Failed to add recipe");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Recipe Book</h1>

      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 20 }}
      />

      <ul>
        {recipes.map(r => (
          <li key={r.id}>
            <strong>{r.title}</strong> - {r.description}
            {r.ingredients && r.ingredients.length > 0 && (
              <p>
                <em>Ingredients:</em> {r.ingredients.join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>

      <h2>Add a New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <input
          name="ingredients"
          placeholder="Ingredients (comma separated)"
          value={form.ingredients}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Add Recipe
        </button>
      </form>
    </div>
  );
}

export default App;
