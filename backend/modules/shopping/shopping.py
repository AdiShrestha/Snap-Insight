import re
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import search_daraz function
try:
    from .newshopping import search_daraz
except ImportError:
    try:
        from newshopping import search_daraz
    except ImportError:
        print("Warning: Could not import search_daraz function")
        def search_daraz(query):
            return {
                "status": "error",
                "query": query,
                "message": "search_daraz function not available"
            }

def identify_item(ocr_text: str) -> str:

    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""Given the following OCR text from a shopping-related image, extract ONLY the main product name or model that can be bought (e.g., 'iPhone 15', 'Samsung TV'). 
    Return JUST THE NAME, nothing else. If uncertain, make your best guess.

    OCR Text: {ocr_text}"""

    payload = {
        "model": "llama3-70b-8192",  # Best for this task
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.3,  # Lower temperature for more consistent results
        "max_tokens": 30
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        item_name = response.json()['choices'][0]['message']['content'].strip()
        
        # Clean up the response to get just the item name
        item_name = re.sub(r'^(The|This|That|It\'s|It is|Looks like)\s+', '', item_name, flags=re.IGNORECASE)
        item_name = re.sub(r'[.,;!?]*$', '', item_name).strip()
        
        return item_name if item_name else "Unknown item"
    
    except Exception as e:
        print(f"Error analyzing item: {str(e)}")
        return "Unknown item"

def shopping_init(ocr_text: str, query: str) -> str:
    try:
        print(f"🔍 OCR Text received: {ocr_text}")
        item_name = identify_item(ocr_text)
        print(f"🧠 Identified Item: {item_name}")
        
        if item_name.lower() == "unknown item":
            return "Could not identify a valid item from the image."
        
        result = search_daraz(item_name)
        print(f"🛒 Daraz Result: {result}")
        
        # Format the response properly
        if result["status"] == "success":
            response = f"The item that you are searching for is '{result['title']}'. This item was found on {result['source']}\n"
            response += f"It is currently priced at {result['price']}\n"
            response += f"\n Follow the given Daraz link to view the item: {result['product_link']}"
            return response
        else:
            return f"❌ Shopping search failed: {result.get('message', 'Unknown error')}"
            
    except Exception as e:
        print(f"❌ Error in shopping_init: {str(e)}")
        return f"Internal error occurred during shopping: {str(e)}"


