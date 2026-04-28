import type { BrowseSortOption } from "@/types/browse";
import type { Game } from "@/types/game";
import type { LibraryEntry } from "@/types/user";
import { filterAndSortGames } from "@/utils/browse";

type GameGridItem = Pick<Game, "id" | "title" | "cover_url">;

const mapLibraryEntryToGame = (entry: LibraryEntry): Game => ({
	id: entry.game_id,
	igdb_id: entry.igdb_id,
	title: entry.title,
	summary: entry.summary ?? null,
	developer: entry.developer ?? null,
	cover_url: entry.cover_url ?? null,
	screenshots: entry.screenshots ?? null,
	platforms: entry.platforms ?? null,
	release_date: entry.release_date ?? null,
	igdb_rating: entry.igdb_rating ?? null,
	created_at: entry.created_at ?? null,
});

export const filterAndSortLibraryEntries = (
	library: LibraryEntry[],
	searchQuery: string,
	sortBy: BrowseSortOption,
): LibraryEntry[] => {
	const libraryAsGames = library.map(mapLibraryEntryToGame);
	const filteredGames = filterAndSortGames(libraryAsGames, searchQuery, sortBy);

	const filteredGameIds = new Set(filteredGames.map((game) => game.id));
	const orderByGameId = new Map(filteredGames.map((game, index) => [game.id, index]));

	return library
		.filter((entry) => filteredGameIds.has(entry.game_id))
		.sort((a, b) => (orderByGameId.get(a.game_id) ?? 0) - (orderByGameId.get(b.game_id) ?? 0));
};

export const mapLibraryEntriesToGameGridItems = (entries: LibraryEntry[]): GameGridItem[] =>
	entries.map((entry) => ({
		id: entry.game_id,
		title: entry.title,
		cover_url: entry.cover_url ?? null,
	}));
