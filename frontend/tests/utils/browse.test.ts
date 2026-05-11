import { describe, it, expect } from "vitest";
import { filterAndSortGames } from "@/utils/browse";
import type { Game } from "@/types/game";

const mockGames: Game[] = [
	{
		id: 1,
		title: "Zelda",
		igdb_rating: 95,
		release_date: "2023-01-01",
		cover_url: "",
		summary: "",
		artworks: [],
		screenshots: [],
		platforms: [],
		developer: "",
		publisher: "",
	},
	{
		id: 2,
		title: "Mario",
		igdb_rating: 90,
		release_date: "2022-05-15",
		cover_url: "",
		summary: "",
		artworks: [],
		screenshots: [],
		platforms: [],
		developer: "",
		publisher: "",
	},
	{
		id: 3,
		title: "Elden Ring",
		igdb_rating: 97,
		release_date: "2024-02-25",
		cover_url: "",
		summary: "",
		artworks: [],
		screenshots: [],
		platforms: [],
		developer: "",
		publisher: "",
	},
];

describe("browse utils", () => {
	it("filters games by title (case insensitive)", () => {
		const result = filterAndSortGames(mockGames, "zelda", "title-asc");
		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("Zelda");
	});

	it("returns all games when search query empty", () => {
		const result = filterAndSortGames(mockGames, "", "title-asc");
		expect(result).toHaveLength(3);
	});

	it("sorts by title ascending", () => {
		const result = filterAndSortGames(mockGames, "", "title-asc");
		expect(result.map((g) => g.title)).toEqual(["Elden Ring", "Mario", "Zelda"]);
	});

	it("sorts by title descending", () => {
		const result = filterAndSortGames(mockGames, "", "title-desc");
		expect(result.map((g) => g.title)).toEqual(["Zelda", "Mario", "Elden Ring"]);
	});

	it("sorts by rating ascending", () => {
		const result = filterAndSortGames(mockGames, "", "rating-asc");
		expect(result.map((g) => g.igdb_rating)).toEqual([90, 95, 97]);
	});

	it("sorts by rating descending", () => {
		const result = filterAndSortGames(mockGames, "", "rating-desc");
		expect(result.map((g) => g.igdb_rating)).toEqual([97, 95, 90]);
	});

	it("sorts by release date ascending", () => {
		const result = filterAndSortGames(mockGames, "", "release-asc");
		expect(result.map((g) => g.title)).toEqual(["Mario", "Zelda", "Elden Ring"]);
	});

	it("sorts by release date descending", () => {
		const result = filterAndSortGames(mockGames, "", "release-desc");
		expect(result.map((g) => g.title)).toEqual(["Elden Ring", "Zelda", "Mario"]);
	});
});
