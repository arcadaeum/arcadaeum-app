import ColorBends from "../components/ColorBends";
import NavigationBar from "../components/NavigationBar";
import GameCard from "../components/GameCard";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

function BrowsePage() {
	const PAGE_SIZE = 50;

	type Game = {
		id: number;
		igdb_id: number;
		title: string;
		summary: string | null;
		developer: string | null;
		cover_url?: string | null;
		platforms: string[] | null;
		release_date: string | null;
		igdb_rating: number | null;
		created_at: string;
	};

	type SortOption =
		| "title-asc"
		| "title-desc"
		| "rating-desc"
		| "rating-asc"
		| "release-old-new"
		| "release-new-old";

	const [games, setGames] = useState<Game[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("title-asc");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	// Stops inconsistent sorting when some games have null ratings or release dates
	const compareNullableNumbers = (
		a: number | null,
		b: number | null,
		direction: "asc" | "desc",
	) => {
		if (a === null && b === null) return 0;
		if (a === null) return 1;
		if (b === null) return -1;

		if (direction === "asc") return a - b;
		return b - a;
	};

	const getReleaseTimestamp = (releaseDate: string | null) => {
		if (!releaseDate) return null;
		const timestamp = Date.parse(releaseDate);
		return Number.isNaN(timestamp) ? null : timestamp;
	};

	const filteredAndSortedGames = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		const filteredGames = normalizedQuery
			? games.filter((game) => game.title.toLowerCase().includes(normalizedQuery))
			: games;

		return [...filteredGames].sort((a, b) => {
			switch (sortBy) {
				case "title-desc":
					return b.title.localeCompare(a.title);
				case "rating-desc":
					return compareNullableNumbers(a.igdb_rating, b.igdb_rating, "desc");
				case "rating-asc":
					return compareNullableNumbers(a.igdb_rating, b.igdb_rating, "asc");
				case "release-old-new":
					return compareNullableNumbers(
						getReleaseTimestamp(a.release_date),
						getReleaseTimestamp(b.release_date),
						"asc",
					);
				case "release-new-old":
					return compareNullableNumbers(
						getReleaseTimestamp(a.release_date),
						getReleaseTimestamp(b.release_date),
						"desc",
					);
				case "title-asc":
				default:
					return a.title.localeCompare(b.title);
			}
		});
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

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
		setVisibleCount(PAGE_SIZE);
	};

	const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setSortBy(event.target.value as SortOption);
		setVisibleCount(PAGE_SIZE);
	};

	return (
		<>
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90"
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
				<h1
					className="w-full mt-25 text-4xl font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Browse
				</h1>
				<p className="mt-4 text-sm font-default text-gray-200">
					Discover new games and explore your library.
				</p>
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
								onChange={handleSearchChange}
								placeholder="Type a game title..."
								className="w-full rounded-lg border-2 border-arcade-white bg-arcade-black/70 px-3 py-2 font-default text-arcade-white placeholder:text-gray-400 outline-none focus:border-arcade-blue"
							/>
						</div>
						<div className="w-full sm:w-52">
							<label
								htmlFor="sort-by"
								className="block text-xs font-default text-gray-300 mb-1"
							>
								Sort by
							</label>
							<select
								id="sort-by"
								value={sortBy}
								onChange={handleSortChange}
								className="w-full rounded-lg border-2 border-arcade-white bg-arcade-black/70 px-3 py-2 font-default text-arcade-white outline-none focus:border-arcade-blue"
							>
								<option value="title-asc">Title (A-Z)</option>
								<option value="title-desc">Title (Z-A)</option>
								<option value="rating-desc">Rating (High-Low)</option>
								<option value="rating-asc">Rating (Low-High)</option>
								<option value="release-old-new">Release Date (Old-New)</option>
								<option value="release-new-old">Release Date (New-Old)</option>
							</select>
						</div>
					</div>
				</div>
				<div className="w-full max-w-7xl mx-auto px-4 py-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
						{visibleGames.map((game) => (
							<GameCard
								key={game.id}
								id={game.id}
								title={game.title}
								image={game.cover_url}
							/>
						))}
					</div>

					{filteredAndSortedGames.length === 0 && (
						<p className="mt-8 text-center text-sm font-default text-gray-300">
							No games matched your search.
						</p>
					)}

					{hasMoreGames && (
						<div className="mt-8 flex justify-center">
							<button
								onClick={handleLoadMore}
								className="bg-arcade-black hover:bg-arcade-blue text-arcade-white font-title py-2 px-6 border-2 border-arcade-white rounded-lg"
							>
								Load 50 More
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default BrowsePage;
