import re
import requests
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import urllib.parse
import time
from datetime import datetime

load_dotenv()

def identify_news_topic(ocr_text: str) -> str:
    """
    Analyzes OCR text to identify the main news topic or keywords.
    Returns the main topic that can be used for news search.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""Analyze this OCR text from a news article or webpage and extract the main news topic or key terms for searching.
    Return ONLY the main topic/keywords that would be useful for finding this specific news story.
    
    Examples:
    - "Trump announces new tariffs on China" → "Trump tariffs China"
    - "Apple releases new iPhone 15" → "Apple iPhone 15 release"
    - "Ukraine war latest updates" → "Ukraine war updates"
    
    OCR Text: {ocr_text}
    
    Main topic/keywords:"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.3,
        "max_tokens": 50
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        topic = response.json()['choices'][0]['message']['content'].strip()
        
        # Clean up the response
        topic = re.sub(r'^(The|This|That|About|Regarding)\s+', '', topic, flags=re.IGNORECASE)
        topic = re.sub(r'[.,;!?]*$', '', topic).strip()
        
        return topic if topic else "Unknown news topic"
    
    except Exception as e:
        print(f"Error identifying news topic: {str(e)}")
        return "Unknown news topic"

def identify_news_from_caption(caption: str) -> str:
    """
    Analyzes image caption to identify news topic.
    Optimized for image-generated captions rather than OCR text.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    prompt = f"""This is a caption generated from a news-related image. Identify the main news topic or story.
    Return keywords that would be useful for finding this news story.

    Image Caption: {caption}

    Examples:
    - "a man in a suit speaking at podium" → "political speech announcement"
    - "protest crowd with signs" → "protest demonstration"
    - "breaking news banner on tv" → "breaking news"
    
    News topic/keywords:"""

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
        
        topic = response.json()['choices'][0]['message']['content'].strip()
        
        # Clean up the response
        topic = re.sub(r'^(The|This|That|About|Regarding)\s+', '', topic, flags=re.IGNORECASE)
        topic = re.sub(r'[.,;!?]*$', '', topic).strip()
        
        return topic if topic else "Unknown news topic"
    
    except Exception as e:
        print(f"Error identifying news from caption: {str(e)}")
        return "Unknown news topic"

def search_google_news(topic: str):
    """
    Search Google News for articles related to the topic.
    Returns list of news articles with titles, links, and snippets.
    """
    try:
        encoded_query = urllib.parse.quote_plus(topic)
        search_url = f"https://news.google.com/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        response = requests.get(search_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        articles = []
        # Look for news articles in Google News
        article_elements = soup.find_all('article')
        
        for article in article_elements[:5]:  # Get top 5 results
            try:
                # Extract title
                title_elem = article.find('h3') or article.find('h4')
                title = title_elem.get_text(strip=True) if title_elem else "No title"
                
                # Extract link
                link_elem = article.find('a')
                if link_elem and link_elem.get('href'):
                    link = link_elem['href']
                    if link.startswith('./'):
                        link = f"https://news.google.com{link[1:]}"
                    elif not link.startswith('http'):
                        link = f"https://news.google.com{link}"
                else:
                    link = "No link"
                
                # Extract snippet/description
                snippet_elem = article.find('p') or article.find('span')
                snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""
                
                if title != "No title" and len(title) > 10:
                    articles.append({
                        'title': title,
                        'link': link,
                        'snippet': snippet[:200] + "..." if len(snippet) > 200 else snippet,
                        'source': 'Google News'
                    })
            except Exception:
                continue
        
        return articles
    
    except Exception as e:
        print(f"Error searching Google News: {str(e)}")
        return []

def search_alternative_news(topic: str):
    """
    Alternative news search using DuckDuckGo news.
    """
    try:
        encoded_query = urllib.parse.quote_plus(f"{topic} news")
        search_url = f"https://duckduckgo.com/?q={encoded_query}&iar=news&df=d"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        response = requests.get(search_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        articles = []
        # Look for news results
        result_elements = soup.find_all('div', class_=lambda x: x and 'result' in x.lower())
        
        for result in result_elements[:3]:  # Get top 3 results
            try:
                title_elem = result.find('h2') or result.find('a')
                title = title_elem.get_text(strip=True) if title_elem else "No title"
                
                link_elem = result.find('a')
                link = link_elem.get('href', 'No link') if link_elem else "No link"
                
                snippet_elem = result.find('p') or result.find('span')
                snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""
                
                if title != "No title" and len(title) > 10:
                    articles.append({
                        'title': title,
                        'link': link,
                        'snippet': snippet[:150] + "..." if len(snippet) > 150 else snippet,
                        'source': 'DuckDuckGo News'
                    })
            except Exception:
                continue
        
        return articles
    
    except Exception as e:
        print(f"Error searching alternative news: {str(e)}")
        return []

def summarize_news_content(articles: list, query: str, topic: str) -> str:
    """
    Use AI to summarize news articles and answer user query.
    """
    if not articles:
        return "No relevant news articles found for this topic."
    
    api_key = os.getenv("GROQ_API_KEY")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    # Prepare articles data for the prompt
    articles_text = ""
    for i, article in enumerate(articles[:3], 1):  # Use top 3 articles
        articles_text += f"\nArticle {i}:\nTitle: {article['title']}\nSnippet: {article['snippet']}\nSource: {article['source']}\n"

    prompt = f"""Based on these recent news articles about "{topic}", please answer the user's question: "{query}"

    News Articles:
    {articles_text}

    Please provide a comprehensive answer based on the available information. If the articles don't contain enough information to fully answer the question, mention what information is available and suggest what might need further research.

    Answer:"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.3,
        "max_tokens": 500
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        
        summary = response.json()['choices'][0]['message']['content'].strip()
        
        # Add source information
        sources_info = "\n\n📰 Sources:\n"
        for i, article in enumerate(articles[:3], 1):
            sources_info += f"{i}. {article['title']} ({article['source']})\n"
        
        return summary + sources_info
    
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        # Fallback: return basic article information
        response = f"Found {len(articles)} recent articles about '{topic}':\n\n"
        for i, article in enumerate(articles[:3], 1):
            response += f"{i}. **{article['title']}**\n"
            response += f"   {article['snippet']}\n"
            response += f"   Source: {article['source']}\n\n"
        return response

def news_init(ocr_text: str, query: str, is_caption: bool = False) -> str:
    """
    Initialize news search and analysis based on OCR text and user query.
    
    Args:
        ocr_text (str): Text extracted from image or generated caption
        query (str): User's news-related query
        is_caption (bool): Whether ocr_text is from image captioning
        
    Returns:
        str: News summary and answer to user query
    """
    try:
        # Extract news topic from OCR text or caption
        if is_caption:
            print(f"🖼️ Processing image caption for news identification...")
            topic = identify_news_from_caption(ocr_text)
        else:
            topic = identify_news_topic(ocr_text)
        
        print(f"📰 Identified news topic: {topic}")
        
        if topic.lower() == "unknown news topic":
            return "Could not identify a valid news topic from the image."
        
        # Search for news articles
        print(f"🔍 Searching for news articles about '{topic}'...")
        articles = search_google_news(topic)
        
        # Try alternative search if Google News fails
        if not articles:
            print("🔄 Trying alternative news search...")
            articles = search_alternative_news(topic)
        
        if not articles:
            return f"No recent news articles found for '{topic}'. Please try with more specific terms."
        
        print(f"📰 Found {len(articles)} relevant articles")
        
        # Generate summary and answer user query
        result = summarize_news_content(articles, query, topic)
        
        return result
        
    except Exception as e:
        print(f"❌ Error in news_init: {str(e)}")
        return f"Internal error occurred during news search: {str(e)}"

# Testing
if __name__ == "__main__":
    # Test with sample OCR text
    ocr_text = "Trump announces new tariffs on China imports. The president said the new trade measures will take effect next month and will impact technology and manufacturing sectors."
    query = "What are the details of these new tariffs?"
    
    print("=== NEWS MODULE TEST ===")
    print(f"OCR Text: {ocr_text}")
    print(f"Query: {query}")
    print("\nResult:")
    print(news_init(ocr_text, query))