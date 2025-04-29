import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="News Search API")

# Adding CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERPER_API_KEY = os.getenv("SERPER_API_KEY")
if not SERPER_API_KEY:
    raise ValueError("SERPER_API_KEY environment variable is not set")

SERPER_API_URL = "https://google.serper.dev/news"

class NewsArticle(BaseModel):
    title: str
    link: str
    snippet: str
    imageUrl: Optional[str] = None
    source: Optional[str] = None
    date: Optional[str] = None

@app.get("/search", response_model=List[NewsArticle])
async def search_news(name: str = Query(..., min_length=2, description="Person's name to search for")):
    if not name:
        raise HTTPException(
            status_code=400, detail="Name parameter is required")
    try:
        # Creating search query with person's name
        query = f"{name} news"

        # Preparing headers with API key
        headers = {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json"
        }

        # Preparing payload 
        payload = {
            "q": query,
            "num": 10  # For now, only requesting 10 articles
        }

        # Make request to Serper API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                SERPER_API_URL,
                headers=headers,
                json=payload
            )
            if response.status_code != 200:
                error_detail = f"Serper API error: {response.status_code}"
                try:
                    error_json = response.json()
                    if 'message' in error_json:
                        error_detail = f"Serper API error: {
                            error_json['message']}"
                except:
                    pass
                raise HTTPException(
                    status_code=response.status_code, detail=error_detail)

            # Processing response
            data = response.json()
            news_articles = []

            # Extract news articles from response
            if "news" in data:
                for item in data["news"]:
                    news_article = NewsArticle(
                        title=item.get("title", ""),
                        link=item.get("link", ""),
                        snippet=item.get("snippet", ""),
                        imageUrl=item.get("imageUrl", None),
                        source=item.get("source", None),
                        date=item.get("date", None)
                    )
                    news_articles.append(news_article)

            return news_articles

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504, detail="Request to Serper API timed out")
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502, detail=f"Error making request to Serper API: {str(e)}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
