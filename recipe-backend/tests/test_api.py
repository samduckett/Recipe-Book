from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Recipe API!"}

def test_create_get_update_delete_recipe():
    # Create a recipe
    recipe_data = {
        "title": "Test Recipe",
        "description": "Test description",
        "ingredients": ["salt", "pepper"]
    }
    response = client.post("/recipes", json=recipe_data)
    assert response.status_code == 200
    created = response.json()
    assert created["title"] == recipe_data["title"]
    recipe_id = created["id"]

    # Get the recipe
    response = client.get(f"/recipes/{recipe_id}")
    assert response.status_code == 200
    fetched = response.json()
    assert fetched == created

    # Update the recipe
    update_data = {
        "title": "Updated Recipe",
        "ingredients": ["salt", "pepper", "garlic"]
    }
    response = client.put(f"/recipes/{recipe_id}", json=update_data)
    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == "Updated Recipe"
    assert "garlic" in updated["ingredients"]

    # Delete the recipe
    response = client.delete(f"/recipes/{recipe_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Recipe deleted"}

    # Confirm deletion
    response = client.get(f"/recipes/{recipe_id}")
    assert response.status_code == 404

def test_search_recipes():
    # Add recipes
    client.post("/recipes", json={"title": "Apple Pie", "description": "", "ingredients": []})
    client.post("/recipes", json={"title": "Banana Bread", "description": "", "ingredients": []})

    response = client.get("/recipes/search?query=apple")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["title"] == "Apple Pie"

def test_shopping_list_and_ingredient_usage():
    # Clean recipes first (if your app allows)
    # For simple test, just add new ones

    client.post("/recipes", json={"title": "Salad", "description": "", "ingredients": ["lettuce", "tomato"]})
    client.post("/recipes", json={"title": "Sandwich", "description": "", "ingredients": ["bread", "lettuce"]})

    response = client.get("/shopping-list")
    assert response.status_code == 200
    shopping = response.json()
    assert "lettuce" in shopping
    assert "tomato" in shopping
    assert "bread" in shopping

    response = client.get("/ingredient-usage")
    assert response.status_code == 200
    usage = response.json()
    assert usage.get("lettuce", 0) >= 2  # lettuce appears twice

def test_meal_plan_endpoints():
    # Add a recipe first
    response = client.post("/recipes", json={"title": "Dinner", "description": "Good dinner", "ingredients": []})
    recipe_id = response.json()["id"]

    # Plan meal
    response = client.post(f"/meal-plan/monday?recipe_id={recipe_id}")
    assert response.status_code == 200

    # Get meal plan
    response = client.get("/meal-plan")
    assert response.status_code == 200
    plan = response.json()
    assert "monday" in plan
    assert plan["monday"]["id"] == recipe_id
