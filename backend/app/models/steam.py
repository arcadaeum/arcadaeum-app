from pydantic import BaseModel


class SteamLinkRequest(BaseModel):
    """Request to link a Steam account."""

    steam_id: str


class SteamGameData(BaseModel):
    """Data for a Steam game in user's library."""

    steam_app_id: int
    steam_name: str
    playtime_forever: int
    playtime_2weeks: int
    game_id: int | None = None


class SteamSyncStatus(BaseModel):
    """Status of Steam library sync."""

    is_linked: bool
    steam_username: str | None = None
    last_sync: str | None = None
    next_sync: str | None = None
    sync_status: str = "idle"  # idle, syncing, error


class SteamSyncResult(BaseModel):
    """Result of a Steam library sync."""

    matched_games: int
    added_to_library: int
    unmatched_games_found: int
    errors: list[str] = []


class SteamGameMatch(BaseModel):
    """A Steam game matched with an IGDB game."""

    steam_app_id: int
    steam_name: str
    playtime_forever: int
    playtime_2weeks: int
    igdb_id: int
    igdb_name: str


class SteamGameUnmatched(BaseModel):
    """A Steam game that couldn't be matched with IGDB."""

    # !! We need to handle this error gracefully
    steam_app_id: int
    steam_name: str
    playtime_forever: int
    playtime_2weeks: int
