import { describe, it, expect } from "vitest";

// Mock search filtering
function filterGames(games: { title: string }[], query: string) {
	if (!query) return games;
	return games.filter((game) => game.title.toLowerCase().includes(query.toLowerCase()));
}

describe("Search Utilities", () => {
	const mockGames = [
		{ title: "The Witcher 3" },
		{ title: "Cyberpunk 2077" },
		{ title: "Elden Ring" },
		{ title: "Dark Souls 3" },
	];

	it("returns all games when query is empty", () => {
		expect(filterGames(mockGames, "")).toHaveLength(4);
	});

	it("filters games by exact title match", () => {
		const result = filterGames(mockGames, "Elden Ring");
		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("Elden Ring");
	});

	it("filters games case-insensitively", () => {
		const result = filterGames(mockGames, "witcher");
		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("The Witcher 3");
	});

	it("filters games by partial match", () => {
		const result = filterGames(mockGames, "Dark");
		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("Dark Souls 3");
	});

	it("returns empty array when no matches", () => {
		const result = filterGames(mockGames, "Minecraft");
		expect(result).toHaveLength(0);
	});

	it("filters multiple games by common keyword", () => {
		const result = filterGames(mockGames, "3");
		expect(result).toHaveLength(2);
		expect(result.map((g) => g.title)).toContain("The Witcher 3");
		expect(result.map((g) => g.title)).toContain("Dark Souls 3");
	});
});

// Mock user search
function filterUsers(users: { username: string }[], query: string) {
	if (!query) return users;
	return users.filter((user) => user.username.toLowerCase().includes(query.toLowerCase()));
}

describe("User Search Utilities", () => {
	const mockUsers = [{ username: "steve_beve" }, { username: "archie" }, { username: "fred" }];

	it("filters users by username", () => {
		const result = filterUsers(mockUsers, "steve");
		expect(result).toHaveLength(1);
		expect(result[0].username).toBe("steve_beve");
	});

	it("returns all users when query is empty", () => {
		expect(filterUsers(mockUsers, "")).toHaveLength(3);
	});

	it("filters case-insensitively", () => {
		const result = filterUsers(mockUsers, "FRED");
		expect(result).toHaveLength(1);
		expect(result[0].username).toBe("fred");
	});
});
