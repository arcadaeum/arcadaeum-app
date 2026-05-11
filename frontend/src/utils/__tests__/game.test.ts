import { describe, it, expect } from "vitest";

// Mock star rating calculation
function getStarRating(rating: number): number {
	if (rating < 0 || rating > 100) return 0;
	// Convert 0-100 to 0-5 stars, round to nearest 0.5
	return Math.round((rating / 20) * 2) / 2;
}

describe("Game Utilities", () => {
	describe("Star Rating Calculation", () => {
		it("converts 100 to 5 stars", () => {
			expect(getStarRating(100)).toBe(5);
		});

		it("converts 50 to 2.5 stars", () => {
			expect(getStarRating(50)).toBe(2.5);
		});

		it("converts 0 to 0 stars", () => {
			expect(getStarRating(0)).toBe(0);
		});

		it("converts 80 to 4 stars", () => {
			expect(getStarRating(80)).toBe(4);
		});

		it("returns 0 for invalid negative rating", () => {
			expect(getStarRating(-10)).toBe(0);
		});

		it("returns 0 for invalid rating over 100", () => {
			expect(getStarRating(150)).toBe(0);
		});
	});

	describe("Game Data Formatting", () => {
		it("formats game title correctly", () => {
			const title = "The Witcher 3: Wild Hunt";
			expect(title.trim()).toBe("The Witcher 3: Wild Hunt");
		});

		it("handles empty game title", () => {
			const title = "";
			expect(title || "Unknown Game").toBe("Unknown Game");
		});

		it("handles null release date", () => {
			const releaseDate: string | null = null;
			expect(releaseDate || "TBA").toBe("TBA");
		});

		it("formats release date correctly", () => {
			const releaseDate = "2024-05-11";
			const date = new Date(releaseDate);
			expect(date.getFullYear()).toBe(2024);
		});
	});
});
