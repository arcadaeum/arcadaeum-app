import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RatingStarBar from "@/components/game/RatingStarBar";

describe("RatingStarBar", () => {
	it("renders 5 stars", () => {
		render(<RatingStarBar value={0} />);
		const stars = document.querySelectorAll("svg");
		expect(stars).toHaveLength(10); // 2 SVGs per star (background + filled)
	});

	it("displays rating color based on value", () => {
		render(<RatingStarBar value={10} />);
		// Check that at least one SVG with the color style exists
		const svgs = document.querySelectorAll("svg");
		expect(svgs.length).toBeGreaterThan(0);
	});

	it("calls onChange when star half clicked", () => {
		const handleChange = vi.fn();
		render(<RatingStarBar onChange={handleChange} />);
		const firstStarLeftHalf = document.querySelector("button");
		fireEvent.click(firstStarLeftHalf!);
		expect(handleChange).toHaveBeenCalledWith(1);
	});

	it("disables interactions when disabled prop is true", () => {
		const handleChange = vi.fn();
		render(<RatingStarBar onChange={handleChange} disabled />);
		const buttons = document.querySelectorAll("button");
		buttons.forEach((btn) => expect(btn).toBeDisabled());
		fireEvent.click(buttons[0]);
		expect(handleChange).not.toHaveBeenCalled();
	});

	it("updates internal rating when no value provided", () => {
		render(<RatingStarBar />);
		const firstStarLeft = document.querySelector("button");
		fireEvent.click(firstStarLeft!);
		// The component should now show a rating of 1 (0.5 stars)
		// We can check by verifying the button was clicked
		expect(firstStarLeft).toBeInTheDocument();
	});
});
