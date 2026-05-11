import type { BrowseSortOption, BrowseSortOptionItem } from "@/types/browse";
import type { Game } from "@/types/game";

export const BROWSE_SORT_OPTIONS: BrowseSortOptionItem[] = [
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

const matchesSelectedValue = (values: string[] | null, selectedValue: string) => {
	if (!selectedValue) return true;
	return values?.some((value) => value === selectedValue) ?? false;
};

export const filterAndSortGames = (
	games: Game[],
	searchQuery: string,
	sortBy: BrowseSortOption,
	genre = "",
	platform = "",
): Game[] => {
	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredGames = games.filter((game) => {
		const matchesSearch = normalizedQuery
			? game.title.toLowerCase().includes(normalizedQuery)
			: true;
		const matchesGenre = matchesSelectedValue(game.genres, genre);
		const matchesPlatform = matchesSelectedValue(game.platforms, platform);

		return matchesSearch && matchesGenre && matchesPlatform;
	});

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

export const getFilterOptions = (games: Game[], field: "genres" | "platforms") =>
	Array.from(
		new Set(games.flatMap((game) => game[field]?.filter((value) => value.trim()) ?? [])),
	)
		.sort((a, b) => a.localeCompare(b))
		.map((value) => ({ value, label: value }));
