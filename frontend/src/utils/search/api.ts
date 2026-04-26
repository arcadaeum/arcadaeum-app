import type { GameSearchResult, UserSearchResult } from "@/types/search";

export async function searchGames(query: string): Promise<GameSearchResult[]> {
	try {
		const [dbGames, igdbGames] = await Promise.all([
			// Search database
			fetch(`${import.meta.env.VITE_API_URL}/games`)
				.then((res) => res.json())
				.catch(() => []),
			// Search IGDB
			fetch(
				`${import.meta.env.VITE_API_URL}/games/search-igdb?q=${encodeURIComponent(
					query,
				)}`,
			)
				.then((res) => res.json())
				.catch(() => []),
		]);

		// Filter database results
		const dbResults: GameSearchResult[] = dbGames
			.filter((game: GameSearchResult) =>
				game.title.toLowerCase().includes(query.toLowerCase()),
			)
			.slice(0, 10);

		// Get all igdb_ids from database results to exclude duplicates
		const dbIgdbIds = new Set(dbGames.map((game: GameSearchResult) => game.igdb_id));

		// Format IGDB results and exclude games already in database
		const igdbResults: GameSearchResult[] = (igdbGames || [])
			.filter((game: any) => !dbIgdbIds.has(game.id)) // Exclude duplicates
			.map((game: any) => ({
				igdb_id: game.id,
				title: game.name,
				cover_url: game.cover_url || null,
				isFromIGDB: true,
			}))
			.slice(0, 5); // Limit IGDB results

		// Combine: database results first, then IGDB results
		return [...dbResults, ...igdbResults];
	} catch (error) {
		console.error("Error searching games:", error);
		return [];
	}
}

export async function searchUsers(
	query: string,
	currentUserId: number | null,
): Promise<UserSearchResult[]> {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/users/search?q=${encodeURIComponent(query)}`,
		);
		const users: UserSearchResult[] = await response.json();

		// Filter out current user
		return users.filter((user) => user.id !== currentUserId).slice(0, 10);
	} catch (error) {
		console.error("Error searching users:", error);
		return [];
	}
}

export async function addGameFromIGDB(igdbId: number): Promise<{ id: number }> {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/games/add-from-igdb`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ igdb_id: igdbId }),
	});

	if (!response.ok) {
		throw new Error("Failed to add game to database");
	}

	return response.json();
}