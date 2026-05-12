import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NavigationBar, ColorBends, PageHeader } from "@/components/ui";
import { BrowseFilters } from "@/components/browse";
import { GameGrid } from "@/components/game";
import type { BrowseSortOption } from "@/types/browse";
import {
	filterAndSortLibraryEntries,
	getLibraryFilterOptions,
	mapLibraryEntriesToGameGridItems,
} from "@/utils/user";
import type { LibraryEntry, UserProfile } from "@/types/user";
import { BROWSE_SORT_OPTIONS } from "@/utils/browse";
import { getPublicUserLibraryUrl, getUserLibraryUrl } from "@/utils/game/detail";
import { getUserDisplayName } from "@/utils/user";

export default function LibraryPage() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [library, setLibrary] = useState<LibraryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("");
	const [selectedPlatform, setSelectedPlatform] = useState("");
	const [sortBy, setSortBy] = useState<BrowseSortOption>("title-asc");
	const navigate = useNavigate();
	const { userId } = useParams<{ userId: string }>();
	const apiUrl = import.meta.env.VITE_API_URL as string;
	const isPublicView = Boolean(userId);

	const filteredAndSortedLibrary = filterAndSortLibraryEntries(
		library,
		searchQuery,
		sortBy,
		selectedGenre,
		selectedPlatform,
	);
	const genreOptions = useMemo(() => getLibraryFilterOptions(library, "genres"), [library]);
	const platformOptions = useMemo(() => getLibraryFilterOptions(library, "platforms"), [library]);
	const displayName = getUserDisplayName(user, "User");
	const libraryOwnerLabel = isPublicView ? `${displayName}'s` : "Your";
	const emptySearchMessage = `No games in ${libraryOwnerLabel.toLowerCase()} library match your search.`;

	useEffect(() => {
		if (isPublicView) {
			if (!userId) return;
			fetch(`${apiUrl}/users/${userId}`)
				.then((res) => {
					if (!res.ok) throw new Error("User not found");
					return res.json();
				})
				.then((data) => setUser(data))
				.catch(() => {
					setError("User not found.");
				})
				.finally(() => setLoading(false));
			return;
		}

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
	}, [apiUrl, isPublicView, navigate, userId]);

	// Fetch user's library from API
	useEffect(() => {
		if (!user) return; // Wait for user to be authenticated

		if (isPublicView) {
			if (!userId) return;
			fetch(getPublicUserLibraryUrl(apiUrl, userId))
				.then((res) => {
					if (!res.ok) throw new Error("Failed to fetch library");
					return res.json();
				})
				.then((data: LibraryEntry[]) => setLibrary(data))
				.catch(() => setLibrary([]));
			return;
		}

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
	}, [apiUrl, isPublicView, user, userId]);

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
			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16 max-sm:pt-28 max-sm:px-4 max-sm:items-stretch">
				<PageHeader
					title={`${libraryOwnerLabel} Library.`}
					subtitle={
						isPublicView
							? `Games in ${displayName}'s library.`
							: "The home of all your games."
					}
				/>

				{library.length > 0 && (
					<>
						<BrowseFilters
							searchQuery={searchQuery}
							selectedGenre={selectedGenre}
							selectedPlatform={selectedPlatform}
							sortBy={sortBy}
							genreOptions={genreOptions}
							platformOptions={platformOptions}
							sortOptions={BROWSE_SORT_OPTIONS}
							onSearchChange={setSearchQuery}
							onGenreChange={setSelectedGenre}
							onPlatformChange={setSelectedPlatform}
							onSortChange={setSortBy}
						/>

						<GameGrid
							games={mapLibraryEntriesToGameGridItems(filteredAndSortedLibrary)}
							emptyMessage={emptySearchMessage}
						/>
					</>
				)}

				{library.length === 0 && (
					<h3 className="mx-auto mt-8 text-center text-2xl font-title text-arcade-white tracking-tighter max-sm:text-xl max-sm:leading-7">
						{isPublicView ? (
							`${displayName}'s library is currently empty.`
						) : (
							<>
								Your library is currently empty. Browse the{" "}
								<Link to="/browse" className="text-arcade-violet hover:underline">
									Arcadaeum
								</Link>{" "}
								to find games to add!
							</>
						)}
					</h3>
				)}
			</div>
		</>
	);
}
