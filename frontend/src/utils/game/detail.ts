import type { GameDetailReview } from "@/types/gameDetail";

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
