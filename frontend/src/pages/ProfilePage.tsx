import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import {
	UserCollectionsRow,
	UserProfileHero,
	UserStatsBar,
	UserStickyHeader,
} from "@/components/user";
import type { Game } from "@/types/game";
import type { UserCollectionGame, UserProfileWithId } from "@/types/user";
import { fetchCollections, fetchCollectionGames, mapCollectionGames } from "@/utils/collections";
import { getUserDisplayName, getUserProfileBorderColor } from "@/utils/user";

// This page is similar to the UserPage visually but uses the users ID from the URL
// to fetch and display any user's profile, rather than just the current user's profile.
// It also doesn't have edit functionality since you cannot edit other users' profiles.

export default function ProfilePage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const [user, setUser] = useState<UserProfileWithId | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [favorites, setFavorites] = useState<UserCollectionGame[]>([]);
	const [wantToPlay, setWantToPlay] = useState<UserCollectionGame[]>([]);
	const [completed, setCompleted] = useState<UserCollectionGame[]>([]);
	const [loading, setLoading] = useState(true);
	const [followersCount, setFollowersCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [followerIds, setFollowerIds] = useState<number[]>([]);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [showHeader, setShowHeader] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const borderColor = getUserProfileBorderColor(user);
	const displayName = getUserDisplayName(user);

	const isOwnProfile = currentUserId === user?.id;

	// Get current user ID
	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (token) {
			fetch(`${apiUrl}/me`, {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((res) => res.json())
				.then((data) => setCurrentUserId(data.id))
				.catch(() => setCurrentUserId(null));
		}
	}, [apiUrl]);

	// Fetch user profile
	useEffect(() => {
		if (!userId) return;

		fetch(`${apiUrl}/users/${userId}`)
			.then((res) => {
				if (!res.ok) throw new Error("User not found");
				return res.json();
			})
			.then((data) => setUser(data))
			.catch(() => {
				setError("User not found");
				navigate("/");
			})
			.finally(() => setLoading(false));
	}, [apiUrl, userId, navigate]);

	// Show header when profile section is out of view
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

	// Get user's followers
	useEffect(() => {
		if (!userId) return;

		fetch(`${apiUrl}/users/${userId}/followers`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch followers");
				return res.json();
			})
			.then((data: Array<{ id: number }>) => {
				setFollowersCount(data.length);
				setFollowerIds(data.map((follower) => follower.id));
			})
			.catch(() => {
				setFollowersCount(0);
				setFollowerIds([]);
			});
	}, [apiUrl, userId]);

	// Get user's following
	useEffect(() => {
		if (!userId) return;

		fetch(`${apiUrl}/users/${userId}/following`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch following");
				return res.json();
			})
			.then((data: Array<{ id: number }>) => setFollowingCount(data.length))
			.catch(() => setFollowingCount(0));
	}, [apiUrl, userId]);

	useEffect(() => {
		if (!currentUserId) {
			setIsFollowing(false);
			return;
		}
		setIsFollowing(followerIds.includes(currentUserId));
	}, [currentUserId, followerIds]);

	// Get user's collections (or favorites for other profiles)
	useEffect(() => {
		if (!userId) return;

		if (isOwnProfile) {
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
			return;
		}

		fetch(`${apiUrl}/users/${userId}/favorites`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch favorites");
				return res.json();
			})
			.then((data: UserCollectionGame[]) => {
				setFavorites(data);
				setWantToPlay([]);
				setCompleted([]);
			})
			.catch(() => {
				setFavorites([]);
				setWantToPlay([]);
				setCompleted([]);
			});
	}, [apiUrl, userId, isOwnProfile]);

	const handleEdit = () => {
		setNewDisplayName(user?.display_name || "");
		setEditing(true);
	};

	const handleFollowToggle = async () => {
		if (!userId) return;
		const token = localStorage.getItem("access_token");
		if (!token) {
			navigate("/signin");
			return;
		}

		setFollowLoading(true);
		try {
			const method = isFollowing ? "DELETE" : "POST";
			const res = await fetch(`${apiUrl}/users/${userId}/follow`, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				if (res.status === 409) {
					setIsFollowing(true);
				}
				return;
			}

			setIsFollowing((prev) => !prev);
			setFollowersCount((prev) => {
				const delta = isFollowing ? -1 : 1;
				return Math.max(0, prev + delta);
			});
			if (currentUserId) {
				setFollowerIds((prev) =>
					isFollowing
						? prev.filter((id) => id !== currentUserId)
						: [...prev, currentUserId],
				);
			}
		} finally {
			setFollowLoading(false);
		}
	};

	const handleSave = async () => {
		const token = localStorage.getItem("access_token");
		const res = await fetch(`${apiUrl}/me`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
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
	if (!user) return <div>User not found</div>;

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
					canEdit={isOwnProfile}
					editing={editing}
					newDisplayName={newDisplayName}
					displayName={displayName}
					onDisplayNameChange={setNewDisplayName}
					onEdit={handleEdit}
					onSave={handleSave}
					onCancel={() => setEditing(false)}
					isFollowing={isFollowing}
					followLoading={followLoading}
					onFollowToggle={isOwnProfile ? undefined : handleFollowToggle}
				/>
				<UserStatsBar
					followersCount={followersCount}
					followingCount={followingCount}
					gamesCount={favorites.length}
				/>

				<h2 className="w-2/3 mt-20 text-4xl ml-50 font-title text-arcade-white tracking-tighter">
					<Link to="/user" className="text-arcade-violet hover:underline">
						{getUserDisplayName(user, "User")}
					</Link>{" "}
					is currently playing:
				</h2>
				<div className="w-2/3 ml-50 bg-arcade-black rounded-lg mt-6 min-h-56 text-arcade-white text-2xl text-center flex items-center justify-center">
					ADD CURRENT PLAYED GAME CARD HERE
				</div>

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
			</div>
		</>
	);
}
