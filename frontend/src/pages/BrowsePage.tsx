import { useEffect, useMemo, useState } from "react";
import { ColorBends, NavigationBar, PageHeader } from "@/components/ui";
import { BrowseFilters, BrowseGamesGrid } from "@/components/browse";
import type { BrowseSortOption } from "@/types/browse";
import type { Game } from "@/types/game";
import { BROWSE_SORT_OPTIONS, filterAndSortGames } from "@/utils/browse";

export default function BrowsePage() {
	const PAGE_SIZE = 50;

	const [games, setGames] = useState<Game[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<BrowseSortOption>("title-asc");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const filteredAndSortedGames = useMemo(() => {
		return filterAndSortGames(games, searchQuery, sortBy);
	}, [games, searchQuery, sortBy]);

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

			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16">
				<PageHeader
					title="The Arcadaeum."
					subtitle="Discover new games and explore your library."
				/>
				<BrowseFilters
					searchQuery={searchQuery}
					sortBy={sortBy}
					sortOptions={BROWSE_SORT_OPTIONS}
					onSearchChange={handleSearchChange}
					onSortChange={handleSortChange}
				/>
				<BrowseGamesGrid
					visibleGames={visibleGames}
					totalGamesCount={filteredAndSortedGames.length}
					hasMoreGames={hasMoreGames}
					onLoadMore={handleLoadMore}
					pageSize={PAGE_SIZE}
				/>
			</div>
		</>
	);
}
