import requests
from bs4 import BeautifulSoup
import urllib.parse
import time
import re
import json

def display_recipe(result, selector):
    """Return the formatted recipe string based on selector"""
    if not result or not result.get('url'):
        return "\nNo recipes found for your search."
    
    output = []
    output.append(f"\n{'='*50}")
    output.append(f"Recipe: {result.get('title', 'Untitled Recipe')}")
    output.append(f"Source: {result['url']}")
    output.append(f"{'='*50}")
    
    if selector in ['ingredients', 'both'] and 'ingredients' in result:
        output.append("\nINGREDIENTS:")
        for i, item in enumerate(result['ingredients'], 1):
            output.append(f"{i}. {item}")
    
    if selector in ['steps', 'both'] and 'instructions' in result:
        output.append("\nINSTRUCTIONS:")
        for i, step in enumerate(result['instructions'], 1):
            output.append(f"{i}. {step}")
    
    output.append(f"\n{'='*50}")
    
    return '\n'.join(output)
    
def search_simply_recipes(dish_name):
    """Helper function to search SimplyRecipes"""
    try:
        encoded_query = urllib.parse.quote_plus(dish_name)
        search_url = f"https://www.simplyrecipes.com/search?q={encoded_query}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        for attempt in range(3):
            try:
                response = requests.get(search_url, headers=headers, timeout=20)
                response.raise_for_status()
                break
            except (requests.RequestException, requests.Timeout):
                if attempt == 2:
                    return None
                time.sleep(2)

        soup = BeautifulSoup(response.content, 'html.parser')
        recipe_selectors = [
            'a.comp.card[href*="/recipes/"]',
            'a[href*="/recipes/"]:not([href*="/search"])',
            '.card-list__item a[href*="/recipes/"]'
        ]
        
        for selector_item in recipe_selectors:
            elements = soup.select(selector_item)
            if elements:
                href = elements[0].get('href', '')
                return f"https://www.simplyrecipes.com{href}" if href.startswith('/') else href
        return None
        
    except Exception:
        return None

def search_allrecipes(dish_name):
    """Search AllRecipes.com for recipe URL"""
    try:
        encoded_query = urllib.parse.quote_plus(dish_name)
        search_url = f"https://www.allrecipes.com/search/results/?search={encoded_query}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        for attempt in range(3):
            try:
                response = requests.get(search_url, headers=headers, timeout=20)
                response.raise_for_status()
                break
            except (requests.RequestException, requests.Timeout):
                if attempt == 2:
                    return None
                time.sleep(2)

        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for recipe links in AllRecipes search results
        recipe_selectors = [
            'a[href*="/recipe/"]',
            '.card__title-text a[href*="/recipe/"]',
            '.mntl-card-list-items a[href*="/recipe/"]'
        ]
        
        for selector_item in recipe_selectors:
            elements = soup.select(selector_item)
            if elements:
                href = elements[0].get('href', '')
                return href if href.startswith('http') else f"https://www.allrecipes.com{href}"
        return None
        
    except Exception:
        return None

def search_food_com(dish_name):
    """Search Food.com for recipe URL"""
    try:
        encoded_query = urllib.parse.quote_plus(dish_name)
        search_url = f"https://www.food.com/search/{encoded_query}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        for attempt in range(3):
            try:
                response = requests.get(search_url, headers=headers, timeout=20)
                response.raise_for_status()
                break
            except (requests.RequestException, requests.Timeout):
                if attempt == 2:
                    return None
                time.sleep(2)

        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for recipe links in Food.com search results
        recipe_selectors = [
            'a[href*="/recipe/"]',
            '.recipe-card a[href*="/recipe/"]',
            'h3 a[href*="/recipe/"]'
        ]
        
        for selector_item in recipe_selectors:
            elements = soup.select(selector_item)
            if elements:
                href = elements[0].get('href', '')
                return href if href.startswith('http') else f"https://www.food.com{href}"
        return None
        
    except Exception:
        return None

def extract_json_ld_recipe(soup):
    """Extract recipe from JSON-LD data"""
    try:
        json_scripts = soup.find_all('script', {'type': 'application/ld+json'})
        
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get('@type') == 'Recipe':
                            return item
                elif isinstance(data, dict):
                    if data.get('@type') == 'Recipe':
                        return data
                    elif '@graph' in data:
                        for item in data['@graph']:
                            if isinstance(item, dict) and item.get('@type') == 'Recipe':
                                return item
            except (json.JSONDecodeError, KeyError, TypeError):
                continue
        return None
    except Exception:
        return None

def extract_recipe_from_json_ld(recipe_data):
    """Parse JSON-LD recipe object"""
    extracted = {}
    try:
        # Extract title
        if 'name' in recipe_data:
            extracted['title'] = recipe_data['name']
        
        # Extract ingredients
        if 'recipeIngredient' in recipe_data:
            ingredients = recipe_data['recipeIngredient']
            extracted['ingredients'] = [str(ing) for ing in ingredients] if isinstance(ingredients, list) else [str(ingredients)]
        
        # Extract instructions
        if 'recipeInstructions' in recipe_data:
            instructions = []
            for instruction in recipe_data['recipeInstructions']:
                if isinstance(instruction, dict):
                    if 'text' in instruction:
                        instructions.append(instruction['text'])
                    elif 'name' in instruction:
                        instructions.append(instruction['name'])
                elif isinstance(instruction, str):
                    instructions.append(instruction)
            extracted['instructions'] = instructions
        
        return extracted
    except Exception:
        return extracted

def clean_instruction_text(text):
    """Clean instruction text by removing irrelevant content"""
    # Remove common unwanted phrases
    unwanted_phrases = [
        r'Did you love the recipe\? Let us know with a rating and review!',
        r'Simply Recipes / [A-Za-z\s]+',
        r'READ MORE:',
        r'How to Cook [A-Za-z\s]+',
        r'Simple Tip!',
        r'NUTRITION FACTS.*',
        r'Prep Time:.*',
        r'Cook Time:.*',
        r'Total Time:.*',
        r'Servings:.*',
        r'Author:.*',
        r'Course:.*',
        r'Cuisine:.*',
        r'Method:.*',
        r'Diet:.*'
    ]
    
    cleaned_text = text
    for pattern in unwanted_phrases:
        cleaned_text = re.sub(pattern, '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove multiple consecutive spaces and newlines
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    cleaned_text = cleaned_text.strip()
    
    return cleaned_text

def extract_ingredients_from_html(soup):
    """Extract ingredients using multiple strategies"""
    ingredients = []
    
    # Strategy 1: Look for ingredients in structured data or lists
    ingredient_selectors = [
        # Common ingredient selectors
        '.recipe-ingredients li',
        '.structured-ingredients li', 
        '.ingredients li',
        'ul.ingredients li',
        '.recipe-ingredient',
        '[class*="ingredient"] li',
        # More specific selectors for SimplyRecipes
        '.comp.mntl-structured-ingredients__list-item',
        '.mntl-structured-ingredients__list-item',
        'li[data-ingredient]',
        # Fallback selectors
        'li:contains("-")',  # Lines that contain dashes (common in ingredient lists)
    ]
    
    for selector_item in ingredient_selectors:
        try:
            elements = soup.select(selector_item)
            if elements:
                temp_ingredients = []
                for element in elements:
                    text = element.get_text(strip=True)
                    # Filter out non-ingredient text
                    if (text and len(text) > 2 and 
                        not text.lower().startswith(('method', 'instruction', 'step', 'cook', 'bake', 'heat')) and
                        not text.lower() in ['ingredients', 'directions', 'instructions']):
                        # Clean up the text
                        text = re.sub(r'^\d+\.\s*', '', text)  # Remove leading numbers
                        text = re.sub(r'^-\s*', '', text)      # Remove leading dashes
                        temp_ingredients.append(text)
                
                if temp_ingredients and len(temp_ingredients) >= 3:
                    ingredients = temp_ingredients
                    break
        except Exception:
            continue
    
    # Strategy 2: Look for ingredients in text patterns if first strategy fails
    if not ingredients:
        # Look for text patterns that typically indicate ingredients
        text_content = soup.get_text()
        lines = text_content.split('\n')
        potential_ingredients = []
        
        for line in lines:
            line = line.strip()
            # Look for lines that match ingredient patterns
            if (line and 
                re.match(r'^-?\s*\d+.*(?:cup|tablespoon|teaspoon|pound|ounce|clove|slice)', line, re.IGNORECASE) or
                re.match(r'^-?\s*\d+.*(?:tsp|tbsp|lb|oz|g|kg|ml|l)', line, re.IGNORECASE) or
                re.match(r'^-?\s*(?:Salt|Pepper|Oil|Butter|Flour|Sugar|Egg)', line, re.IGNORECASE)):
                potential_ingredients.append(line.strip('- '))
        
        if len(potential_ingredients) >= 3:
            ingredients = potential_ingredients[:15]  # Limit to reasonable number
    
    return ingredients

def extract_instructions_from_html(soup):
    """Extract cooking instructions using multiple strategies"""
    instructions = []
    
    # Strategy 1: Look for instructions in structured format
    instruction_selectors = [
        # Common instruction selectors
        '.recipe-instructions li',
        '.recipe-method li',
        '.instructions ol li',
        '.instructions li',
        'ol.instructions li',
        '.structured-instructions li',
        # More specific selectors for SimplyRecipes
        '.comp.mntl-sc-block-group--OL li',
        '.mntl-sc-block-group--OL li',
        '.mntl-sc-block.mntl-sc-block-startgroup',
        'li[data-step]',
        # Method section selectors
        '.method li',
        '.recipe-method-text'
    ]
    
    for selector_item in instruction_selectors:
        try:
            elements = soup.select(selector_item)
            if elements:
                temp_instructions = []
                for element in elements:
                    text = element.get_text(strip=True)
                    # Filter for actual cooking instructions
                    if (text and len(text) > 15 and
                        any(verb in text.lower() for verb in ['cook', 'add', 'mix', 'heat', 'stir', 'bake', 'boil', 'place', 'set', 'remove', 'cover', 'combine', 'whisk', 'pour'])):
                        # Clean up the text
                        text = re.sub(r'^\d+\.\s*', '', text)  # Remove step numbers
                        text = re.sub(r'^-\s*', '', text)      # Remove leading dashes
                        text = clean_instruction_text(text)    # Clean unwanted phrases
                        if text and len(text) > 10:  # Only add if still substantial after cleaning
                            temp_instructions.append(text)
                
                if temp_instructions and len(temp_instructions) >= 2:
                    instructions = temp_instructions
                    break
        except Exception:
            continue
    
    # Strategy 2: Look for method sections in plain text
    if not instructions:
        # Find "Method" or "Instructions" sections
        text_content = soup.get_text()
        
        # Look for method sections
        method_patterns = [
            r'Method\s*\n(.*?)(?:\n\n|\nIngredients|\nNutrition|$)',
            r'Instructions\s*\n(.*?)(?:\n\n|\nIngredients|\nNutrition|$)',
            r'Directions\s*\n(.*?)(?:\n\n|\nIngredients|\nNutrition|$)'
        ]
        
        for pattern in method_patterns:
            match = re.search(pattern, text_content, re.DOTALL | re.IGNORECASE)
            if match:
                method_text = match.group(1)
                lines = method_text.split('\n')
                temp_instructions = []
                
                for line in lines:
                    line = line.strip()
                    if (line and len(line) > 20 and
                        any(verb in line.lower() for verb in ['cook', 'add', 'mix', 'heat', 'stir', 'bake', 'boil', 'place', 'set', 'remove'])):
                        # Clean up formatting
                        line = re.sub(r'^\d+\.\s*', '', line)
                        line = re.sub(r'^-\s*', '', line)
                        line = clean_instruction_text(line)
                        if line and len(line) > 10:
                            temp_instructions.append(line)
                
                if len(temp_instructions) >= 2:
                    instructions = temp_instructions[:20]  # Limit to reasonable number
                    break
    
    # Strategy 3: Look for step-by-step text patterns
    if not instructions:
        all_text = soup.get_text()
        sentences = re.split(r'[.!?]+', all_text)
        temp_instructions = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if (len(sentence) > 30 and
                any(verb in sentence.lower() for verb in ['cook', 'add', 'mix', 'heat', 'stir', 'bake', 'boil', 'place', 'set', 'remove', 'cover', 'combine', 'whisk']) and
                not any(word in sentence.lower() for word in ['recipe', 'author', 'photo', 'image', 'website', 'copyright'])):
                cleaned_sentence = clean_instruction_text(sentence)
                if cleaned_sentence and len(cleaned_sentence) > 10:
                    temp_instructions.append(cleaned_sentence + '.')
        
        if len(temp_instructions) >= 3:
            instructions = temp_instructions[:15]
    
    return instructions

def extract_recipe_from_website(recipe_url, selector):
    """Extract recipe data from any supported website"""
    if not recipe_url:
        return None
        
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        for attempt in range(3):
            try:
                response = requests.get(recipe_url, headers=headers, timeout=30)
                response.raise_for_status()
                break
            except (requests.RequestException, requests.Timeout):
                if attempt == 2:
                    return None
                time.sleep(3)

        soup = BeautifulSoup(response.content, 'html.parser')
        
        result = {
            'ingredients': [],
            'instructions': [],
            'url': recipe_url,
            'title': ''
        }

        # Try JSON-LD extraction first (works for all sites)
        recipe_data = extract_json_ld_recipe(soup)
        if recipe_data:
            json_recipe = extract_recipe_from_json_ld(recipe_data)
            if json_recipe:
                if 'title' in json_recipe:
                    result['title'] = json_recipe['title']
                if 'ingredients' in json_recipe and selector in ['ingredients', 'both']:
                    result['ingredients'] = json_recipe['ingredients']
                if 'instructions' in json_recipe and selector in ['steps', 'both']:
                    result['instructions'] = json_recipe['instructions']

        # HTML parsing fallback for missing data
        if selector in ['ingredients', 'both'] and not result['ingredients']:
            result['ingredients'] = extract_ingredients_from_html(soup)

        if selector in ['steps', 'both'] and not result['instructions']:
            result['instructions'] = extract_instructions_from_html(soup)

        # Extract title if not found
        if not result['title']:
            title_selectors = [
                'h1.entry-title',
                'h1.recipe-title', 
                'h1.headline',
                '.recipe-header h1',
                'h1.recipe-summary__h1',  # AllRecipes
                'h1',
                '.recipe-title h1'  # Food.com
            ]
            for selector_item in title_selectors:
                title_element = soup.select_one(selector_item)
                if title_element:
                    title_text = title_element.get_text(strip=True)
                    if title_text and len(title_text) > 3:
                        result['title'] = title_text
                        break

        # Clean up results
        if 'ingredients' in result:
            result['ingredients'] = [ing.strip() for ing in result['ingredients'] if ing.strip()]

        if 'instructions' in result:
            result['instructions'] = [inst.strip() for inst in result['instructions'] if inst.strip()]

        return result

    except Exception as e:
        print(f"Error extracting from {recipe_url}: {str(e)}")
        return None

def is_result_relevant(result, dish_name):
    """Check if the recipe result is relevant to the dish name"""
    if not result or not result.get('title'):
        return False
        
    title = result['title'].lower()
    dish_words = dish_name.lower().split()
    
    # Check if at least one significant word from dish name appears in title
    relevant_words = [word for word in dish_words if len(word) > 3]
    if not relevant_words:
        relevant_words = dish_words
        
    return any(word in title for word in relevant_words)

def get_recipe_data(dish_name: str, selector: str = "both") -> dict:
    """
    Get recipe data from multiple websites with fallback functionality
    
    Args:
        dish_name (str): Name of dish to search for
        selector (str): What to return - 'ingredients', 'steps', or 'both'
        
    Returns:
        dict: Dictionary containing requested recipe components
    """
    # Validate selector input
    selector = selector.lower()
    if selector not in ['ingredients', 'steps', 'both']:
        raise ValueError("Selector must be 'ingredients', 'steps', or 'both'")

    # Default result structure
    default_result = {
        'ingredients': [],
        'instructions': [],
        'url': '',
        'title': ''
    }

    # Website search functions in order of preference
    search_functions = [
        ("SimplyRecipes", search_simply_recipes),
        ("AllRecipes", search_allrecipes),
        ("Food.com", search_food_com)
    ]

    for website_name, search_func in search_functions:
        print(f"Trying {website_name}...")
        
        try:
            recipe_url = search_func(dish_name)
            if not recipe_url:
                print(f"No results found on {website_name}")
                continue
                
            result = extract_recipe_from_website(recipe_url, selector)
            if not result:
                print(f"Failed to extract recipe from {website_name}")
                continue
                
            # Check if result is relevant and has content
            has_content = (
                (selector == 'ingredients' and result.get('ingredients')) or
                (selector == 'steps' and result.get('instructions')) or
                (selector == 'both' and (result.get('ingredients') or result.get('instructions')))
            )
            
            if has_content and is_result_relevant(result, dish_name):
                print(f"Found relevant recipe on {website_name}")
                
                # Return only requested components
                final_result = {
                    'url': result['url'],
                    'title': result['title']
                }

                if selector == 'ingredients':
                    final_result['ingredients'] = result['ingredients']
                elif selector == 'steps':
                    final_result['instructions'] = result['instructions']
                else:  # both
                    final_result.update({
                        'ingredients': result['ingredients'],
                        'instructions': result['instructions']
                    })

                return final_result
            else:
                print(f"Recipe from {website_name} not relevant or incomplete")
                
        except Exception as e:
            print(f"Error with {website_name}: {str(e)}")
            continue
    
    print("No relevant recipes found on any website")
    return default_result

# Example usage and testing
if __name__ == "__main__":
    # Test the function with the chicken lasagna example
    test_dish = "chicken lasagna"
    result = get_recipe_data(test_dish, "both")
    
    print("=== RECIPE EXTRACTION TEST ===")
    print(f"Dish: {test_dish}")
    print(f"URL: {result['url']}")
    print(f"Title: {result['title']}")
    print(f"\nIngredients found: {len(result.get('ingredients', []))}")
    print(f"Instructions found: {len(result.get('instructions', []))}")
    
    if result.get('ingredients'):
        print("\n=== INGREDIENTS ===")
        for i, ingredient in enumerate(result['ingredients'], 1):
            print(f"{i}. {ingredient}")
    
    if result.get('instructions'):
        print("\n=== INSTRUCTIONS ===")
        for i, instruction in enumerate(result['instructions'], 1):
            print(f"{i}. {instruction}")