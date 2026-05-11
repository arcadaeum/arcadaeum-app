import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import GameGrid from "@/components/game/GameGrid";

const mockGames = [
	{ id: 1, title: "Game One", cover_url: "one.jpg" },
	{ id: 2, title: "Game Two", cover_url: "two.jpg" },
];

describe("GameGrid", () => {
	it("renders all games", () => {
		render(
			<BrowserRouter>
				<GameGrid games={mockGames} />
			</BrowserRouter>,
		);
		expect(screen.getByText("Game One")).toBeInTheDocument();
		expect(screen.getByText("Game Two")).toBeInTheDocument();
	});

	it("shows empty message when no games", () => {
		render(
			<BrowserRouter>
				<GameGrid games={[]} emptyMessage="No games found" />
			</BrowserRouter>,
		);
		expect(screen.getByText("No games found")).toBeInTheDocument();
	});

	it("does not show empty message if not provided", () => {
		render(
			<BrowserRouter>
				<GameGrid games={[]} />
			</BrowserRouter>,
		);
		expect(screen.queryByText("No games found")).not.toBeInTheDocument();
	});
});
