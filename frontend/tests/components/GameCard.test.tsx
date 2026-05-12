import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import GameCard from "@/components/game/GameCard";

// Mock useNavigate
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: vi.fn(),
	};
});

describe("GameCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

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

	it("navigates to game detail on click by default", async () => {
		const { useNavigate } = await import("react-router-dom");
		const navigateMock = vi.fn();
		vi.mocked(useNavigate).mockReturnValue(navigateMock);

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
