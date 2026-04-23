import os
import requests
from fastapi import HTTPException


class IGDBService:
    def __init__(self):
        self.client_id = os.getenv("IGDB_CLIENT_ID")
        self.client_secret = os.getenv("IGDB_KEY")
        self.auth_url = "https://id.twitch.tv/oauth2/token"
        self.base_url = "https://api.igdb.com/v4"
        self.access_token = None

    # Get a auth token from Twitch for IGDB API access
    def get_access_token(self):
        params = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials",
        }
        response = requests.post(self.auth_url, params=params)
        if response.status_code != 200:
            print(f"Auth error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=401, detail=f"IGDB Auth Failed: {response.text}")
        return response.json().get("access_token")

    # Fetch top n amount of games from IGDB, sorted by total rating count
    def fetch_top_games(self, limit: int = 500):
        """Hits IGDB for the top games"""
        if not self.access_token:
            self.access_token = self.get_access_token()

        headers = {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {self.access_token}",
        }

        query = f"""
        fields id, name, summary, involved_companies.company.name, involved_companies.developer, cover.image_id, platforms.name, genres.name, first_release_date, total_rating;
        sort total_rating_count desc;
        where total_rating_count > 0;
        limit {limit};
        """

        response = requests.post(f"{self.base_url}/games", headers=headers, data=query)

        print(f"IGDB Response: {response.status_code} - {response.text}")

        if response.status_code == 200:
            return response.json()
        raise HTTPException(
            status_code=response.status_code, detail=f"IGDB Fetch Failed: {response.text}"
        )
