"""Pytest configuration and fixtures for backend tests."""

import os
import sys
from pathlib import Path

# Set required environment variables before importing app modules
os.environ.setdefault("SECRET_KEY", "test_secret_key_123_for_pytest")
os.environ.setdefault("STEAM_WEB_KEY", "test_steam_key_123_for_pytest")
os.environ.setdefault("DATABASE_URL", "postgresql://user:password@localhost/testdb")
os.environ.setdefault("IGDB_CLIENT_ID", "test_igdb_client")
os.environ.setdefault("IGDB_KEY", "test_igdb_key")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test_google_client_id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test_google_client_secret")

# Add backend directory to path so app module can be imported
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
