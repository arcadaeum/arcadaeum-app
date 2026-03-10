#!/usr/bin/env python3
"""
Seed Games from IGDB API

This script fetches popular games from the IGDB API and inserts them into the
PostgreSQL database. It handles authentication, rate limiting, pagination,
and data transformation.

Environment Variables Required:
    IGDB_CLIENT_ID: IGDB API Client ID
    IGDB_KEY: IGDB API Key (Client Secret)
    DATABASE_URL: PostgreSQL connection URL

Usage:
    python backend/app/seed_games.py [--limit N] [--offset N] [--resume]
"""

import os
import sys
import json
import time
import logging
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Add parent directory to path to import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from database import get_database_connection
except ImportError:
    print("Error: Could not import database module. Make sure you're running from the correct directory.")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('seed_games.log')
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class IGDBConfig:
    """IGDB API configuration."""
    client_id: str
    client_secret: str
    access_token: Optional[str] = None
    token_expiry: Optional[datetime] = None


class IGDBClient:
    """Client for interacting with the IGDB API."""
    
    BASE_URL = "https://api.igdb.com/v4"
    AUTH_URL = "https://id.twitch.tv/oauth2/token"
    RATE_LIMIT = 4  # requests per second
    MAX_RETRIES = 3
    
    def __init__(self, client_id: str, client_secret: str):
        self.config = IGDBConfig(client_id=client_id, client_secret=client_secret)
        self.session = self._create_session()
        self.last_request_time = 0
        
    def _create_session(self) -> requests.Session:
        """Create a requests session with retry logic."""
        session = requests.Session()
        retry_strategy = Retry(
            total=self.MAX_RETRIES,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        return session
    
    def __init__(self, config: IGDBConfig):
        self.config = config
        self.session = self._create_session()
        self.last_request_time = 0
    
    def _create_session(self):
        """Create a requests session with retry logic."""
        session = requests.Session()
        retry_strategy = Retry(
            total=self.MAX_RETRIES,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        return session
    
    def _rate_limit(self):
        """Enforce rate limit of 4 requests per second."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < 1.0 / self.RATE_LIMIT:
            sleep_time = (1.0 / self.RATE_LIMIT) - time_since_last
            logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_request_time = time.time()
    
    def _get_access_token(self) -> str:
        """Get or refresh access token for IGDB API."""
        current_time = datetime.now()
        
        # Check if we have a valid token
        if (self.config.access_token and self.config.token_expiry and 
            current_time < self.config.token_expiry):
            return self.config.access_token
        
        # Request new token
        logger.info("Requesting new access token from IGDB...")
        params = {
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
            "grant_type": "client_credentials"
        }
        
        response = self.session.post(self.AUTH_URL, params=params)
        response.raise_for_status()
        
        token_data = response.json()
        self.config.access_token = token_data["access_token"]
        # Set expiry to 1 hour (IGDB tokens typically expire in 2 months, but we'll refresh after 1 hour)
        self.config.token_expiry = datetime.fromtimestamp(
            current_time.timestamp() + token_data.get("expires_in", 3600) - 300
        )
        
        logger.info("Access token obtained successfully")
        return self.config.access_token
    
    def make_request(self, endpoint: str, query: str) -> List[Dict]:
        """Make a request to the IGDB API."""
        self._rate_limit()
        
        access_token = self._get_access_token()
        headers = {
            "Client-ID": self.config.client_id,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "text/plain"
        }
        
        url = f"{self.BASE_URL}/{endpoint}"
        
        try:
            response = self.session.post(url, headers=headers, data=query)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 401:
                logger.warning("Token expired, refreshing...")
                # Force token refresh
                self.config.access_token = None
                self.config.token_expiry = None
                return self.make_request(endpoint, query)
            raise
        except Exception as e:
            logger.error(f"Error making request to {endpoint}: {e}")
            raise
    
    def fetch_games(self, limit: int = 500, offset: int = 0) -> List[Dict]:
        """
        Fetch games from IGDB with pagination.
        
        IGDB has a limit of 500 games per request, so we paginate if needed.
        """
        games = []
        remaining = limit
        current_offset = offset
        
        while remaining > 0:
            # IGDB maximum per request is 500
            batch_size = min(remaining, 500)
            
            logger.info(f"Fetching {batch_size} games (offset: {current_offset}, remaining: {remaining})")
            
            # Build the IGDB query
            # Fields: id, name, summary, cover.image_id, platforms.name, first_release_date, rating
            # Sort by total_rating_count descending to get popular games
            query = f"""
                fields id, name, summary, cover.image_id, platforms.name, 
                       first_release_date, rating, total_rating_count;
                where total_rating_count > 0 & category = 0;
                sort total_rating_count desc;
                limit {batch_size};
                offset {current_offset};
            """
            
            try:
                batch = self.make_request("games", query)
                if not batch:
                    logger.warning(f"No more games found at offset {current_offset}")
                    break
                
                games.extend(batch)
                logger.info(f"Fetched {len(batch)} games")
                
                remaining -= len(batch)
                current_offset += len(batch)
                
                # If we got fewer games than requested, we've reached the end
                if len(batch) < batch_size:
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching games batch: {e}")
                # If there's an error, we'll stop and return what we have
                break
        
        return games


class GameTransformer:
    """Transform IGDB game data to match our database schema."""
    
    @staticmethod
    def transform(game: Dict) -> Dict[str, Any]:
        """Transform a single IGDB game object to database format."""
        # Extract cover URL
        cover_url = None
        if game.get("cover") and game["cover"].get("image_id"):
            cover_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{game['cover']['image_id']}.jpg"
        
        # Extract platform names
        platforms = []
        if game.get("platforms"):
            platforms = [p.get("name", "") for p in game["platforms"] if p.get("name")]
        
        # Convert Unix timestamp to date
        release_date = None
        if game.get("first_release_date"):
            try:
                # IGDB timestamps are in milliseconds
                release_date = datetime.fromtimestamp(game["first_release_date"] / 1000).date()
            except (ValueError, TypeError):
                pass
        
        return {
            "igdb_id": game["id"],
            "title": game.get("name", ""),
            "summary": game.get("summary"),
            "cover_url": cover_url,
            "platforms": platforms,
            "release_date": release_date,
            "igdb_rating": game.get("rating")
        }
    
    @staticmethod
    def transform_batch(games: List[Dict]) -> List[Dict[str, Any]]:
        """Transform a batch of IGDB games."""
        return [GameTransformer.transform(game) for game in games]


class DatabaseManager:
    """Manage database operations for games."""
    
    def __init__(self):
        self.conn = get_database_connection()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            self.conn.close()
    
    def game_exists(self, igdb_id: int) -> bool:
        """Check if a game already exists in the database."""
        with self.conn.cursor() as cur:
            cur.execute("SELECT 1 FROM games WHERE igdb_id = %s", (igdb_id,))
            return cur.fetchone() is not None
    
    def insert_game(self, game: Dict[str, Any]) -> bool:
        """Insert a single game into the database."""
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO games 
                    (igdb_id, title, summary, cover_url, platforms, release_date, igdb_rating)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (igdb_id) DO NOTHING
                    RETURNING id
                """, (
                    game["igdb_id"],
                    game["title"],
                    game["summary"],
                    game["cover_url"],
                    game["platforms"],
                    game["release_date"],
                    game["igdb_rating"]
                ))
            return cur.fetchone() is not None
    
    def insert_game(self, game: Dict[str, Any]) -> bool:
        """Insert a single game into the database. Returns True if inserted."""
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO games (igdb_id, title, summary, cover_url, platforms, release_date, igdb_rating)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (igdb_id) DO NOTHING
                    RETURNING id
                """, (
                    game["igdb_id"],
                    game["title"],
                    game["summary"],
                    game["cover_url"],
                    game["platforms"],
                    game["release_date"],
                    game["igdb_rating"]
                ))
                
                inserted = cur.fetchone() is not None
                if inserted:
                    self.conn.commit()
                return inserted
        except Exception as e:
            logger.error(f"Error inserting game {game['igdb_id']} ({game['title']}): {e}")
            self.conn.rollback()
            return False
    
    def insert_games_batch(self, games: List[Dict[str, Any]]) -> int:
        """Insert a batch of games. Returns number of games inserted."""
        if not games:
            return 0
        
        inserted_count = 0
        for game in games:
            if self.insert_game(game):
                inserted_count += 1
        
        return inserted_count
    
    def get_existing_igdb_ids(self) -> set:
        """Get set of existing IGDB IDs in the database."""
        with self.conn.cursor() as cur:
            cur.execute("SELECT igdb_id FROM games")
            return {row[0] for row in cur.fetchall()}


class GameSeeder:
    """Main class for seeding games from IGDB."""
    
    def __init__(self, igdb_client: IGDBClient, db_manager: DatabaseManager):
        self.igdb_client = igdb_client
        self.db_manager = db_manager
    
    def seed(self, limit: int = 500, offset: int = 0, resume: bool = False) -> dict:
        """
        Seed games from IGDB to database.
        
        Args:
            limit: Total number of games to fetch
            offset: Starting offset for IGDB query
            resume: If True, skip games that already exist in database
        
        Returns:
            Dictionary with seeding statistics
        """
        logger.info(f"Starting game seeding: limit={limit}, offset={offset}, resume={resume}")
        
        # Get existing IDs if resuming
        existing_ids = set()
        if resume:
            existing_ids = self.db_manager.get_existing_igdb_ids()
            logger.info(f"Found {len(existing_ids)} existing games in database")
        
        # Fetch games from IGDB
        logger.info(f"Fetching {limit} games from IGDB...")
        igdb_games = self.igdb_client.fetch_games(limit=limit, offset=offset)
        
        if not igdb_games:
            logger.warning("No games fetched from IGDB")
            return {"total_fetched": 0, "inserted": 0, "skipped": 0}
        
        logger.info(f"Fetched {len(igdb_games)} games from IGDB")
        
        # Transform games
        logger.info("Transforming game data...")
        transformed_games = GameTransformer.transform_batch(igdb_games)
        
        # Filter out existing games if resuming
        games_to_insert = []
        for game in transformed_games:
            if resume and game["igdb_id"] in existing_ids:
                continue
            games_to_insert.append(game)
        
        skipped = len(transformed_games) - len(games_to_insert)
        if skipped > 0:
            logger.info(f"Skipping {skipped} games that already exist in database")
        
        # Insert games
        logger.info(f"Inserting {len(games_to_insert)} games into database...")
        inserted = 0
        
        # Process in batches for progress reporting
        batch_size = 50
        for i in range(0, len(games_to_insert), batch_size):
            batch = games_to_insert[i:i + batch_size]
            batch_inserted = self.db_manager.insert_games_batch(batch)
            inserted += batch_inserted
            
            progress = min(i + len(batch), len(games_to_insert))
            logger.info(f"Progress: {progress}/{len(games_to_insert)} games processed "
                       f"({inserted} inserted, {skipped} skipped)")
        
        logger.info(f"Seeding complete: {inserted} games inserted, {skipped} skipped")
        
        return {
            "total_fetched": len(igdb_games),
            "inserted": inserted,
            "skipped": skipped
        }


def load_config() -> IGDBConfig:
    """Load IGDB configuration from environment variables."""
    client_id = os.getenv("IGDB_CLIENT_ID")
    client_secret = os.getenv("IGDB_KEY")  # Note: using IGDB_KEY as client secret
    
    if not client_id:
        raise ValueError("IGDB_CLIENT_ID environment variable is not set")
    if not client_secret:
        raise ValueError("IGDB_KEY environment variable is not set")
    
    return IGDBConfig(client_id=client_id, client_secret=client_secret)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Seed games from IGDB API to PostgreSQL database"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=500,
        help="Total number of games to fetch (default: 500)"
    )
    parser.add_argument(
        "--offset",
        type=int,
        default=0,
        help="Starting offset for IGDB query (default: 0)"
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Skip games that already exist in database"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Set log level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    try:
        # Load configuration
        config = load_config()
        logger.info("Configuration loaded successfully")
        
        # Initialize clients
        igdb_client = IGDBClient(config)
        db_manager = DatabaseManager()
        
        # Create seeder and run
        seeder = GameSeeder(igdb_client, db_manager)
        stats = seeder.seed(limit=args.limit, offset=args.offset, resume=args.resume)
        
        # Print summary
        print("\n" + "="*50)
        print("SEEDING SUMMARY")
        print("="*50)
        print(f"Total games fetched from IGDB: {stats['total_fetched']}")
        print(f"Games inserted into database: {stats['inserted']}")
        print(f"Games skipped (already existed): {stats['skipped']}")
        print("="*50)
        
        if stats['inserted'] == 0 and stats['total_fetched'] > 0:
            logger.warning("No games were inserted. All games may already exist in the database.")
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        print(f"\nError: {e}")
        print("\nPlease set the following environment variables:")
        print("  export IGDB_CLIENT_ID='your_client_id'")
        print("  export IGDB_KEY='your_client_secret'")
        print("  export DATABASE_URL='your_database_url'")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Seeding failed: {e}", exc_info=True)
        print(f"\nError: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
