from pydantic import BaseModel

class Review(BaseModel):
	id: int
	user_id: int
	game_id: int
	rating: int
	review_text: str
	created_at: str