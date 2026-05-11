import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import GameCard from "@/components/game/GameCard";

describe("GameCard", () => {
	it("renders title and image", () => {
		render(
			<BrowserRouter>
				<GameCard id={123} title="Test Game" image="test.jpg" />
			</BrowserRouter>,
		);
		expect(screen.getByText("Test Game")).toBeInTheDocument();
		const img = screen.getByAltText("Test Game");
		expect(img).toHaveAttribute("src", "test.jpg");
	});

	it("uses placeholder image when image not provided", () => {
		render(
			<BrowserRouter>
				<GameCard id={123} title="No Image" />
			</BrowserRouter>,
		);
		const img = screen.getByAltText("No Image");
		expect(img.getAttribute("src")).toContain("via.placeholder.com");
	});

	it("navigates to game detail on click by default", () => {
		const navigateMock = vi.fn();
		vi.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(navigateMock);

		render(
			<BrowserRouter>
				<GameCard id={456} title="Click Game" />
			</BrowserRouter>,
		);
		fireEvent.click(screen.getByRole("button"));
		expect(navigateMock).toHaveBeenCalledWith("/games/456");
	});

	it("calls custom onClick when provided", () => {
		const customClick = vi.fn();
		render(
			<BrowserRouter>
				<GameCard id={789} title="Custom" onClick={customClick} />
			</BrowserRouter>,
		);
		fireEvent.click(screen.getByRole("button"));
		expect(customClick).toHaveBeenCalledWith(789);
	});
});
