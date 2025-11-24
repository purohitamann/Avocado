import httpx
import os

NEWS_API_KEY = os.getenv("NEWSDATA_API_KEY")
CURRENTS_API_KEY = os.getenv("CURRENTS_API_KEY")

async def get_city_news(city: str):
    """
    Fetch news related to crime, finance, transport, festivals and weather.
    """
    
    categories = "crime,finance,technology,world,environment"
    url = f"https://newsdata.io/api/1/news?apikey={NEWS_API_KEY}&q={city}&category={categories}"

    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        data = r.json()

        # Fallback using Currents API if NewsData returns nothing
        if "results" not in data or len(data["results"]) == 0:
            fallback_url = f"https://api.currentsapi.services/v1/search?keywords={city}&apiKey={CURRENTS_API_KEY}"
            r2 = await client.get(fallback_url)
            data2 = r2.json()
            return {
                "source": "CurrentsAPI",
                "articles": data2.get("news", [])
            }

        return {
            "source": "NewsData",
            "articles": data.get("results", [])
        }
