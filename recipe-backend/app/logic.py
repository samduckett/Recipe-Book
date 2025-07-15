from fastapi import HTTPException


def get_recipe_by_id(recipes: list[dict], recipe_id: int) -> dict:
    """Return the recipe dict matching the given id, or raise HTTPException."""
    for r in recipes:
        if r["id"] == recipe_id:
            return r
    raise HTTPException(status_code=404, detail="Recipe not found")


def add_recipe(recipes: list[dict], next_id: int, recipe_data: dict) -> dict:
    """Add a new recipe to the list with a unique id."""
    new_recipe = {"id": next_id, **recipe_data}
    recipes.append(new_recipe)
    return new_recipe


def update_recipe(recipes: list[dict], recipe_id: int, new_data: dict) -> dict:
    """Update existing recipe's title and description."""
    recipe = get_recipe_by_id(recipes, recipe_id)
    recipe["title"] = new_data.get("title", recipe["title"])
    recipe["description"] = new_data.get("description", recipe["description"])
    if "ingredients" in new_data:
        recipe["ingredients"] = new_data["ingredients"]
    return recipe


def delete_recipe(recipes: list[dict], recipe_id: int) -> None:
    """Remove recipe by id."""
    recipe = get_recipe_by_id(recipes, recipe_id)
    recipes.remove(recipe)


def search_recipes(recipes: list[dict], query: str) -> list[dict]:
    """Return recipes whose title contains the query (case-insensitive)."""
    q = query.lower()
    return [r for r in recipes if q in r["title"].lower()]


def get_shopping_list(recipes: list[dict]) -> list[str]:
    """Return unique ingredients across all recipes."""
    items = []
    for r in recipes:
        items.extend(r.get("ingredients", []))
    return list(set(items))


meal_plan = {}  # day (str) -> recipe_id (int)


def plan_meal(day: str, recipe_id: int, recipes: list[dict]) -> None:
    """Assign a recipe to a day in the meal plan."""
    # Validate recipe_id exists
    get_recipe_by_id(recipes, recipe_id)
    meal_plan[day.lower()] = recipe_id


def get_meal_plan(recipes: list[dict]) -> dict[str, dict]:
    """Return the full meal plan with recipe details."""
    result = {}
    for day, rid in meal_plan.items():
        result[day] = get_recipe_by_id(recipes, rid)
    return result


def count_ingredients(recipes: list[dict]) -> dict[str, int]:
    """Return a count of how many times each ingredient appears."""
    from collections import Counter
    c = Counter()
    for r in recipes:
        c.update(r.get("ingredients", []))
    return dict(c)
