import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
from enum import Enum

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


class TimeFrame(str, Enum):
    all = "all"
    day = "day"
    week = "week"
    month = "month"
    year = "year"
    
    
@app.get("/search", response_model=List[NewsArticle])
async def search_news(
    name: str = Query(..., min_length=2, description="Person's name to search for"),
    timeframe: TimeFrame = Query(TimeFrame.all, description="Time frame for search results")
):
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

        # Map timeframe enum to Google's time-based search parameter (tbs)
        tbs_mapping = {
            TimeFrame.all: "",  # No time restriction
            TimeFrame.day: "qdr:d",  # Past 24 hours
            TimeFrame.week: "qdr:w",  # Past week
            TimeFrame.month: "qdr:m",  # Past month
            TimeFrame.year: "qdr:y",  # Past year
        }
        
        # Preparing payload 
        payload = {
            "q": query,
            "num": 10
        }
        
        # Add time-based search if not "all"
        if timeframe != TimeFrame.all:
            payload["tbs"] = tbs_mapping[timeframe]

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


class ImageArticle(BaseModel):
    title: str
    link: str
    imageUrl: Optional[str] = None
    source: Optional[str] = None


@app.get("/images", response_model=List[ImageArticle])
async def search_images(name: str = Query(..., min_length=3)):
    try:
        query = f"{name} image"

        headers = {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "q": query,
            "num": 10
        }

        SERPER_IMAGE_API_URL = "https://google.serper.dev/images"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                SERPER_IMAGE_API_URL,
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

            data = response.json()
            image_articles = []

            # Extract news articles from response
            if "images" in data:
                for item in data["images"]:
                    image_article = ImageArticle(
                        title=item.get("title", ""),
                        link=item.get("link", ""),
                        imageUrl=item.get("imageUrl", None),
                        source=item.get("source", None),
                    )
                    image_articles.append(image_article)

            return image_articles
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