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
