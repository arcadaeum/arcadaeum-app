import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NavigationBar from "@/components/ui/NavigationBar";

// Mock the images and icons
vi.mock("@/assets/images/LOGO_PURPLE.png", () => ({
	default: "test-logo.png",
}));

// Mock the search components
vi.mock("@/components/search", () => ({
	GameSearch: () => <div data-testid="game-search">GameSearch</div>,
	UserSearch: () => <div data-testid="user-search">UserSearch</div>,
}));

describe("NavigationBar", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	it("renders logo link to home", () => {
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		const logo = screen.getByAltText("Arcadaeum Logo");
		expect(logo).toBeInTheDocument();
		expect(logo.closest("a")).toHaveAttribute("href", "/");
	});

	it("shows search components when authenticated and not on excluded routes", () => {
		localStorage.setItem("access_token", "fake-token");
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		expect(screen.getByTestId("game-search")).toBeInTheDocument();
		expect(screen.queryByTestId("user-search")).not.toBeInTheDocument(); // default games
	});

	it("hides search on signin page even when authenticated", () => {
		localStorage.setItem("access_token", "fake-token");
		// Simulate being on /signin by wrapping with MemoryRouter? We'll just test prop
		render(
			<BrowserRouter>
				<NavigationBar isSignInPage={true} />
			</BrowserRouter>,
		);
		expect(screen.queryByTestId("game-search")).not.toBeInTheDocument();
	});

	it("shows user profile link when authenticated", () => {
		localStorage.setItem("access_token", "fake-token");
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		const profileLink = screen.getByLabelText("Go to profile");
		expect(profileLink).toBeInTheDocument();
		expect(profileLink).toHaveAttribute("href", "/user");
	});

	it("does not show profile link when not authenticated", () => {
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		expect(screen.queryByLabelText("Go to profile")).not.toBeInTheDocument();
	});

	it("opens and closes menu when clicking menu button", () => {
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		const menuButton = screen.getByLabelText("Open menu");
		fireEvent.click(menuButton);
		expect(screen.getByRole("menu")).toBeInTheDocument();
		fireEvent.click(menuButton);
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("shows sign in link in menu when not authenticated and not signin page", () => {
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		fireEvent.click(screen.getByLabelText("Open menu"));
		expect(screen.getByRole("menuitem", { name: "Sign In" })).toBeInTheDocument();
	});

	it("shows authenticated links when user logged in", () => {
		localStorage.setItem("access_token", "fake-token");
		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		fireEvent.click(screen.getByLabelText("Open menu"));
		expect(screen.getByRole("menuitem", { name: "Browse" })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Library" })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Log Out" })).toBeInTheDocument();
	});

	it("logs out and redirects to signin", () => {
		localStorage.setItem("access_token", "fake-token");
		const navigateMock = vi.fn();
		vi.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(navigateMock);

		render(
			<BrowserRouter>
				<NavigationBar />
			</BrowserRouter>,
		);
		fireEvent.click(screen.getByLabelText("Open menu"));
		fireEvent.click(screen.getByRole("menuitem", { name: "Log Out" }));
		expect(localStorage.getItem("access_token")).toBeNull();
		expect(navigateMock).toHaveBeenCalledWith("/signin");
	});
});
