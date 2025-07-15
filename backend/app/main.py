from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app import logic

app = FastAPI()

recipes = []
next_id = 1


class RecipeBase(BaseModel):
    title: str
    description: str
    ingredients: Optional[List[str]] = []


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    ingredients: Optional[List[str]]


class RecipeOut(RecipeBase):
    id: int


@app.get("/")
def root():
    return {"message": "Welcome to the Recipe API!"}


@app.get("/recipes", response_model=List[RecipeOut])
def list_recipes():
    return recipes


@app.post("/recipes", response_model=RecipeOut)
def create_recipe(recipe: RecipeCreate):
    global next_id
    new_recipe = logic.add_recipe(recipes, next_id, recipe.dict())
    next_id += 1
    return new_recipe


@app.get("/recipes/{recipe_id}", response_model=RecipeOut)
def read_recipe(recipe_id: int):
    return logic.get_recipe_by_id(recipes, recipe_id)


@app.put("/recipes/{recipe_id}", response_model=RecipeOut)
def update_recipe(recipe_id: int, recipe: RecipeUpdate):
    updated = logic.update_recipe(recipes, recipe_id, recipe.dict(exclude_unset=True))
    return updated


@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int):
    logic.delete_recipe(recipes, recipe_id)
    return {"message": "Recipe deleted"}


@app.get("/recipes/search", response_model=List[RecipeOut])
def search_recipes(query: str):
    return logic.search_recipes(recipes, query)


@app.get("/shopping-list", response_model=List[str])
def shopping_list():
    return logic.get_shopping_list(recipes)


@app.post("/meal-plan/{day}")
def plan_meal(day: str, recipe_id: int):
    logic.plan_meal(day, recipe_id, recipes)
    return {"message": f"Planned recipe {recipe_id} for {day}"}


@app.get("/meal-plan", response_model=dict)
def get_meal_plan():
    return logic.get_meal_plan(recipes)


@app.get("/ingredient-usage", response_model=dict)
def ingredient_usage():
    return logic.count_ingredients(recipes)
