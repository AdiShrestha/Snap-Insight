import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def identify_selector(text: str) -> str:
    """
    Identifies whether the user wants ingredients, steps, or both from a food query.
    
    Args:
        text: User's input query about a food dish
        
    Returns:
        One of: 'ingredients', 'steps', or 'both' (always lowercase, no other strings)
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("GROQ_API_KEY not found in environment variables")
        return "both"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""Analyze this food-related query and determine if the user wants:
    1. Just ingredients - respond with exactly: "ingredients"
    2. Just cooking steps - respond with exactly: "steps" 
    3. Both ingredients and steps - respond with exactly: "both"

    Query: {text}

    Respond with ONLY one of these exact words: ingredients, steps, both"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.1,  # Lower temperature for more deterministic responses
        "max_tokens": 10
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        
        # Extract and clean the response
        selector = response.json()['choices'][0]['message']['content'].strip().lower()
        
        # Strict validation of response
        if selector in {'ingredients', 'steps', 'both'}:
            return selector
        
        # If response contains one of our keywords, extract it
        match = re.search(r'(ingredients|steps|both)', selector, re.IGNORECASE)
        if match:
            return match.group(1).lower()
            
        return "both"  # Default fallback
    
    except Exception as e:
        print(f"Error analyzing selector: {str(e)}")
        return "both"  # Default fallback on any error