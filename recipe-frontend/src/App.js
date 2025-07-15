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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editRecipeId, setEditRecipeId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    ingredients: ""
  });

  const [mealPlan, setMealPlan] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [ingredientUsage, setIngredientUsage] = useState({});

  // Fetch recipes (search or all)
  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/recipes`;
      if (search.trim()) {
        url = `${API_URL}/recipes/search?query=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecipes(data);
      } else {
        setRecipes([]);
      }
    } catch (e) {
      setError(e.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meal plan
  const fetchMealPlan = async () => {
    try {
      const res = await fetch(`${API_URL}/meal-plan`);
      if (!res.ok) throw new Error("Failed to fetch meal plan");
      const data = await res.json();
      setMealPlan(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Fetch shopping list
  const fetchShoppingList = async () => {
    try {
      const res = await fetch(`${API_URL}/shopping-list`);
      if (!res.ok) throw new Error("Failed to fetch shopping list");
      const data = await res.json();
      setShoppingList(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Fetch ingredient usage
  const fetchIngredientUsage = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredient-usage`);
      if (!res.ok) throw new Error("Failed to fetch ingredient usage");
      const data = await res.json();
      setIngredientUsage(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Initial data load and refetch on search change
  useEffect(() => {
    fetchRecipes();
    fetchMealPlan();
    fetchShoppingList();
    fetchIngredientUsage();
  }, [search]);

  // Handle input changes for add form
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle input changes for edit form
  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Add a new recipe
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    const ingredients = form.ingredients
      .split(",")
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const newRecipe = {
      title: form.title,
      description: form.description,
      ingredients
    };

    try {
      const res = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipe)
      });
      if (!res.ok) throw new Error("Failed to add recipe");
      setForm({ title: "", description: "", ingredients: "" });
      fetchRecipes();
      fetchShoppingList();
      fetchIngredientUsage();
    } catch (e) {
      setError(e.message);
    }
  };

  // Delete a recipe
  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/recipes/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete recipe");
      fetchRecipes();
      fetchShoppingList();
      fetchIngredientUsage();
      fetchMealPlan();
    } catch (e) {
      setError(e.message);
    }
  };

  // Start editing a recipe
  const startEdit = recipe => {
    setEditRecipeId(recipe.id);
    setEditForm({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients ? recipe.ingredients.join(", ") : ""
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditRecipeId(null);
    setEditForm({ title: "", description: "", ingredients: "" });
  };

  // Submit recipe update
  const handleEditSubmit = async e => {
    e.preventDefault();
    setError(null);

    const ingredients = editForm.ingredients
      .split(",")
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const updatedRecipe = {
      title: editForm.title,
      description: editForm.description,
      ingredients
    };

    try {
      const res = await fetch(`${API_URL}/recipes/${editRecipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecipe)
      });
      if (!res.ok) throw new Error("Failed to update recipe");
      setEditRecipeId(null);
      setEditForm({ title: "", description: "", ingredients: "" });
      fetchRecipes();
      fetchShoppingList();
      fetchIngredientUsage();
      fetchMealPlan();
    } catch (e) {
      setError(e.message);
    }
  };

  // Plan a meal for a given day
  const handlePlanMeal = async (day, recipeId) => {
    setError(null);
    try {
      // Your backend expects POST /meal-plan/{day}?recipe_id=...
      const res = await fetch(`${API_URL}/meal-plan/${day}?recipe_id=${recipeId}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to plan meal");
      fetchMealPlan();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h1>Recipe Book</h1>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 20 }}
      />

      {loading ? (
        <p>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <ul>
          {recipes.map(r => (
            <li key={r.id} style={{ marginBottom: 20 }}>
              {editRecipeId === r.id ? (
                <form onSubmit={handleEditSubmit} style={{ marginBottom: 10 }}>
                  <input
                    name="title"
                    placeholder="Title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                    style={{ width: "100%", padding: 8, marginBottom: 5 }}
                  />
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={3}
                    style={{ width: "100%", padding: 8, marginBottom: 5 }}
                  />
                  <input
                    name="ingredients"
                    placeholder="Ingredients (comma separated)"
                    value={editForm.ingredients}
                    onChange={handleEditChange}
                    style={{ width: "100%", padding: 8, marginBottom: 5 }}
                  />
                  <button type="submit" style={{ marginRight: 10 }}>
                    Save
                  </button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <strong>{r.title}</strong> - {r.description}
                  {r.ingredients && r.ingredients.length > 0 && (
                    <p>
                      <em>Ingredients:</em> {r.ingredients.join(", ")}
                    </p>
                  )}
                  <button
                    onClick={() => startEdit(r)}
                    style={{ marginRight: 10, padding: "5px 10px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{ padding: "5px 10px" }}
                  >
                    Delete
                  </button>

                  <div style={{ marginTop: 10 }}>
                    <label>
                      Plan meal for day:{" "}
                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handlePlanMeal(e.target.value, r.id);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select day
                        </option>
                        {[
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                          "sunday"
                        ].map(day => (
                          <option key={day} value={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2>Add a New Recipe</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
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

      <h2>Current Meal Plan</h2>
      {Object.keys(mealPlan).length === 0 ? (
        <p>No meals planned yet.</p>
      ) : (
        <ul>
          {Object.entries(mealPlan).map(([day, recipe]) => (
            <li key={day}>
              <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong>{" "}
              {recipe.title}
            </li>
          ))}
        </ul>
      )}

      <h2>Shopping List</h2>
      {shoppingList.length === 0 ? (
        <p>No ingredients yet.</p>
      ) : (
        <ul>
          {shoppingList.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <h2>Ingredient Usage Count</h2>
      {Object.keys(ingredientUsage).length === 0 ? (
        <p>No ingredients yet.</p>
      ) : (
        <ul>
          {Object.entries(ingredientUsage).map(([ingredient, count]) => (
            <li key={ingredient}>
              {ingredient}: {count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
