import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends, PageHeader } from "@/components/ui";
import { BrowseFilters } from "@/components/browse";
import { GameCard } from "@/components/game";
import type { BrowseSortOption } from "@/types/browse";
import type { Game } from "@/types/game";
import type { LibraryEntry, UserProfile } from "@/types/user";
import { BROWSE_SORT_OPTIONS, filterAndSortGames } from "@/utils/browse";

export default function LibraryPage() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [library, setLibrary] = useState<LibraryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<BrowseSortOption>("title-asc");
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const filteredAndSortedLibrary = useMemo(() => {
		const libraryAsGames: Game[] = library.map((entry) => ({
			id: entry.game_id,
			igdb_id: entry.igdb_id,
			title: entry.title,
			summary: entry.summary ?? null,
			developer: entry.developer ?? null,
			cover_url: entry.cover_url ?? null,
			screenshots: entry.screenshots ?? null,
			platforms: entry.platforms ?? null,
			release_date: entry.release_date ?? null,
			igdb_rating: entry.igdb_rating ?? null,
			created_at: entry.created_at ?? null,
		}));

		const filteredGames = filterAndSortGames(libraryAsGames, searchQuery, sortBy);
		const filteredGameIds = new Set(filteredGames.map((game) => game.id));
		const orderByGameId = new Map(filteredGames.map((game, index) => [game.id, index]));

		return library
			.filter((entry) => filteredGameIds.has(entry.game_id))
			.sort(
				(a, b) => (orderByGameId.get(a.game_id) ?? 0) - (orderByGameId.get(b.game_id) ?? 0),
			);
	}, [library, searchQuery, sortBy]);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			navigate("/signin");
			return;
		}
		fetch(`${apiUrl}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Unauthorized");
				return res.json();
			})
			.then((data) => setUser(data))
			.catch(() => {
				setError("You must be logged in.");
				localStorage.removeItem("access_token");
				navigate("/signin");
			})
			.finally(() => setLoading(false));
	}, [apiUrl, navigate]);

	// Fetch user's library from API
	useEffect(() => {
		if (!user) return; // Wait for user to be authenticated

		const token = localStorage.getItem("access_token");
		if (!token) {
			return;
		}
		fetch(`${apiUrl}/users/me/library`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch library");
				return res.json();
			})
			.then((data: LibraryEntry[]) => setLibrary(data))
			.catch(() => setLibrary([]));
	}, [apiUrl, user]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	return (
		<>
			<NavigationBar />
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
			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16">
				<PageHeader title="Your Library." subtitle="The home of for all your games." />

				<BrowseFilters
					searchQuery={searchQuery}
					sortBy={sortBy}
					sortOptions={BROWSE_SORT_OPTIONS}
					onSearchChange={setSearchQuery}
					onSortChange={setSortBy}
				/>

				<div className="w-full max-w-7xl mx-auto px-4 py-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
						{filteredAndSortedLibrary.map((entry) => (
							<GameCard
								key={entry.id}
								id={entry.game_id}
								title={entry.title}
								image={entry.cover_url}
							/>
						))}
					</div>

					{library.length === 0 ? (
						<h3 className="mt-8 text-center text-2xl font-title text-arcade-white tracking-tighter">
							Your library is currently empty. Browse the{" "}
							<Link to="/browse" className="text-arcade-violet hover:underline">
								Arcadaeum
							</Link>{" "}
							to find games to add!
						</h3>
					) : (
						filteredAndSortedLibrary.length === 0 && (
							<h3 className="mt-8 text-center text-2xl font-title text-arcade-white tracking-tighter">
								No games in your library match your search.
							</h3>
						)
					)}
				</div>
			</div>
		</>
	);
}
