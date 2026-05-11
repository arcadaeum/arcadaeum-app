export type GameReview = {
	id: number;
	user_id: number;
	game_id: number;
	rating: number;
	review_text: string | null;
	created_at: string | null;
	username: string;
	display_name: string | null;
};

export type ReviewCreatePayload = {
	rating: number;
	review_text: string | null;
};

export type UserGameReview = {
	id: number;
	user_id: number;
	game_id: number;
	rating: number;
	review_text: string | null;
	created_at: string | null;
	game_title: string;
	game_cover_url: string | null;
};

export type ReviewUpdatePayload = {
	rating: number;
	review_text: string | null;
};

export type ArcadaeumReview = {
	game_id: number;
	average_rating: number;
	total_reviews: number;
};
