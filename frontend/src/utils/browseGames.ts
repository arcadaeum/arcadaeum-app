import type { Game } from "../types/game";

export type BrowseSortOption =
	| "title-asc"
	| "title-desc"
	| "rating-desc"
	| "rating-asc"
	| "release-old-new"
	| "release-new-old";

export const BROWSE_SORT_OPTIONS: Array<{ value: BrowseSortOption; label: string }> = [
	{ value: "title-asc", label: "Title (A-Z)" },
	{ value: "title-desc", label: "Title (Z-A)" },
	{ value: "rating-desc", label: "Rating (High-Low)" },
	{ value: "rating-asc", label: "Rating (Low-High)" },
	{ value: "release-old-new", label: "Release Date (Old-New)" },
	{ value: "release-new-old", label: "Release Date (New-Old)" },
];

const compareNullableNumbers = (a: number | null, b: number | null, direction: "asc" | "desc") => {
	if (a === null && b === null) return 0;
	if (a === null) return 1;
	if (b === null) return -1;

	if (direction === "asc") return a - b;
	return b - a;
};

const getReleaseTimestamp = (releaseDate: string | null) => {
	if (!releaseDate) return null;
	const timestamp = Date.parse(releaseDate);
	return Number.isNaN(timestamp) ? null : timestamp;
};

export const filterAndSortGames = (
	games: Game[],
	searchQuery: string,
	sortBy: BrowseSortOption,
): Game[] => {
	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredGames = normalizedQuery
		? games.filter((game) => game.title.toLowerCase().includes(normalizedQuery))
		: games;

	return [...filteredGames].sort((a, b) => {
		switch (sortBy) {
			case "title-desc":
				return b.title.localeCompare(a.title);
			case "rating-desc":
				return compareNullableNumbers(a.igdb_rating, b.igdb_rating, "desc");
			case "rating-asc":
				return compareNullableNumbers(a.igdb_rating, b.igdb_rating, "asc");
			case "release-old-new":
				return compareNullableNumbers(
					getReleaseTimestamp(a.release_date),
					getReleaseTimestamp(b.release_date),
					"asc",
				);
			case "release-new-old":
				return compareNullableNumbers(
					getReleaseTimestamp(a.release_date),
					getReleaseTimestamp(b.release_date),
					"desc",
				);
			case "title-asc":
			default:
				return a.title.localeCompare(b.title);
		}
	});
};
