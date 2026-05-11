import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LibraryPage from "@/pages/LibraryPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...(actual as any),
		useNavigate: () => mockNavigate,
	};
});

global.fetch = vi.fn();

describe("LibraryPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it("redirects to signin if no token", async () => {
		render(
			<BrowserRouter>
				<LibraryPage />
			</BrowserRouter>,
		);
		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/signin");
		});
	});

	it("shows loading then library content", async () => {
		localStorage.setItem("access_token", "fake");
		(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, username: "test" }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					{
						game_id: 1,
						title: "Game One",
						cover_url: "",
						status: "playing",
						added_at: "",
						artworks: [],
					},
				],
			});

		render(
			<BrowserRouter>
				<LibraryPage />
			</BrowserRouter>,
		);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByText("Game One")).toBeInTheDocument();
		});
	});

	it("shows empty message when library empty", async () => {
		localStorage.setItem("access_token", "fake");
		(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, username: "test" }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

		render(
			<BrowserRouter>
				<LibraryPage />
			</BrowserRouter>,
		);
		await waitFor(() => {
			expect(screen.getByText(/Your library is currently empty/)).toBeInTheDocument();
		});
	});
});
