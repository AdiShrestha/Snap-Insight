import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def identify_food_dish(ocr_text: str) -> str:
    """
    Analyzes OCR text to identify and return the main food dish.
    Returns "Unknown food" if no clear identification can be made.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""Analyze this OCR text from a food-related image and identify ONLY the main food dish. 
    Return JUST THE FOOD NAME, nothing else. If uncertain, make your best guess.

    OCR Text: {ocr_text}"""

    payload = {
        "model": "llama3-70b-8192",  # Best for this task
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.3,  # Slightly higher for creative dish names
        "max_tokens": 30
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        food_name = response.json()['choices'][0]['message']['content'].strip()
        
        # Clean up the response to get just the food name
        food_name = re.sub(r'^(The|This|That|It\'s|It is|Looks like)\s+', '', food_name, flags=re.IGNORECASE)
        food_name = re.sub(r'[.,;!?]*$', '', food_name).strip()
        
        return food_name if food_name else "Unknown food"
    
    except Exception as e:
        print(f"Error analyzing food: {str(e)}")
        return "Unknown food"

def identify_food_from_caption(caption: str) -> str:
    """
    Analyzes image caption to identify food dish or ingredient.
    Optimized for image-generated captions rather than OCR text.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""This is a caption generated from a food image. Identify the main dish, food item, or ingredient shown.
    Return JUST THE FOOD NAME that would be useful for finding recipes.

    Image Caption: {caption}

    Examples:
    - "a burger with lettuce and tomato" → "burger"
    - "pasta with red sauce" → "pasta with marinara sauce"
    - "chocolate cake on a plate" → "chocolate cake"
    
    Food name:"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.3,
        "max_tokens": 20
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        food_name = response.json()['choices'][0]['message']['content'].strip()
        
        # Clean up the response
        food_name = re.sub(r'^(The|This|That|It\'s|It is|Looks like)\s+', '', food_name, flags=re.IGNORECASE)
        food_name = re.sub(r'[.,;!?]*$', '', food_name).strip()
        
        return food_name if food_name else "Unknown dish"
    
    except Exception as e:
        print(f"Error identifying food from caption: {str(e)}")
        return "Unknown dish"