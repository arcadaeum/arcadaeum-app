export type BrowseSortOption =
	| "title-asc"
	| "title-desc"
	| "rating-desc"
	| "rating-asc"
	| "release-old-new"
	| "release-new-old";

export type BrowseSortOptionItem = {
	value: BrowseSortOption;
	label: string;
};

export type BrowseFiltersProps = {
	searchQuery: string;
	sortBy: BrowseSortOption;
	sortOptions: BrowseSortOptionItem[];
	onSearchChange: (query: string) => void;
	onSortChange: (sortBy: BrowseSortOption) => void;
};
