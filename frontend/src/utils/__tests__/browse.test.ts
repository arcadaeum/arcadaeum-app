import { describe, expect, it } from "vitest";
import type { Game } from "@/types/game";
import { filterAndSortGames, getFilterOptions } from "@/utils/browse";

const makeGame = (overrides: Partial<Game>): Game => ({
	id: 1,
	igdb_id: 1,
	title: "Test Game",
	summary: null,
	developer: null,
	cover_url: null,
	artworks: null,
	screenshots: null,
	platforms: null,
	genres: null,
	release_date: null,
	igdb_rating: null,
	created_at: null,
	...overrides,
});

describe("browse utilities", () => {
	it("filters games by genre and platform", () => {
		const games = [
			makeGame({
				id: 1,
				title: "Space Quest",
				genres: ["Adventure"],
				platforms: ["PC"],
			}),
			makeGame({
				id: 2,
				title: "Space Rally",
				genres: ["Racing"],
				platforms: ["PC", "PlayStation 5"],
			}),
			makeGame({
				id: 3,
				title: "Puzzle Box",
				genres: ["Puzzle"],
				platforms: ["Nintendo Switch"],
			}),
		];

		const result = filterAndSortGames(games, "space", "title-asc", "Racing", "PC");

		expect(result.map((game) => game.title)).toEqual(["Space Rally"]);
	});

	it("builds sorted unique filter options", () => {
		const games = [
			makeGame({ id: 1, genres: ["RPG", "Adventure"] }),
			makeGame({ id: 2, genres: ["RPG", ""] }),
			makeGame({ id: 3, genres: null }),
		];

		expect(getFilterOptions(games, "genres")).toEqual([
			{ value: "Adventure", label: "Adventure" },
			{ value: "RPG", label: "RPG" },
		]);
	});
});
