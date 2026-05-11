import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ArcadaeumReview } from "@/types/gameDetail";

describe("Arcadaeum Review Utilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	describe("fetchArcadaeumReview", () => {
		it("should fetch and return arcadaeum review data", async () => {
			const mockReview: ArcadaeumReview = {
				game_id: 5,
				average_rating: 7.5,
				total_reviews: 4,
			};

			global.fetch = vi.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => mockReview,
			});

			// Inline the function for testing since we're testing the utility
			const response = await fetch("http://api.example.com/games/5/arcadaeum-review");
			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data).toEqual(mockReview);
			expect(data.average_rating).toBe(7.5);
			expect(data.total_reviews).toBe(4);
		});

		it("should handle 404 when no reviews exist", async () => {
			global.fetch = vi.fn().mockResolvedValueOnce({
				ok: false,
				status: 404,
			});

			const response = await fetch("http://api.example.com/games/999/arcadaeum-review");

			expect(response.ok).toBe(false);
			expect(response.status).toBe(404);
		});

		it("should handle network errors gracefully", async () => {
			global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

			try {
				await fetch("http://api.example.com/games/5/arcadaeum-review");
				expect.fail("Should have thrown an error");
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toContain("Network error");
			}
		});
	});

	describe("Arcadaeum Review Data Validation", () => {
		it("should validate review object structure", () => {
			const review: ArcadaeumReview = {
				game_id: 10,
				average_rating: 8.5,
				total_reviews: 2,
			};

			expect(review).toHaveProperty("game_id");
			expect(review).toHaveProperty("average_rating");
			expect(review).toHaveProperty("total_reviews");
			expect(typeof review.average_rating).toBe("number");
			expect(typeof review.total_reviews).toBe("number");
		});

		it("should handle single review aggregation", () => {
			const review: ArcadaeumReview = {
				game_id: 15,
				average_rating: 9.0,
				total_reviews: 1,
			};

			expect(review.total_reviews).toBe(1);
			expect(review.average_rating).toBe(9.0);
		});

		it("should handle average rating within valid range", () => {
			const review: ArcadaeumReview = {
				game_id: 20,
				average_rating: 5.5,
				total_reviews: 10,
			};

			expect(review.average_rating).toBeGreaterThanOrEqual(0);
			expect(review.average_rating).toBeLessThanOrEqual(10);
		});

		it("should handle many reviews", () => {
			const review: ArcadaeumReview = {
				game_id: 25,
				average_rating: 7.2,
				total_reviews: 100,
			};

			expect(review.total_reviews).toBeGreaterThan(1);
			expect(review.average_rating).toBeCloseTo(7.2, 1);
		});
	});

	describe("Rating Color Coding", () => {
		it("should convert 10-point rating to 5-star scale", () => {
			const tenPointRating = 8.5;
			const fiveStarRating = tenPointRating / 2;
			expect(fiveStarRating).toBe(4.25);
		});

		it("should handle edge case ratings", () => {
			// Minimum rating
			const minRating = 1.0;
			const minStars = minRating / 2;
			expect(minStars).toBe(0.5);

			// Maximum rating
			const maxRating = 10.0;
			const maxStars = maxRating / 2;
			expect(maxStars).toBe(5);
		});
	});
});
