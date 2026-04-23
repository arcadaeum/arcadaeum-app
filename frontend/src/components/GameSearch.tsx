import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

type Game = {
	id?: number;
	igdb_id?: number;
	title: string;
	cover_url: string | null;
	isFromIGDB?: boolean;
};

export default function GameSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<Game[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const searchRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout>();
	const loadingTimerRef = useRef<NodeJS.Timeout>();

	// Debounced search with parallel IGDB fallback
	useEffect(() => {
		// Clear previous timers
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
		if (loadingTimerRef.current) {
			clearTimeout(loadingTimerRef.current);
		}

		if (!searchQuery.trim()) {
			setResults([]);
			setIsOpen(false);
			setIsLoading(false);
			return;
		}

		// Set loading to true only after 1 second
		loadingTimerRef.current = setTimeout(() => {
			setIsLoading(true);
		}, 1000);

		// Debounce the actual search by 500ms
		debounceTimerRef.current = setTimeout(() => {
			const query = searchQuery.toLowerCase();

			// Fetch both database and IGDB in parallel
			Promise.all([
				// Search database
				fetch(`${import.meta.env.VITE_API_URL}/games`)
					.then((res) => res.json())
					.catch(() => []),
				// Search IGDB
				fetch(
					`${import.meta.env.VITE_API_URL}/games/search-igdb?q=${encodeURIComponent(
						query,
					)}`,
				)
					.then((res) => res.json())
					.catch(() => []),
			])
				.then(([dbGames, igdbGames]) => {
					// Filter database results
					const dbResults: Game[] = dbGames
						.filter((game: Game) => game.title.toLowerCase().includes(query))
						.slice(0, 10);

					// Get all igdb_ids from database results to exclude duplicates
					const dbIgdbIds = new Set(dbGames.map((game: Game) => game.igdb_id));

					// Format IGDB results and exclude games already in database
					const igdbResults: Game[] = (igdbGames || [])
						.filter((game: any) => !dbIgdbIds.has(game.id)) // Exclude duplicates
						.map((game: any) => ({
							igdb_id: game.id,
							title: game.name,
							cover_url: game.cover_url || null,
							isFromIGDB: true,
						}))
						.slice(0, 5); // Limit IGDB results

					// Combine: database results first, then IGDB results
					const combinedResults = [...dbResults, ...igdbResults];

					setResults(combinedResults);
					setIsOpen(true);
					setIsLoading(false);
					if (loadingTimerRef.current) {
						clearTimeout(loadingTimerRef.current);
					}
				})
				.catch(() => {
					setResults([]);
					setIsLoading(false);
					if (loadingTimerRef.current) {
						clearTimeout(loadingTimerRef.current);
					}
				});
		}, 500);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			if (loadingTimerRef.current) {
				clearTimeout(loadingTimerRef.current);
			}
		};
	}, [searchQuery]);

	const handleSelectGame = async (game: Game) => {
		if (game.isFromIGDB && game.igdb_id) {
			// Add game from IGDB to database
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/games/add-from-igdb`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ igdb_id: game.igdb_id }),
					},
				);

				if (response.ok) {
					const newGame = await response.json();
					// Navigate using the database id returned from the backend
					navigate(`/games/${newGame.id}`);
					setSearchQuery("");
					setIsOpen(false);
				} else {
					console.error("Failed to add game to database");
				}
			} catch (error) {
				console.error("Error adding game:", error);
			}
		} else if (game.id) {
			// Game already in database
			navigate(`/games/${game.id}`);
			setSearchQuery("");
			setIsOpen(false);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={searchRef} className="relative w-full max-w-md">
			{/* Search Input */}
			<div className="relative flex items-center">
				<Search className="absolute left-3 w-5 h-5 text-arcade-white/60 pointer-events-none" />
				<input
					type="text"
					placeholder="Search games by title..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => searchQuery && setIsOpen(true)}
					className="w-full pl-10 pr-10 py-2 bg-arcade-black border-2 border-arcade-white/30 rounded-lg text-arcade-white placeholder-arcade-white/50 focus:border-arcade-blue focus:outline-none transition-colors"
				/>
				{searchQuery && (
					<button
						onClick={() => {
							setSearchQuery("");
							setResults([]);
							setIsOpen(false);
							setIsLoading(false);
						}}
						className="absolute right-3 text-arcade-white/60 hover:text-arcade-white"
					>
						<X className="w-5 h-5" />
					</button>
				)}
			</div>

			{/* Search Results Dropdown */}
			{isOpen && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-arcade-black border-2 border-arcade-white/30 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
					{isLoading ? (
						<div className="px-4 py-3 text-arcade-white/60 text-center">Loading...</div>
					) : results.length > 0 ? (
						<div className="py-2">
							{results.map((game, idx) => (
								<button
									key={`${game.id || game.igdb_id}-${idx}`}
									onClick={() => handleSelectGame(game)}
									className="w-full px-4 py-3 text-left hover:bg-arcade-blue/20 transition-colors flex items-center gap-3 border-b border-arcade-white/10 last:border-b-0"
								>
									{game.cover_url && (
										<img
											src={game.cover_url}
											alt={game.title}
											className="w-10 h-14 object-cover rounded"
										/>
									)}
									<div className="flex-1">
										<span className="text-arcade-white font-secondary truncate">
											{game.title}
										</span>
										{game.isFromIGDB && (
											<span className="text-xs text-arcade-white/50">
												(from IGDB)
											</span>
										)}
									</div>
								</button>
							))}
						</div>
					) : searchQuery ? (
						<div className="px-4 py-3 text-arcade-white/60 text-center">
							No games found
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
