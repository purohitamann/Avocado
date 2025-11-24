import httpx
import os

WEATHER_API_KEY = os.getenv("WEATHERAPI_KEY")

async def get_weather(city: str):
    """
    Fetch current weather using WeatherAPI.com
    """
    url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city}&aqi=no"

    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        data = r.json()

    if "current" not in data:
        return {"error": data.get("error", {}).get("message", "Weather not found")}

    current = data["current"]
    location = data["location"]

    return {
        "city": location["name"],
        "region": location["region"],
        "country": location["country"],
        "temperature_c": current["temp_c"],
        "temperature_f": current["temp_f"],
        "feels_like_c": current["feelslike_c"],
        "condition": current["condition"]["text"],
        "icon": current["condition"]["icon"],
        "humidity": current["humidity"],
        "wind_kph": current["wind_kph"]
    }
