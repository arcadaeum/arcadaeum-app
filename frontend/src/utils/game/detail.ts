import type { Game } from "@/types/game";
import type { GameDetailReview } from "@/types/gameDetail";

export const createFallbackGame = (id: string): Game => {
	const numericId = Number(id);

	return {
		id: numericId,
		igdb_id: numericId,
		title: `Game ${id}`,
		cover_url: `https://via.placeholder.com/800x450?text=Game+${encodeURIComponent(id)}`,
		summary:
			"This is a placeholder game page. When the game API is available, real metadata and images will be shown here.",
		igdb_rating: null,
		developer: null,
		platforms: null,
		release_date: null,
		created_at: null,
	};
};

export const getReleaseYear = (releaseDate: string | null) => releaseDate?.slice(0, 4) ?? "-";

export const formatIgdbRating = (rating: number | null) => (rating ? rating.toFixed(1) : "—");

export const formatPlatforms = (platforms: string[] | null) => platforms?.join(", ") ?? "—";

export const PLACEHOLDER_REVIEWS: GameDetailReview[] = [
	{
		author: "User123",
		date: "2024-01-01",
		content: "Great game — loved the soundtrack and levels.",
	},
	{
		author: "PlayerTwo",
		date: "2024-02-14",
		content: "Challenging but rewarding. Would recommend.",
	},
];
