from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Collection(BaseModel):
    id: int
    user_id: int
    name: str
    is_default: bool
    created_at: Optional[datetime] = None


class CollectionGame(BaseModel):
    id: int
    collection_id: int
    game_id: int
    added_at: Optional[datetime] = None


class CreateCollectionRequest(BaseModel):
    name: str


class RenameCollectionRequest(BaseModel):
    name: str


class AddGameToCollectionRequest(BaseModel):
    game_id: int
