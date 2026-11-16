import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv


def main():
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    key = os.getenv("GOOGLE_SEARCH_API_KEY", "").strip()
    engine_id = os.getenv("GOOGLE_SEARCH_CLIENT_ID", "").strip()

    if not key or not engine_id:
        raise SystemExit(
            "Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CLIENT_ID in server/.env"
        )

    try:
        response = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "key": key,
                "cx": engine_id,
                "q": "נפוליאון בטעם שום שמיר תנובה",
                "searchType": "image",
                "num": 5,
                "gl": "il",
                "hl": "he",
            },
            timeout=30,
            allow_redirects=False,
        )
    except requests.RequestException:
        raise SystemExit("Could not connect to Google Custom Search.") from None

    try:
        data = response.json()
    except ValueError:
        raise SystemExit(f"HTTP {response.status_code}: Expected JSON from Google.") from None

    if response.status_code != 200:
        message = data.get("error", {}).get("message", "Search request failed")
        raise SystemExit(f"HTTP {response.status_code}: {str(message).replace(key, '[redacted]')}")

    images = [
        {
            "title": item.get("title"),
            "imageUrl": item["link"],
            "sourcePage": item.get("image", {}).get("contextLink"),
        }
        for item in data.get("items", [])
        if item.get("link")
    ]

    print(json.dumps(images, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
