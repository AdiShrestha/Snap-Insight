from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import urllib.parse
import logging

# Optional: Enable logging for debugging
logging.basicConfig(level=logging.INFO)

def search_daraz(query):
    encoded_query = urllib.parse.quote(query)
    search_url = f"https://www.daraz.com.np/catalog/?q={encoded_query}"

    options = Options()
    options.add_argument("--headless=new")  # Use new headless mode (more stable)
    options.add_argument("--no-sandbox")  # Required in most API/server environments
    options.add_argument("--disable-dev-shm-usage")  # Avoid shared memory crash
    options.add_argument("--disable-gpu")  # Headless mode compatibility
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-blink-features=AutomationControlled")  # Avoid bot detection
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    options.page_load_strategy = 'eager'

    driver = None
    try:
        # Setup ChromeDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        driver.set_page_load_timeout(30)

        logging.info(f"Navigating to {search_url}")
        driver.get(search_url)

        # Wait for products to load with multiple possible selectors
        product_selectors = [
            "Bm3ON",  # Original selector
            "gridItem",  # Alternative selector
            "[data-qa-locator='product-item']",  # Another possible selector
            ".c16H9d",  # Fallback selector
        ]
        
        first_card = None
        for selector in product_selectors:
            try:
                if selector.startswith("["):
                    first_card = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                else:
                    first_card = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CLASS_NAME, selector))
                    )
                break
            except:
                continue
        
        if not first_card:
            raise Exception("No products found on the page")

        # Try to get product link
        product_link = None
        try:
            link_tag = first_card.find_element(By.TAG_NAME, "a")
            product_link = link_tag.get_attribute("href")
        except:
            # Try alternative approach
            try:
                product_link = first_card.get_attribute("href")
            except:
                product_link = search_url

        # Ensure proper URL format
        if product_link:
            if product_link.startswith("//"):
                product_link = "https:" + product_link
            elif not product_link.startswith("http"):
                product_link = "https://www.daraz.com.np" + product_link
        else:
            product_link = search_url

        # Try to get price with multiple selectors
        price_selectors = ["ooOxS", "c13VH6", "_1cEkb", "price"]
        price = "Price not available"
        
        for price_selector in price_selectors:
            try:
                price_element = first_card.find_element(By.CLASS_NAME, price_selector)
                price = price_element.text.strip()
                if price:
                    break
            except:
                continue

        # Try to get product title
        title_selectors = ["RfADt", "c16H9d", "product-title", "title"]
        title = "Product title not available"
        
        for title_selector in title_selectors:
            try:
                title_element = first_card.find_element(By.CLASS_NAME, title_selector)
                title = title_element.text.strip()
                if title:
                    break
            except:
                continue

        return {
            "status": "success",
            "query": query,
            "product_link": product_link,
            "price": price,
            "title": title,
            "source": "Daraz.com.np"
        }

    except Exception as e:
        logging.error(f"Error during Daraz scraping for query '{query}': {str(e)}", exc_info=True)
        return {
            "status": "error",
            "query": query,
            "message": f"Failed to search Daraz: {str(e)}",
            "source": "Daraz.com.np"
        }

    finally:
        if driver:
            try:
                driver.quit()
            except Exception as e:
                logging.error(f"Error closing driver: {str(e)}")

if __name__ == "__main__":
    search_query = input("🔍 Enter what you want to search on Daraz.com.np: ")
    result = search_daraz(search_query)
    if result["status"] == "success":
        print(f"✅ First result for '{search_query}':\n🔗 {result['product_link']}\n💰 Price: {result['price']}")
    else:
        print(f"⚠️ Error: {result['message']}")
