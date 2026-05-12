import { useEffect, useMemo, useState } from "react";
import { ColorBends, MainButton, NavigationBar, PageHeader } from "@/components/ui";
import { BrowseFilters } from "@/components/browse";
import { GameGrid } from "@/components/game";
import type { BrowseSortOption } from "@/types/browse";
import type { Game } from "@/types/game";
import { BROWSE_SORT_OPTIONS, filterAndSortGames, getFilterOptions } from "@/utils/browse";

export default function BrowsePage() {
	const PAGE_SIZE = 50;

	const [games, setGames] = useState<Game[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("");
	const [selectedPlatform, setSelectedPlatform] = useState("");
	const [sortBy, setSortBy] = useState<BrowseSortOption>("title-asc");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const filteredAndSortedGames = useMemo(() => {
		return filterAndSortGames(games, searchQuery, sortBy, selectedGenre, selectedPlatform);
	}, [games, searchQuery, selectedGenre, selectedPlatform, sortBy]);

	const genreOptions = useMemo(() => getFilterOptions(games, "genres"), [games]);
	const platformOptions = useMemo(() => getFilterOptions(games, "platforms"), [games]);

	// A slice of all visible games
	const visibleGames = filteredAndSortedGames.slice(0, visibleCount);
	const hasMoreGames = visibleCount < filteredAndSortedGames.length;

	// Get games from the backend
	useEffect(() => {
		const url = import.meta.env.VITE_API_URL;

		fetch(`${url}/games`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch games");
				return res.json();
			})
			.then((data: Game[]) => {
				setGames(data);
				setVisibleCount(PAGE_SIZE);
			})
			.catch(() => setGames([]));
	}, []);

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + PAGE_SIZE);
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setVisibleCount(PAGE_SIZE);
	};

	const handleGenreChange = (value: string) => {
		setSelectedGenre(value);
		setVisibleCount(PAGE_SIZE);
	};

	const handlePlatformChange = (value: string) => {
		setSelectedPlatform(value);
		setVisibleCount(PAGE_SIZE);
	};

	const handleSortChange = (value: BrowseSortOption) => {
		setSortBy(value);
		setVisibleCount(PAGE_SIZE);
	};

	return (
		<>
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90 blur-3xl"
				rotation={32}
				colors={["#8122c0", "#5647f1", "#37b0ea"]}
				speed={0.2}
				scale={2}
				frequency={1}
				warpStrength={1}
				mouseInfluence={1}
				parallax={0.5}
				noise={0.1}
				transparent
				autoRotate={0}
			/>
			<NavigationBar />

			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16 max-sm:pt-28 max-sm:px-4 max-sm:items-stretch">
				<PageHeader
					title="The Arcadaeum."
					subtitle="Discover new games and explore your library."
				/>
				<BrowseFilters
					searchQuery={searchQuery}
					selectedGenre={selectedGenre}
					selectedPlatform={selectedPlatform}
					sortBy={sortBy}
					genreOptions={genreOptions}
					platformOptions={platformOptions}
					sortOptions={BROWSE_SORT_OPTIONS}
					onSearchChange={handleSearchChange}
					onGenreChange={handleGenreChange}
					onPlatformChange={handlePlatformChange}
					onSortChange={handleSortChange}
				/>
				<div className="w-full max-w-7xl mx-auto px-4 py-6 max-sm:px-0 max-sm:py-4">
					<GameGrid games={visibleGames} emptyMessage="No games matched your search." />

					{hasMoreGames && (
						<div className="mt-8 flex justify-center">
							<MainButton
								text={`Load ${PAGE_SIZE} More`}
								onClick={handleLoadMore}
								className="max-sm:w-full"
							/>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
