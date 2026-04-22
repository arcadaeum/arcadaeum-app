import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

type Game = {
	id: number;
	title: string;
	cover_url: string | null;
};

// Search database first by game title
// Then search IGDB if not found (TO BE ADDED)

export default function GameSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<Game[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const searchRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout>();
	const loadingTimerRef = useRef<NodeJS.Timeout>();

	// Debounced search with loading delay
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

		// Debounce the actual search by 200ms
		debounceTimerRef.current = setTimeout(() => {
			const query = searchQuery.toLowerCase();

			fetch(`${import.meta.env.VITE_API_URL}/games`)
				.then((res) => res.json())
				.then((data: Game[]) => {
					const filtered = data.filter((game) =>
						game.title.toLowerCase().includes(query),
					);
					setResults(filtered.slice(0, 10));
					setIsOpen(true);
					setIsLoading(false);
					// Clear the loading timer since the results are now available
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
		}, 200); // 200ms debounce

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			if (loadingTimerRef.current) {
				clearTimeout(loadingTimerRef.current);
			}
		};
	}, [searchQuery]);

	const handleSelectGame = (gameId: number) => {
		navigate(`/games/${gameId}`);
		setSearchQuery("");
		setIsOpen(false);
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
							{results.map((game) => (
								<button
									key={game.id}
									onClick={() => handleSelectGame(game.id)}
									className="w-full px-4 py-3 text-left hover:bg-arcade-blue/20 transition-colors flex items-center gap-3 border-b border-arcade-white/10 last:border-b-0"
								>
									{game.cover_url && (
										<img
											src={game.cover_url}
											alt={game.title}
											className="w-10 h-14 object-cover rounded"
										/>
									)}
									<span className="text-arcade-white font-secondary truncate">
										{game.title}
									</span>
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
