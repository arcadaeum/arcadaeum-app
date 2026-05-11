import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Mock PageHeader component
function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
	return (
		<div>
			<h1>{title}</h1>
			{subtitle && <p>{subtitle}</p>}
		</div>
	);
}

describe("PageHeader Component", () => {
	it("renders title correctly", () => {
		render(<PageHeader title="Test Page" />);
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Test Page");
	});

	it("renders subtitle when provided", () => {
		render(<PageHeader title="Test Page" subtitle="Test Subtitle" />);
		expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
	});

	it("does not render subtitle when not provided", () => {
		render(<PageHeader title="Test Page" />);
		expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
	});
});

// Mock NavigationBar component
function NavigationBar() {
	return (
		<nav>
			<a href="/">Home</a>
			<a href="/browse">Browse</a>
			<a href="/library">Library</a>
		</nav>
	);
}

describe("NavigationBar Component", () => {
	it("renders navigation links", () => {
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Browse" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Library" })).toBeInTheDocument();
	});

	it("links have correct href attributes", () => {
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("link", { name: "Browse" })).toHaveAttribute("href", "/browse");
	});
});
