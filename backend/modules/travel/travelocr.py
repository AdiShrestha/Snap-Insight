import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def identify_place(ocr_text: str) -> str:
    """
    Analyzes OCR text to identify and return the main place/destination.
    Returns "Unknown place" if no clear identification can be made.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""Analyze this OCR text from a travel-related image and identify ONLY the main place, city, or destination name. 
    Return JUST THE PLACE NAME, nothing else. If uncertain, make your best guess.

    OCR Text: {ocr_text}"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.3,
        "max_tokens": 30
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        place_name = response.json()['choices'][0]['message']['content'].strip()
        
        # Clean up the response to get just the place name
        place_name = re.sub(r'^(The|This|That|It\'s|It is|Looks like)\s+', '', place_name, flags=re.IGNORECASE)
        place_name = re.sub(r'[.,;!?]*$', '', place_name).strip()
        
        return place_name if place_name else "Unknown place"
    
    except Exception as e:
        print(f"Error analyzing place: {str(e)}")
        return "Unknown place"

def identify_place_from_caption(caption: str) -> str:
    """
    Analyzes image caption to identify and return the main place/destination.
    Optimized for image-generated captions rather than OCR text.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""This is a caption generated from a travel-related image. Identify the most likely place, city, landmark, or destination shown in the image.
    Return JUST THE PLACE NAME. If it's a generic description, make an educated guess about famous places that match.

    Image Caption: {caption}

    Examples:
    - "a mountain with snow" → "Mount Everest" or "Himalayan region"
    - "a lake with boats" → "Pokhara" or "Phewa Lake"
    - "ancient temple architecture" → "Pashupatinath" or "Kathmandu"
    
    Place name:"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.5,
        "max_tokens": 30
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        place_name = response.json()['choices'][0]['message']['content'].strip()
        
        # Clean up the response
        place_name = re.sub(r'^(The|This|That|It\'s|It is|Looks like)\s+', '', place_name, flags=re.IGNORECASE)
        place_name = re.sub(r'[.,;!?]*$', '', place_name).strip()
        
        return place_name if place_name else "Unknown place"
    
    except Exception as e:
        print(f"Error analyzing place from caption: {str(e)}")
        return "Unknown place"
