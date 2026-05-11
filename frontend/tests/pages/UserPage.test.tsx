import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserPage from "@/pages/UserPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...(actual as any),
		useNavigate: () => mockNavigate,
	};
});

global.fetch = vi.fn();

describe("UserPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it("redirects to signin if no token", async () => {
		render(
			<BrowserRouter>
				<UserPage />
			</BrowserRouter>,
		);
		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/signin");
		});
	});

	it("loads user profile and displays it", async () => {
		localStorage.setItem("access_token", "fake");
		(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, username: "testuser", display_name: "Test User" }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, name: "Favourites", is_default: false }],
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					/* followers */
				],
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					/* following */
				],
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					/* library */
				],
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					/* reviews */
				],
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					/* posts */
				],
			});

		render(
			<BrowserRouter>
				<UserPage />
			</BrowserRouter>,
		);
		await waitFor(() => {
			expect(screen.getByText("Test User")).toBeInTheDocument();
		});
	});

	it("shows error when user fetch fails", async () => {
		localStorage.setItem("access_token", "fake");
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 401,
		});
		render(
			<BrowserRouter>
				<UserPage />
			</BrowserRouter>,
		);
		await waitFor(() => {
			expect(screen.getByText("You must be logged in.")).toBeInTheDocument();
			expect(localStorage.getItem("access_token")).toBeNull();
			expect(mockNavigate).toHaveBeenCalledWith("/signin");
		});
	});
});
