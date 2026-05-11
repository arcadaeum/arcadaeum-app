import type { BrowseSortOption, BrowseFiltersProps } from "@/types/browse";

export default function BrowseFilters({
	searchQuery,
	selectedGenre,
	selectedPlatform,
	sortBy,
	genreOptions,
	platformOptions,
	sortOptions,
	onSearchChange,
	onGenreChange,
	onPlatformChange,
	onSortChange,
}: BrowseFiltersProps) {
	return (
		<div className="w-full max-w-7xl mx-auto px-4 mt-6">
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,13rem)_minmax(0,13rem)_minmax(0,13rem)] lg:items-end">
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
				<div className="w-full">
					<label
						htmlFor="genre-filter"
						className="block text-xs font-default text-gray-300 mb-1"
					>
						Genre
					</label>
					<select
						id="genre-filter"
						value={selectedGenre}
						onChange={(event) => onGenreChange(event.target.value)}
						className="w-full rounded-lg border-2 border-arcade-white bg-arcade-black/70 px-3 py-2 font-default text-arcade-white outline-none focus:border-arcade-blue"
					>
						<option value="">All genres</option>
						{genreOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div className="w-full">
					<label
						htmlFor="platform-filter"
						className="block text-xs font-default text-gray-300 mb-1"
					>
						Platform
					</label>
					<select
						id="platform-filter"
						value={selectedPlatform}
						onChange={(event) => onPlatformChange(event.target.value)}
						className="w-full rounded-lg border-2 border-arcade-white bg-arcade-black/70 px-3 py-2 font-default text-arcade-white outline-none focus:border-arcade-blue"
					>
						<option value="">All platforms</option>
						{platformOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div className="w-full">
					<label
						htmlFor="sort-by"
						className="block text-xs font-default text-gray-300 mb-1"
					>
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
