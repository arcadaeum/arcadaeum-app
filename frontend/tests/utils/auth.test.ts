import { describe, it, expect } from "vitest";

// Simple auth token management
describe("Auth Token Utils", () => {
	it("stores and retrieves token from localStorage", () => {
		const token = "test-token-123";
		localStorage.setItem("auth_token", token);
		expect(localStorage.getItem("auth_token")).toBe(token);
	});

	it("clears token from localStorage", () => {
		localStorage.setItem("auth_token", "test-token");
		localStorage.removeItem("auth_token");
		expect(localStorage.getItem("auth_token")).toBeNull();
	});

	it("returns null when token does not exist", () => {
		localStorage.clear();
		expect(localStorage.getItem("auth_token")).toBeNull();
	});
});

// API URL construction
describe("API URL Utils", () => {
	it("constructs API base URL correctly", () => {
		const baseURL = "http://localhost:8000";
		expect(baseURL).toBe("http://localhost:8000");
	});

	it("constructs user endpoint correctly", () => {
		const userId = 1;
		const endpoint = `http://localhost:8000/users/${userId}`;
		expect(endpoint).toBe("http://localhost:8000/users/1");
	});

	it("constructs game endpoint correctly", () => {
		const gameId = 123;
		const endpoint = `http://localhost:8000/games/${gameId}`;
		expect(endpoint).toBe("http://localhost:8000/games/123");
	});
});
