from modules.cooking.foodocr import identify_food_dish, identify_food_from_caption
from modules.cooking.cookingscraping import get_recipe_data, display_recipe
from modules.cooking.queryselector import identify_selector

def cooking_init(ocr_text: str, query: str, is_caption: bool = False) -> str:
    selector = identify_selector(query)
    
    if is_caption:
        print(f"[DEBUG] Processing image caption for food identification...")
        dish = identify_food_from_caption(ocr_text)
    else:
        dish = identify_food_dish(ocr_text)
    
    print(f"\nSearching SimplyRecipes for '{dish}'...")
    recipe_data = get_recipe_data(dish, selector)
    return display_recipe(recipe_data, selector)


#testing
if __name__ == "__main__":
    ocr_text = "Today's Special: lasagna is a powerful dish famous in Italy. It is made with layers of pasta, cheese, and meat sauce."
    query = "what are the ingredients to cook this?"
    print(cooking_init(ocr_text, query))