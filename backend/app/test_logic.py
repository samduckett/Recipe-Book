import pytest
from app import logic

def test_add_and_get_recipe():
    recipes = []
    r1 = {"title": "Pasta", "description": "Yummy", "ingredients": ["pasta", "sauce"]}
    new_r = logic.add_recipe(recipes, 1, r1)
    assert new_r["id"] == 1
    fetched = logic.get_recipe_by_id(recipes, 1)
    assert fetched["title"] == "Pasta"

def test_update_recipe():
    recipes = [{"id": 1, "title": "Old", "description": "Old desc"}]
    updated = logic.update_recipe(recipes, 1, {"title": "New", "description": "New desc"})
    assert updated["title"] == "New"
    assert updated["description"] == "New desc"

def test_delete_recipe():
    recipes = [{"id": 1, "title": "X", "description": "Y"}]
    logic.delete_recipe(recipes, 1)
    assert len(recipes) == 0

def test_search_recipes():
    recipes = [
        {"id": 1, "title": "Apple Pie", "description": "", "ingredients": []},
        {"id": 2, "title": "Banana Bread", "description": "", "ingredients": []}
    ]
    result = logic.search_recipes(recipes, "apple")
    assert len(result) == 1
    assert result[0]["id"] == 1

def test_get_shopping_list():
    recipes = [
        {"id": 1, "ingredients": ["tomato", "cheese"]},
        {"id": 2, "ingredients": ["cheese", "basil"]}
    ]
    items = logic.get_shopping_list(recipes)
    assert set(items) == {"tomato", "cheese", "basil"}

def test_plan_and_get_meal_plan():
    recipes = [{"id": 1, "title": "Pasta", "description": "", "ingredients": []}]
    logic.plan_meal("Monday", 1, recipes)
    plan = logic.get_meal_plan(recipes)
    assert "monday" in plan
    assert plan["monday"]["id"] == 1

def test_count_ingredients():
    recipes = [
        {"id": 1, "ingredients": ["egg", "milk"]},
        {"id": 2, "ingredients": ["egg", "flour"]},
    ]
    counts = logic.count_ingredients(recipes)
    assert counts["egg"] == 2
    assert counts["milk"] == 1
