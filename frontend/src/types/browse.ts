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

export type BrowseFilterOptionItem = {
	value: string;
	label: string;
};

export type BrowseFiltersProps = {
	searchQuery: string;
	selectedGenre: string;
	selectedPlatform: string;
	sortBy: BrowseSortOption;
	genreOptions: BrowseFilterOptionItem[];
	platformOptions: BrowseFilterOptionItem[];
	sortOptions: BrowseSortOptionItem[];
	onSearchChange: (query: string) => void;
	onGenreChange: (genre: string) => void;
	onPlatformChange: (platform: string) => void;
	onSortChange: (sortBy: BrowseSortOption) => void;
};
