import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import {
	UserCollectionsRow,
	UserProfileHero,
	UserStatsBar,
	UserStickyHeader,
} from "@/components/user";
import type { Game } from "@/types/game";
import type { LibraryEntry, UserCollectionGame, UserProfile } from "@/types/user";
import { getUserDisplayName, getUserProfileBorderColor } from "@/utils/user";
import { getUserLibraryUrl } from "@/utils/game/detail";
import { fetchCollections, fetchCollectionGames, mapCollectionGames } from "@/utils/collections";

export default function UserPage() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [favorites, setFavorites] = useState<UserCollectionGame[]>([]);
	const [wantToPlay, setWantToPlay] = useState<UserCollectionGame[]>([]);
	const [completed, setCompleted] = useState<UserCollectionGame[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [followersCount, setFollowersCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [libraryEntries, setLibraryEntries] = useState<LibraryEntry[]>([]);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [showHeader, setShowHeader] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const displayName = getUserDisplayName(user);
	const borderColor = getUserProfileBorderColor(user);
	const currentlyPlayingEntry = libraryEntries.find(
		(entry) => entry.status === "currently_playing",
	);
	const currentlyPlayingArtwork =
		currentlyPlayingEntry?.artworks?.[0] ?? currentlyPlayingEntry?.cover_url ?? null;

	useEffect(() => {
		const storedToken = localStorage.getItem("access_token");
		if (!storedToken) {
			navigate("/signin");
			return;
		}
		fetch(`${apiUrl}/me`, {
			headers: { Authorization: `Bearer ${storedToken}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Unauthorized");
				return res.json();
			})
			.then((data) => {
				setUser(data);
				setCurrentUserId(data.id);
			})
			.catch(() => {
				setError("You must be logged in.");
				localStorage.removeItem("access_token");
				navigate("/signin");
			})
			.finally(() => setLoading(false));
	}, [apiUrl, navigate]);

	// Intersection observer to show header when profile section is scrolled out of view.
	useEffect(() => {
		const el = profileRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => setShowHeader(!entry.isIntersecting),
			{ rootMargin: "-200px 0px 0px 0px", threshold: 0 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [loading]);

	// Fetch real favourites, want to play, and completed collections
	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) return;

		fetchCollections(apiUrl, token)
			.then((collections) => {
				const getGames = (name: string) => {
					const collection = collections.find((c) => c.name === name);
					if (!collection) {
						return Promise.resolve<Game[]>([]);
					}
					return fetchCollectionGames(apiUrl, token, collection.id);
				};

				return Promise.all([
					getGames("Favourites"),
					getGames("Want To Play"),
					getGames("Completed"),
				]);
			})
			.then(([favoriteGames, wantToPlayGames, completedGames]) => {
				setFavorites(mapCollectionGames(favoriteGames));
				setWantToPlay(mapCollectionGames(wantToPlayGames));
				setCompleted(mapCollectionGames(completedGames));
			})
			.catch(() => {
				setFavorites([]);
				setWantToPlay([]);
				setCompleted([]);
			});
	}, [apiUrl]);

	useEffect(() => {
		if (!currentUserId) return;

		fetch(`${apiUrl}/users/${currentUserId}/followers`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch followers");
				return res.json();
			})
			.then((data: Array<{ id: number }>) => setFollowersCount(data.length))
			.catch(() => setFollowersCount(0));

		fetch(`${apiUrl}/users/${currentUserId}/following`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch following");
				return res.json();
			})
			.then((data: Array<{ id: number }>) => setFollowingCount(data.length))
			.catch(() => setFollowingCount(0));

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
			.then((data: LibraryEntry[]) => setLibraryEntries(data))
			.catch(() => setLibraryEntries([]));
	}, [apiUrl, currentUserId]);

	const handleEdit = () => {
		setNewDisplayName(user?.display_name || "");
		setEditing(true);
	};

	const handleSave = async () => {
		const storedToken = localStorage.getItem("access_token");
		const res = await fetch(`${apiUrl}/me`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${storedToken}`,
			},
			body: JSON.stringify({ display_name: newDisplayName }),
		});
		if (res.ok) {
			const updated = await res.json();
			setUser(updated);
			setEditing(false);
		} else {
			setError("Failed to update display name.");
		}
	};

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
			{showHeader && <UserStickyHeader displayName={displayName} />}
			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16">
				<UserProfileHero
					user={user}
					profileRef={profileRef}
					borderColor={borderColor}
					apiUrl={apiUrl}
					editing={editing}
					newDisplayName={newDisplayName}
					displayName={displayName}
					onDisplayNameChange={setNewDisplayName}
					onEdit={handleEdit}
					onSave={handleSave}
					onCancel={() => setEditing(false)}
				/>
				<UserStatsBar
					followersCount={followersCount}
					followingCount={followingCount}
					gamesCount={libraryEntries.length}
				/>
				<h2 className="w-2/3 mt-20 text-4xl ml-50 font-title text-arcade-white tracking-tighter">
					<Link to="/user" className="text-arcade-violet hover:underline">
						{getUserDisplayName(user, "User")}
					</Link>{" "}
					is currently playing:
				</h2>
				{currentlyPlayingEntry ? (
					<div className="w-2/3 ml-50 mt-6 text-arcade-white">
						<Link to={`/games/${currentlyPlayingEntry.game_id}`} className="block">
							<div className="w-full bg-arcade-black rounded-lg overflow-hidden border-2 border-arcade-white/20">
								<img
									src={
										currentlyPlayingArtwork ??
										`https://via.placeholder.com/960x540?text=${encodeURIComponent(
											currentlyPlayingEntry.title,
										)}`
									}
									alt={currentlyPlayingEntry.title}
									className="w-full h-auto object-contain bg-arcade-black"
								/>
							</div>
							<div className="mt-4 text-3xl text-arcade-violet">
								{currentlyPlayingEntry.title}
							</div>
						</Link>
					</div>
				) : (
					<div className="w-2/3 ml-50 bg-arcade-black rounded-lg mt-6 min-h-56 text-arcade-white text-2xl text-center flex items-center justify-center">
						No game selected as currently playing.
					</div>
				)}

				<h3 className="w-2/3 mt-5 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter">
					Favorite Games
				</h3>
				<UserCollectionsRow
					collections={favorites}
					emptyMessage="No games in this collection yet."
				/>

				<h3 className="w-2/3 mt-5 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-blue tracking-tighter">
					Want to Play
				</h3>
				<UserCollectionsRow
					collections={wantToPlay}
					emptyMessage="No games in this collection yet."
				/>

				<h3 className="w-2/3 mt-5 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-purple tracking-tighter">
					Completed
				</h3>
				<UserCollectionsRow
					collections={completed}
					emptyMessage="No games in this collection yet."
				/>

				<h2 className="w-2/3 z-50 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-purple tracking-tighter">
					Posts
				</h2>
			</div>
		</>
	);
}
