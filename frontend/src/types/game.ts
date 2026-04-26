export type Game = {
	id: number;
	igdb_id: number;
	title: string;
	summary: string | null;
	developer: string | null;
	cover_url: string | null;
	screenshots: string[] | null;
	platforms: string[] | null;
	release_date: string | null;
	igdb_rating: number | null;
	created_at: string | null;
};
