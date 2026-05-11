import { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import type { GameSearchResult } from "@/types/search";
import { useDebouncedSearch, useClickOutside } from "@/utils/search/hooks";
import { searchGames, addGameFromIGDB } from "@/utils/search/api";

export default function GameSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<GameSearchResult[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const searchRef = useRef<HTMLDivElement>(null);
	const trimmedQuery = searchQuery.trim();
	const hasQuery = trimmedQuery.length > 0;
	const [addingGameIds, setAddingGameIds] = useState<Set<number>>(new Set());

	const runGameSearch = useCallback(async () => {
		const query = trimmedQuery.toLowerCase();
		try {
			const searchResults = await searchGames(query);
			setResults(searchResults);
			setIsOpen(true);
			setIsLoading(false);
		} catch (error) {
			console.error("Search failed:", error);
			setResults([]);
			setIsLoading(false);
		}
	}, [trimmedQuery]);

	const handleLoadingStart = useCallback(() => {
		setIsLoading(true);
	}, []);

	const debouncedSearchOptions = useMemo(
		() => ({
			delay: 500,
			loadingDelay: 1000,
			onLoadingStart: handleLoadingStart,
		}),
		[handleLoadingStart],
	);

	// Debounced search with parallel IGDB fallback
	useDebouncedSearch(hasQuery, runGameSearch, debouncedSearchOptions);

	const handleSelectGame = async (game: GameSearchResult) => {
		if (game.id) {
			navigate(`/games/${game.id}`);
			setSearchQuery("");
			setIsOpen(false);
			return;
		}

		if (game.isFromIGDB && game.igdb_id) {
			setAddingGameIds((prev) => new Set(prev).add(game.igdb_id!));
			try {
				const addedGame = await addGameFromIGDB(game.igdb_id);
				navigate(`/games/${addedGame.id}`);
				setSearchQuery("");
				setIsOpen(false);
			} catch (error) {
				console.error(`Error adding game ${game.igdb_id}:`, error);
			} finally {
				setAddingGameIds((prev) => {
					const next = new Set(prev);
					next.delete(game.igdb_id!);
					return next;
				});
			}
		}
	};

	// Close dropdown when clicking outside
	useClickOutside(searchRef, () => setIsOpen(false));

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
					onFocus={() => hasQuery && setIsOpen(true)}
					className="w-full pl-10 pr-10 py-2 bg-arcade-black border-1 border-arcade-white/20 rounded-lg text-arcade-white placeholder-arcade-white/50 focus:border-arcade-blue focus:outline-none transition-colors"
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
			{isOpen && hasQuery && (
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
									disabled={game.isFromIGDB && addingGameIds.has(game.igdb_id!)}
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
									</div>
									{game.isFromIGDB && addingGameIds.has(game.igdb_id!) && (
										<span className="text-xs text-arcade-white/60">
											Adding...
										</span>
									)}
								</button>
							))}
						</div>
					) : hasQuery ? (
						<div className="px-4 py-3 text-arcade-white/60 text-center">
							No games found
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
