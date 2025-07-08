import pytesseract
from PIL import Image
from classifier import classify_user_input
import whisper
import io
import torch
import tempfile
import os
from transformers import BlipProcessor, BlipForConditionalGeneration

# Load models once at startup
whisper_model = whisper.load_model("base")

# Load BLIP model for image captioning (fallback when OCR fails)
print("Loading BLIP model for image captioning...")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

def extract_text_or_caption(image_path: str) -> tuple[str, bool]:
    """
    Extract text from image using OCR, fallback to image captioning if minimal text found.
    
    Returns:
        tuple: (extracted_text_or_caption, is_caption)
    """
    img = Image.open(image_path)
    
    # First try OCR
    ocr_text = pytesseract.image_to_string(img).strip()
    
    # Check if OCR found meaningful text (more than just whitespace/punctuation)
    meaningful_text = ''.join(c for c in ocr_text if c.isalnum())
    
    if len(meaningful_text) > 10:  # Threshold for meaningful OCR text
        print(f"[DEBUG] OCR extracted text: {ocr_text[:100]}...")
        return ocr_text, False
    else:
        print("[DEBUG] OCR found minimal text, using image captioning...")
        try:
            # Use BLIP for image captioning
            inputs = blip_processor(img, return_tensors="pt")
            out = blip_model.generate(**inputs, max_length=50)
            caption = blip_processor.decode(out[0], skip_special_tokens=True)
            print(f"[DEBUG] Generated caption: {caption}")
            return caption, True
        except Exception as e:
            print(f"[ERROR] Image captioning failed: {str(e)}")
            return ocr_text if ocr_text else "Unable to process image", False

# Load Whisper model once at startup
whisper_model = whisper.load_model("base")

def main():
    img = Image.open("Screenshot 2025-06-04 at 8.00.22 PM.png")
    text = pytesseract.image_to_string(img)

    query = input("Enter query along with screenshot: ")
    category = classify_user_input(query)

    if category.lower() == "cooking":
        from modules.cooking.cooking import cooking_init
        print(cooking_init(text, query))
    elif category.lower() == "travel":
        from modules.travel.travel import travel_init
        print(travel_init(text, query))
    elif category.lower() == "news":
        from modules.news.news import news_init
        print(news_init(text, query))
    else:
        print(f"Category '{category}' is not supported.")

def query_screenshot(query: str, screenshot_path: str) -> str:
    text, is_caption = extract_text_or_caption(screenshot_path)
    category = classify_user_input(query)
    
    # Add context about whether we're using caption or OCR
    context_info = " (analyzed from image)" if is_caption else " (from text)"
    
    if category.lower() == "cooking":
        from modules.cooking.cooking import cooking_init
        return cooking_init(text, query, is_caption)
    if category.lower() == "shopping":
        from modules.shopping.shopping import shopping_init
        return shopping_init(text, query)
    if category.lower() == "travel":
        from modules.travel.travel import travel_init
        return travel_init(text, query, is_caption)
    if category.lower() == "news":
        from modules.news.news import news_init
        return news_init(text, query, is_caption)
    return f"Category '{category}' is not supported."

def voice_screenshot(audio_bytes: bytes, screenshot_path: str) -> str:
    """
    Process audio and screenshot to generate response.
    """
    try:
        print(f"[DEBUG] Starting audio processing for {screenshot_path}")
        
        # Create temporary audio file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_audio:
            tmp_audio.write(audio_bytes)
            tmp_audio_path = tmp_audio.name
            print(f"[DEBUG] Created temp audio file at {tmp_audio_path}")

        try:
            # Load audio
            print("[DEBUG] Loading audio...")
            audio = whisper.load_audio(tmp_audio_path)
            audio = whisper.pad_or_trim(audio)
            
            # Make log-Mel spectrogram
            print("[DEBUG] Creating spectrogram...")
            mel = whisper.log_mel_spectrogram(audio).to(whisper_model.device)
            
            # Detect language
            print("[DEBUG] Detecting language...")
            _, probs = whisper_model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)
            print(f"[DEBUG] Detected language: {detected_lang}")
            
            # Decode audio
            print("[DEBUG] Decoding audio...")
            options = whisper.DecodingOptions(fp16=torch.cuda.is_available())
            result = whisper.decode(whisper_model, mel, options)
            query_text = result.text.strip()
            print(f"[DEBUG] Transcribed text: '{query_text}'")
            
            if not query_text:
                print("[WARNING] Empty transcription result")
                return "Could not detect speech in the audio"
                
            # Process screenshot
            print("[DEBUG] Processing screenshot...")
            return query_screenshot(query_text, screenshot_path)
            
        finally:
            if os.path.exists(tmp_audio_path):
                os.unlink(tmp_audio_path)
                print("[DEBUG] Removed temp audio file")
                
    except Exception as e:
        print(f"[ERROR] Audio processing failed: {str(e)}")
        return f"Audio processing error: {str(e)}"

def query_screenshot_explicit(query: str, screenshot_path: str, module: str) -> str:
    """
    Process query and screenshot with explicit module specification (bypasses classifier).
    
    Args:
        query: User's text query
        screenshot_path: Path to the screenshot image
        module: Explicit module name ('cooking', 'shopping', 'travel', 'news')
    """
    text, is_caption = extract_text_or_caption(screenshot_path)
    
    # Add context about whether we're using caption or OCR
    context_info = " (analyzed from image)" if is_caption else " (from text)"
    
    if module.lower() == "cooking":
        from modules.cooking.cooking import cooking_init
        return cooking_init(text, query, is_caption)
    elif module.lower() == "shopping":
        from modules.shopping.shopping import shopping_init
        return shopping_init(text, query)
    elif module.lower() == "travel":
        from modules.travel.travel import travel_init
        return travel_init(text, query, is_caption)
    elif module.lower() == "news":
        from modules.news.news import news_init
        return news_init(text, query, is_caption)
    else:
        return f"Module '{module}' is not supported. Available modules: cooking, shopping, travel, news"

def voice_screenshot_explicit(audio_bytes: bytes, screenshot_path: str, module: str) -> str:
    """
    Process audio and screenshot with explicit module specification (bypasses classifier).
    
    Args:
        audio_bytes: Audio data in bytes
        screenshot_path: Path to the screenshot image
        module: Explicit module name ('cooking', 'shopping', 'travel', 'news')
    """
    try:
        print(f"[DEBUG] Starting audio processing for {screenshot_path} with module: {module}")
        
        # Create temporary audio file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_audio:
            tmp_audio.write(audio_bytes)
            tmp_audio_path = tmp_audio.name
            print(f"[DEBUG] Created temp audio file at {tmp_audio_path}")

        try:
            # Load audio
            print("[DEBUG] Loading audio...")
            audio = whisper.load_audio(tmp_audio_path)
            audio = whisper.pad_or_trim(audio)
            
            # Make log-Mel spectrogram
            print("[DEBUG] Creating spectrogram...")
            mel = whisper.log_mel_spectrogram(audio).to(whisper_model.device)
            
            # Detect language
            print("[DEBUG] Detecting language...")
            _, probs = whisper_model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)
            print(f"[DEBUG] Detected language: {detected_lang}")
            
            # Decode audio
            print("[DEBUG] Decoding audio...")
            options = whisper.DecodingOptions(fp16=torch.cuda.is_available())
            result = whisper.decode(whisper_model, mel, options)
            query_text = result.text.strip()
            print(f"[DEBUG] Transcribed text: '{query_text}'")
            
            if not query_text:
                print("[WARNING] Empty transcription result")
                return "Could not detect speech in the audio"
                
            # Process screenshot with explicit module
            print(f"[DEBUG] Processing screenshot with {module} module...")
            return query_screenshot_explicit(query_text, screenshot_path, module)
            
        finally:
            if os.path.exists(tmp_audio_path):
                os.unlink(tmp_audio_path)
                print("[DEBUG] Removed temp audio file")
                
    except Exception as e:
        print(f"[ERROR] Audio processing failed: {str(e)}")
        return f"Audio processing error: {str(e)}"
if __name__ == "__main__":
    main()