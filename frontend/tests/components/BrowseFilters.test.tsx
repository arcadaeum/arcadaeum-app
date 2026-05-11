import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BrowseFilters from "@/components/browse/BrowseFilters";

const sortOptions = [
	{ value: "title-asc", label: "Title A-Z" },
	{ value: "title-desc", label: "Title Z-A" },
];

describe("BrowseFilters", () => {
	it("renders search input and sort select", () => {
		render(
			<BrowseFilters
				searchQuery=""
				sortBy="title-asc"
				sortOptions={sortOptions}
				onSearchChange={vi.fn()}
				onSortChange={vi.fn()}
			/>,
		);
		expect(screen.getByLabelText("Search titles")).toBeInTheDocument();
		expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
	});

	it("calls onSearchChange when typing", () => {
		const handleSearch = vi.fn();
		render(
			<BrowseFilters
				searchQuery=""
				sortBy="title-asc"
				sortOptions={sortOptions}
				onSearchChange={handleSearch}
				onSortChange={vi.fn()}
			/>,
		);
		const input = screen.getByLabelText("Search titles");
		fireEvent.change(input, { target: { value: "zelda" } });
		expect(handleSearch).toHaveBeenCalledWith("zelda");
	});

	it("calls onSortChange when selecting different sort", () => {
		const handleSort = vi.fn();
		render(
			<BrowseFilters
				searchQuery=""
				sortBy="title-asc"
				sortOptions={sortOptions}
				onSearchChange={vi.fn()}
				onSortChange={handleSort}
			/>,
		);
		const select = screen.getByLabelText("Sort by");
		fireEvent.change(select, { target: { value: "title-desc" } });
		expect(handleSort).toHaveBeenCalledWith("title-desc");
	});

	it("displays current search query and sort value", () => {
		render(
			<BrowseFilters
				searchQuery="mario"
				sortBy="title-desc"
				sortOptions={sortOptions}
				onSearchChange={vi.fn()}
				onSortChange={vi.fn()}
			/>,
		);
		expect(screen.getByLabelText("Search titles")).toHaveValue("mario");
		expect(screen.getByLabelText("Sort by")).toHaveValue("title-desc");
	});
});
