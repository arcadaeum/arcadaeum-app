import os
import requests
from fastapi import HTTPException


class IGDBService:
    def __init__(self):
        self.client_id = os.getenv("IGDB_CLIENT_ID")
        self.client_secret = os.getenv("IGDB_KEY")

        if not self.client_id or not self.client_secret:
            raise HTTPException(
                status_code=500,
                detail=f"Missing env vars: IGDB_CLIENT_ID={self.client_id}, IGDB_KEY={self.client_secret}",
            )

        self.auth_url = "https://id.twitch.tv/oauth2/token"
        self.base_url = "https://api.igdb.com/v4"
        self.access_token = None

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

    def fetch_top_games(self, limit: int = 500):
        """Hits IGDB for the top games"""
        if not self.access_token:
            self.access_token = self.get_access_token()

        headers = {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {self.access_token}",
        }

        query = f"""
        fields name, summary, cover.url, first_release_date, total_rating;
        sort total_rating_count desc;
        where total_rating_count > 0;
        limit {limit};
        """

        response = requests.post(f"{self.base_url}/games", headers=headers, data=query)

        print(f"IGDB Response Status: {response.status_code}")
        print(f"IGDB Response Body: {response.text}")

        print(f"IGDB Response: {response.status_code} - {response.text}")

        if response.status_code == 200:
            return response.json()
        raise HTTPException(
            status_code=response.status_code, detail=f"IGDB Fetch Failed: {response.text}"
        )
