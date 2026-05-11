import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArcadaeumRating from "@/components/game/ArcadaeumRating";
import type { ArcadaeumReview } from "@/types/gameDetail";

describe("ArcadaeumRating Component", () => {
	it("renders 'No reviews yet' when arcadaeum review is null", () => {
		render(<ArcadaeumRating arcadaeumReview={null} />);

		expect(screen.getByText("No reviews yet")).toBeInTheDocument();
		expect(screen.getByText("Arcadaeum Rating")).toBeInTheDocument();
	});

	it("renders 'No reviews yet' when total_reviews is 0", () => {
		const review: ArcadaeumReview = {
			game_id: 5,
			average_rating: 0,
			total_reviews: 0,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		expect(screen.getByText("No reviews yet")).toBeInTheDocument();
	});

	it("renders rating information when reviews exist", () => {
		const review: ArcadaeumReview = {
			game_id: 5,
			average_rating: 7.5,
			total_reviews: 4,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		expect(screen.getByText("7.5")).toBeInTheDocument();
		expect(screen.getByText(/Based on 4 reviews/)).toBeInTheDocument();
	});

	it("renders correct singular review text", () => {
		const review: ArcadaeumReview = {
			game_id: 10,
			average_rating: 9.0,
			total_reviews: 1,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		expect(screen.getByText("9.0")).toBeInTheDocument();
		expect(screen.getByText(/Based on 1 review/)).toBeInTheDocument();
	});

	it("renders correct plural review text", () => {
		const review: ArcadaeumReview = {
			game_id: 20,
			average_rating: 5.5,
			total_reviews: 10,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		expect(screen.getByText("5.5")).toBeInTheDocument();
		expect(screen.getByText(/Based on 10 reviews/)).toBeInTheDocument();
	});

	it("formats rating to one decimal place", () => {
		const review: ArcadaeumReview = {
			game_id: 15,
			average_rating: 7.3456,
			total_reviews: 5,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		// Should display formatted to 1 decimal place
		expect(screen.getByText("7.3")).toBeInTheDocument();
	});

	it("displays Arcadaeum Rating heading", () => {
		const review: ArcadaeumReview = {
			game_id: 25,
			average_rating: 8.0,
			total_reviews: 3,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		expect(screen.getByText("Arcadaeum Rating")).toBeInTheDocument();
	});

	it("handles high ratings", () => {
		const review: ArcadaeumReview = {
			game_id: 30,
			average_rating: 9.8,
			total_reviews: 20,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		expect(screen.getByText("9.8")).toBeInTheDocument();
		expect(screen.getByText(/Based on 20 reviews/)).toBeInTheDocument();
	});

	it("handles low ratings", () => {
		const review: ArcadaeumReview = {
			game_id: 35,
			average_rating: 2.5,
			total_reviews: 8,
		};

		render(<ArcadaeumRating arcadaeumReview={review} />);

		expect(screen.getByText("2.5")).toBeInTheDocument();
		expect(screen.getByText(/Based on 8 reviews/)).toBeInTheDocument();
	});
});
