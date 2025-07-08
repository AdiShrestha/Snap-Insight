import requests
import os
from dotenv import load_dotenv

load_dotenv()

def generate_travel_plan(destination: str, origin: str = "Dhulikhel, Kavre") -> dict:
    """
    Generate a comprehensive travel plan from origin to destination using Groq API.
    
    Args:
        destination (str): The destination place
        origin (str): Starting location (default: Dhulikhel, Kavre)
        
    Returns:
        dict: Travel plan information
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        return {
            "status": "error",
            "message": "GROQ_API_KEY not found in environment variables"
        }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""Create a detailed travel plan from {origin} to {destination}. Include:

1. TRANSPORTATION:
   - Best travel options (bus, flight, car, etc.)
   - Estimated travel time and cost
   - Route information

2. ACCOMMODATION:
   - Recommended places to stay
   - Budget ranges

3. ATTRACTIONS:
   - Top 5 must-visit places
   - Activities to do

4. FOOD & DINING:
   - Local specialties to try
   - Recommended restaurants

5. TRAVEL TIPS:
   - Best time to visit
   - Important things to know
   - Budget estimates

Keep it practical and Nepal-focused. Format clearly with sections."""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.7,
        "max_tokens": 2000
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        travel_plan = response.json()['choices'][0]['message']['content'].strip()
        
        return {
            "status": "success",
            "origin": origin,
            "destination": destination,
            "plan": travel_plan
        }
    
    except Exception as e:
        print(f"Error generating travel plan: {str(e)}")
        return {
            "status": "error",
            "origin": origin,
            "destination": destination,
            "message": f"Failed to generate travel plan: {str(e)}"
        }

def display_travel_plan(result: dict) -> str:
    """Format and display the travel plan"""
    if result["status"] == "error":
        return f"❌ Error generating travel plan: {result.get('message', 'Unknown error')}"
    
    output = []
    output.append(f"✈️ TRAVEL PLAN: {result['origin']} → {result['destination']}")
    output.append("="*60)
    output.append(result['plan'])
    output.append("="*60)
    
    return '\n'.join(output)

# Example usage and testing
if __name__ == "__main__":
    test_destination = "Pokhara"
    result = generate_travel_plan(test_destination)
    print(display_travel_plan(result))
