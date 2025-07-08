import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import json
import os
from datetime import datetime
import logging
import urllib.parse

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HamroBazaarMonitor:
    def __init__(self, search_term=None, price_from=None, price_to=None, sort_by="recent", debug_mode=False):
        """Initialize the monitor with configurations."""
        self.base_url = "https://hamrobazaar.com/search/product"
        self.search_term = search_term or 'iphone 15 pro'
        self.price_from = price_from
        self.price_to = price_to
        self.sort_by = sort_by.lower()  # recent, price_asc, price_desc
        self.debug_mode = debug_mode
        
        sanitized_term = self.search_term.replace(" ", "_").replace("/", "_")
        self.seen_ads_file = f'seen_ads_{sanitized_term}.json'
        self.seen_ads = self.load_seen_ads()
        
        self.chrome_options = Options()
        if not debug_mode:
            self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--window-size=1920,1080')
        self.chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

    def load_seen_ads(self):
        try:
            if os.path.exists(self.seen_ads_file):
                with open(self.seen_ads_file, 'r', encoding='utf-8') as f:
                    return set(json.load(f))
            return set()
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error loading seen ads: {e}")
            return set()

    def save_seen_ads(self):
        try:
            with open(self.seen_ads_file, 'w', encoding='utf-8') as f:
                json.dump(list(self.seen_ads), f, ensure_ascii=False, indent=4)
        except IOError as e:
            logger.error(f"Error saving seen ads: {e}")

    def setup_driver(self):
        try:
            driver = webdriver.Chrome(options=self.chrome_options)
            return driver
        except Exception as e:
            logger.error(f"Error setting up driver: {e}")
            raise

    def apply_filters(self, driver):
        """Applies all filters based on the recorded settings."""
        try:
            # Wait for page to fully load
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-test-id='virtuoso-item-list']"))
            )
            
            # 1. Apply Sort Filter
            sort_mapping = {
                "recent": "5",
                "price_asc": "3",
                "price_desc": "4"
            }
            
            if self.sort_by in sort_mapping:
                logger.info(f"Applying sort filter: {self.sort_by}")
                sort_select = Select(driver.find_element(By.CSS_SELECTOR, "select.form-control"))
                sort_select.select_by_value(sort_mapping[self.sort_by])
                time.sleep(2)  # Wait for results to reload

            # 2. Apply Price Filters
            if self.price_from is not None or self.price_to is not None:
                logger.info(f"Applying price range: {self.price_from or 'Min'} to {self.price_to or 'Max'}")
                
                # Minimum price
                if self.price_from is not None:
                    min_price = driver.find_element(By.CSS_SELECTOR, "input[placeholder='minimum']")
                    min_price.clear()
                    min_price.send_keys(str(self.price_from))
                
                # Maximum price
                if self.price_to is not None:
                    max_price = driver.find_element(By.CSS_SELECTOR, "input[placeholder='maximum']")
                    max_price.clear()
                    max_price.send_keys(str(self.price_to))
                
                # Click the GO button
                go_button = driver.find_element(By.CSS_SELECTOR, "button.btn.btn-primary[type='submit']")
                go_button.click()
                time.sleep(3)  # Wait for results to reload

            return True

        except Exception as e:
            logger.error(f"Error applying filters: {e}")
            if self.debug_mode:
                driver.save_screenshot('filter_error.png')
            return False

    def scroll_to_load_all_items(self, driver):
        """Scrolls down to load all ads."""
        logger.info("Scrolling to load all ads...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    def extract_ad_data(self, driver):
        """Extracts ad data from the page."""
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        ads = []
        ad_cards = soup.select('div[data-test-id="virtuoso-item-list"] > div')
        
        for card in ad_cards:
            try:
                link = card.find('a', href=True)
                if not link:
                    continue
                    
                ads.append({
                    'id': link['href'],
                    'title': link.find('div', class_='hb-card-title').get_text(strip=True),
                    'price': link.find('div', class_='hb-card-price').get_text(strip=True),
                    'location': link.find('div', class_='hb-card-location').get_text(strip=True),
                    'posted_time': link.find('span', class_='hb-card-posted-time').get_text(strip=True),
                    'url': 'https://hamrobazaar.com' + link['href']
                })
            except Exception:
                continue
                
        return ads

    def check_for_new_ads(self, ads):
        new_ads = [ad for ad in ads if ad['id'] not in self.seen_ads]
        
        if new_ads:
            print(f"\n🆕 Found {len(new_ads)} new ads:")
            for ad in new_ads:
                print(f"\n📌 {ad['title']}")
                print(f"💰 {ad['price']}")
                print(f"📍 {ad['location']}")
                print(f"⏰ {ad['posted_time']}")
                print(f"🔗 {ad['url']}")
                self.seen_ads.add(ad['id'])
            self.save_seen_ads()
        else:
            print("\nℹ️ No new ads found.")
            
        return new_ads

    def monitor_once(self):
        driver = None
        try:
            driver = self.setup_driver()
            search_url = f"{self.base_url}?q={urllib.parse.quote(self.search_term)}&Latitude=0&Longitude=0"
            driver.get(search_url)
            
            if not self.apply_filters(driver):
                return
                
            self.scroll_to_load_all_items(driver)
            ads = self.extract_ad_data(driver)
            self.check_for_new_ads(ads)
            
        except Exception as e:
            logger.error(f"Monitoring error: {e}")
        finally:
            if driver:
                driver.quit()

def main():
    print("🚀 HamroBazaar Automated Monitor")
    print("=" * 50)
    
    search_term = input("Search term [iphone 15 pro]: ").strip() or "iphone 15 pro"
    price_from = input("Minimum price [leave empty for none]: ").strip()
    price_to = input("Maximum price [leave empty for none]: ").strip()
    sort_by = input("Sort by (recent/price_asc/price_desc) [recent]: ").strip().lower() or "recent"
    debug_mode = input("Debug mode (show browser)? [y/N]: ").strip().lower() == 'y'
    
    monitor = HamroBazaarMonitor(
        search_term=search_term,
        price_from=int(price_from) if price_from.isdigit() else None,
        price_to=int(price_to) if price_to.isdigit() else None,
        sort_by=sort_by,
        debug_mode=debug_mode
    )
    
    choice = input("\nRun mode:\n1. Single check\n2. Continuous monitoring\nChoice [1]: ").strip() or "1"
    
    if choice == "2":
        interval = int(input("Check interval (minutes) [5]: ").strip() or "5")
        while True:
            monitor.monitor_once()
            print(f"⏳ Next check in {interval} minutes...")
            time.sleep(interval * 60)
    else:
        monitor.monitor_once()

if __name__ == "__main__":
    main()