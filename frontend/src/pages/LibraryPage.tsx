import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends, PageHeader } from "@/components/ui";
import { BrowseFilters } from "@/components/browse";
import { GameGrid } from "@/components/game";
import type { BrowseSortOption } from "@/types/browse";
import { filterAndSortLibraryEntries, mapLibraryEntriesToGameGridItems } from "@/utils/user";
import type { LibraryEntry, UserProfile } from "@/types/user";
import { BROWSE_SORT_OPTIONS } from "@/utils/browse";
import { getUserLibraryUrl } from "@/utils/game";

export default function LibraryPage() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [library, setLibrary] = useState<LibraryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<BrowseSortOption>("title-asc");
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const filteredAndSortedLibrary = filterAndSortLibraryEntries(library, searchQuery, sortBy);

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
		fetch(getUserLibraryUrl(apiUrl), {
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

				<GameGrid
					games={mapLibraryEntriesToGameGridItems(filteredAndSortedLibrary)}
					emptyMessage="No games in your library match your search."
				/>

				{library.length === 0 && (
					<h3 className="mt-8 text-center text-2xl font-title text-arcade-white tracking-tighter">
						Your library is currently empty. Browse the{" "}
						<Link to="/browse" className="text-arcade-violet hover:underline">
							Arcadaeum
						</Link>{" "}
						to find games to add!
					</h3>
				)}
			</div>
		</>
	);
}
