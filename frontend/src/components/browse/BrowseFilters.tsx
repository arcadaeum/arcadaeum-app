import type { BrowseSortOption, BrowseSortOptionItem } from "@/types/browse";

type BrowseFiltersProps = {
	searchQuery: string;
	sortBy: BrowseSortOption;
	sortOptions: BrowseSortOptionItem[];
	onSearchChange: (query: string) => void;
	onSortChange: (sortBy: BrowseSortOption) => void;
};

export default function BrowseFilters({
	searchQuery,
	sortBy,
	sortOptions,
	onSearchChange,
	onSortChange,
}: BrowseFiltersProps) {
	return (
		<div className="w-full max-w-7xl mx-auto px-4 mt-6">
			<div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
				<div className="w-full sm:max-w-md">
					<label
						htmlFor="game-title-filter"
						className="block text-xs font-default text-gray-300 mb-1"
					>
						Search titles
					</label>
					<input
						id="game-title-filter"
						type="text"
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Type a game title..."
						className="w-full rounded-lg border-2 border-arcade-white bg-arcade-black/70 px-3 py-2 font-default text-arcade-white placeholder:text-gray-400 outline-none focus:border-arcade-blue"
					/>
				</div>
				<div className="w-full sm:w-52">
					<label htmlFor="sort-by" className="block text-xs font-default text-gray-300 mb-1">
						Sort by
					</label>
					<select
						id="sort-by"
						value={sortBy}
						onChange={(event) => onSortChange(event.target.value as BrowseSortOption)}
						className="w-full rounded-lg border-2 border-arcade-white bg-arcade-black/70 px-3 py-2 font-default text-arcade-white outline-none focus:border-arcade-blue"
					>
						{sortOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
