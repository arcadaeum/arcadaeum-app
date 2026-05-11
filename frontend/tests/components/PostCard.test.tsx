import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PostCard from "@/components/posts/PostCard";
import type { SocialPost } from "@/types/posts";

const mockPost: SocialPost = {
	id: 1,
	user_id: 42,
	content: "This is a test post",
	created_at: "2025-05-11T10:00:00Z",
	updated_at: null,
	display_name: "Test User",
	username: "testuser",
	profile_picture: null,
};

describe("PostCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders post content and author info", () => {
		render(
			<BrowserRouter>
				<PostCard post={mockPost} apiUrl="http://localhost:8000" />
			</BrowserRouter>,
		);
		expect(screen.getByText("Test User")).toBeInTheDocument();
		expect(screen.getByText("This is a test post")).toBeInTheDocument();
	});

	it("shows edit/delete buttons when canManage is true", () => {
		render(
			<BrowserRouter>
				<PostCard post={mockPost} apiUrl="http://localhost:8000" canManage />
			</BrowserRouter>,
		);
		expect(screen.getByLabelText("Edit post")).toBeInTheDocument();
		expect(screen.getByLabelText("Delete post")).toBeInTheDocument();
	});

	it("does not show edit/delete when canManage is false", () => {
		render(
			<BrowserRouter>
				<PostCard post={mockPost} apiUrl="http://localhost:8000" canManage={false} />
			</BrowserRouter>,
		);
		expect(screen.queryByLabelText("Edit post")).not.toBeInTheDocument();
	});

	it("enters edit mode and calls onUpdate", async () => {
		const handleUpdate = vi.fn().mockResolvedValue(undefined);
		render(
			<BrowserRouter>
				<PostCard
					post={mockPost}
					apiUrl="http://localhost:8000"
					canManage
					onUpdate={handleUpdate}
				/>
			</BrowserRouter>,
		);
		fireEvent.click(screen.getByLabelText("Edit post"));
		const textarea = screen.getByDisplayValue("This is a test post");
		fireEvent.change(textarea, { target: { value: "Updated content" } });
		fireEvent.click(screen.getByLabelText("Save post"));
		await waitFor(() => {
			expect(handleUpdate).toHaveBeenCalledWith(1, "Updated content");
		});
	});

	it("calls onDelete when delete button clicked", async () => {
		const handleDelete = vi.fn().mockResolvedValue(undefined);
		render(
			<BrowserRouter>
				<PostCard
					post={mockPost}
					apiUrl="http://localhost:8000"
					canManage
					onDelete={handleDelete}
				/>
			</BrowserRouter>,
		);
		fireEvent.click(screen.getByLabelText("Delete post"));
		await waitFor(() => {
			expect(handleDelete).toHaveBeenCalledWith(1);
		});
	});

	it("wraps in link when profilePath provided and not managing", () => {
		render(
			<BrowserRouter>
				<PostCard post={mockPost} apiUrl="http://localhost:8000" profilePath="/users/42" />
			</BrowserRouter>,
		);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/users/42");
	});
});
