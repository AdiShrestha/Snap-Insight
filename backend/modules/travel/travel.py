from modules.travel.travelocr import identify_place, identify_place_from_caption
from modules.travel.travelplanning import generate_travel_plan, display_travel_plan

def travel_init(ocr_text: str, query: str, is_caption: bool = False) -> str:
    """
    Initialize travel planning based on OCR text and user query.
    
    Args:
        ocr_text (str): Text extracted from image or generated caption
        query (str): User's travel-related query
        is_caption (bool): Whether ocr_text is from image captioning
        
    Returns:
        str: Formatted travel plan or error message
    """
    try:
        # Extract place name from OCR text or caption
        if is_caption:
            print(f"🖼️ Processing image caption for place identification...")
            destination = identify_place_from_caption(ocr_text)
        else:
            destination = identify_place(ocr_text)
        
        print(f"🗺️ Identified destination: {destination}")
        
        if destination.lower() == "unknown place":
            return "Could not identify a valid destination from the image."
        
        # Generate travel plan
        print(f"📋 Generating travel plan for {destination}...")
        travel_data = generate_travel_plan(destination)
        
        return display_travel_plan(travel_data)
        
    except Exception as e:
        print(f"❌ Error in travel_init: {str(e)}")
        return f"Internal error occurred during travel planning: {str(e)}"

# Testing
if __name__ == "__main__":
    ocr_text = "Welcome to Pokhara - The City of Lakes. Famous for its beautiful lakes and mountain views."
    query = "I want to visit this place, can you help me plan?"
    print(travel_init(ocr_text, query))
