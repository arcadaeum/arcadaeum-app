import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import {
	UserCollectionsRow,
	UserProfileHero,
	UserStatsBar,
	UserStickyHeader,
} from "@/components/user";
import { PostCard, PostComposer } from "@/components/posts";
import type { Game } from "@/types/game";
import type { SocialPost } from "@/types/posts";
import type { LibraryEntry, UserCollectionGame, UserProfileWithId } from "@/types/user";
import {
	fetchCollections,
	fetchCollectionGames,
	fetchUserCollectionGames,
	fetchUserCollections,
	mapCollectionGames,
} from "@/utils/collections";
import { fetchUserReviews, getPublicUserLibraryUrl, getUserLibraryUrl } from "@/utils/game";
import { createPost, deletePost, fetchUserPosts, updatePost } from "@/utils/posts";
import { isAdminUser } from "@/utils/admin";
import { getUserDisplayName, getUserProfileBorderColor } from "@/utils/user";

// This page is similar to the UserPage visually but uses the users ID from the URL
// to fetch and display any user's profile, rather than just the current user's profile.
// It also doesn't have edit functionality since you cannot edit other users' profiles.

export default function ProfilePage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const [user, setUser] = useState<UserProfileWithId | null>(null);
	const [currentUser, setCurrentUser] = useState<UserProfileWithId | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [favorites, setFavorites] = useState<UserCollectionGame[]>([]);
	const [wantToPlay, setWantToPlay] = useState<UserCollectionGame[]>([]);
	const [completed, setCompleted] = useState<UserCollectionGame[]>([]);
	const [libraryEntries, setLibraryEntries] = useState<LibraryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [followersCount, setFollowersCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [collectionsCount, setCollectionsCount] = useState(0);
	const [reviewsCount, setReviewsCount] = useState(0);
	const [followerIds, setFollowerIds] = useState<number[]>([]);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	const [posts, setPosts] = useState<SocialPost[]>([]);
	const [postsLoading, setPostsLoading] = useState(false);
	const [postsError, setPostsError] = useState("");
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [showHeader, setShowHeader] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const borderColor = getUserProfileBorderColor(user);
	const displayName = getUserDisplayName(user);
	const isOwnProfile = currentUserId === user?.id;
	const canDeletePosts = isOwnProfile || isAdminUser(currentUser);
	const currentlyPlayingEntry = libraryEntries.find(
		(entry) => entry.status === "currently_playing",
	);

	// Get current user ID
	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (token) {
			fetch(`${apiUrl}/me`, {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((res) => res.json())
				.then((data) => {
					setCurrentUser(data);
					setCurrentUserId(data.id);
				})
				.catch(() => {
					setCurrentUser(null);
					setCurrentUserId(null);
				});
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

	// Get user's collections
	useEffect(() => {
		if (!userId) return;

		const getDefaultCollectionGames = (
			collections: { id: number; name: string }[],
			fetchGames: (collectionId: number) => Promise<Game[]>,
		) => {
			const getGames = (name: string) => {
				const collection = collections.find((c) => c.name === name);
				if (!collection) {
					return Promise.resolve<Game[]>([]);
				}
				return fetchGames(collection.id);
			};

			return Promise.all([
				getGames("Favourites"),
				getGames("Want To Play"),
				getGames("Completed"),
			]);
		};

		if (isOwnProfile) {
			const token = localStorage.getItem("access_token");
			if (!token) return;

			fetchCollections(apiUrl, token)
				.then((collections) => {
					setCollectionsCount(collections.length);
					return getDefaultCollectionGames(collections, (collectionId) =>
						fetchCollectionGames(apiUrl, token, collectionId),
					);
				})
				.then(([favoriteGames, wantToPlayGames, completedGames]) => {
					setFavorites(mapCollectionGames(favoriteGames));
					setWantToPlay(mapCollectionGames(wantToPlayGames));
					setCompleted(mapCollectionGames(completedGames));
				})
				.catch(() => {
					setCollectionsCount(0);
					setFavorites([]);
					setWantToPlay([]);
					setCompleted([]);
				});
			return;
		}

		fetchUserCollections(apiUrl, userId)
			.then((collections) => {
				setCollectionsCount(collections.length);
				return getDefaultCollectionGames(collections, (collectionId) =>
					fetchUserCollectionGames(apiUrl, userId, collectionId),
				);
			})
			.then(([favoriteGames, wantToPlayGames, completedGames]) => {
				setFavorites(mapCollectionGames(favoriteGames));
				setWantToPlay(mapCollectionGames(wantToPlayGames));
				setCompleted(mapCollectionGames(completedGames));
			})
			.catch(() => {
				setCollectionsCount(0);
				setFavorites([]);
				setWantToPlay([]);
				setCompleted([]);
			});
	}, [apiUrl, userId, isOwnProfile]);

	useEffect(() => {
		if (!userId) return;

		if (!isOwnProfile) {
			fetch(getPublicUserLibraryUrl(apiUrl, userId))
				.then((res) => {
					if (!res.ok) throw new Error("Failed to fetch library");
					return res.json();
				})
				.then((data: LibraryEntry[]) => setLibraryEntries(data))
				.catch(() => setLibraryEntries([]));
			return;
		}

		const token = localStorage.getItem("access_token");
		if (!token) return;

		fetch(getUserLibraryUrl(apiUrl), {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch library");
				return res.json();
			})
			.then((data: LibraryEntry[]) => setLibraryEntries(data))
			.catch(() => setLibraryEntries([]));
	}, [apiUrl, isOwnProfile, userId]);

	useEffect(() => {
		if (!userId) return;
		const numericUserId = Number(userId);
		if (!Number.isFinite(numericUserId)) return;

		fetchUserReviews(apiUrl, numericUserId)
			.then((reviews) => setReviewsCount(reviews.length))
			.catch(() => setReviewsCount(0));

		Promise.resolve()
			.then(() => {
				setPostsLoading(true);
				setPostsError("");
				return fetchUserPosts(apiUrl, numericUserId);
			})
			.then(setPosts)
			.catch(() => {
				setPosts([]);
				setPostsError("Failed to load posts.");
			})
			.finally(() => setPostsLoading(false));
	}, [apiUrl, userId]);

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

	const handleCreatePost = async (content: string) => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			throw new Error("You must be logged in to post.");
		}

		const post = await createPost(apiUrl, token, { content });
		setPosts((currentPosts) => [post, ...currentPosts]);
	};

	const handleUpdatePost = async (postId: number, content: string) => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			throw new Error("You must be logged in to edit posts.");
		}

		const post = await updatePost(apiUrl, token, postId, { content });
		setPosts((currentPosts) =>
			currentPosts.map((currentPost) => (currentPost.id === postId ? post : currentPost)),
		);
	};

	const handleDeletePost = async (postId: number) => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			throw new Error("You must be logged in to delete posts.");
		}

		await deletePost(apiUrl, token, postId);
		setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
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
			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16 max-sm:pt-28 max-sm:px-4 max-sm:items-stretch">
				<UserProfileHero
					user={user}
					profileRef={profileRef}
					borderColor={borderColor}
					apiUrl={apiUrl}
					className="user-page__hero"
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
					gamesCount={libraryEntries.length}
					gamesLink={isOwnProfile ? "/library" : `/users/${user.id}/library`}
					collectionsCount={collectionsCount}
					collectionsLink={
						isOwnProfile ? "/collections" : `/users/${user.id}/collections`
					}
					reviewsCount={reviewsCount}
					reviewsLink={isOwnProfile ? "/reviews" : `/users/${user.id}/reviews`}
					disableFollowerLinks={true}
					className="user-page__stats"
				/>

				<h2 className="w-2/3 mt-20 text-4xl ml-50 font-title text-arcade-white tracking-tighter max-sm:mt-10 max-sm:ml-0 max-sm:w-full max-sm:text-2xl">
					<Link to="/user" className="text-arcade-violet hover:underline">
						{getUserDisplayName(user, "User")}
					</Link>{" "}
					is currently playing:
				</h2>
				{currentlyPlayingEntry ? (
					<div className="w-2/3 ml-50 bg-arcade-black rounded-lg mt-6 text-arcade-white text-2xl max-sm:ml-0 max-sm:w-full max-sm:text-lg">
						<Link
							to={`/games/${currentlyPlayingEntry.game_id}`}
							className="flex items-center gap-6 p-6 max-sm:flex-col max-sm:items-start max-sm:gap-4 max-sm:p-4"
						>
							<img
								src={
									currentlyPlayingEntry.cover_url ??
									`https://via.placeholder.com/480x270?text=${encodeURIComponent(
										currentlyPlayingEntry.title,
									)}`
								}
								alt={currentlyPlayingEntry.title}
								className="h-36 w-56 object-cover rounded-md border-2 border-arcade-white/30 max-sm:h-auto max-sm:w-full"
							/>
							<div className="flex flex-col">
								<span className="text-3xl text-arcade-violet max-sm:text-2xl">
									{currentlyPlayingEntry.title}
								</span>
								<span className="text-sm text-arcade-white/70 mt-2">
									View game details
								</span>
							</div>
						</Link>
					</div>
				) : (
					<div className="w-2/3 ml-50 bg-arcade-black rounded-lg mt-6 min-h-56 text-arcade-white text-2xl text-center flex items-center justify-center max-sm:ml-0 max-sm:w-full max-sm:min-h-40 max-sm:px-4 max-sm:text-lg">
						{isOwnProfile
							? "No game selected as currently playing."
							: "Currently playing is not available for this profile."}
					</div>
				)}

				<h3 className="w-2/3 mt-5 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter max-sm:ml-0 max-sm:w-full max-sm:text-xl">
					Favorite Games
				</h3>
				<UserCollectionsRow
					collections={favorites}
					emptyMessage="No games in this collection yet."
					className="user-page__collections-row"
				/>

				<h3 className="w-2/3 mt-5 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-blue tracking-tighter max-sm:ml-0 max-sm:w-full max-sm:text-xl">
					Want to Play
				</h3>
				<UserCollectionsRow
					collections={wantToPlay}
					emptyMessage="No games in this collection yet."
					className="user-page__collections-row"
				/>

				<h3 className="w-2/3 mt-5 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-purple tracking-tighter max-sm:ml-0 max-sm:w-full max-sm:text-xl">
					Completed
				</h3>
				<UserCollectionsRow
					collections={completed}
					emptyMessage="No games in this collection yet."
					className="user-page__collections-row"
				/>

				<h2 className="w-2/3 z-50 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-purple tracking-tighter max-sm:ml-0 max-sm:w-full max-sm:text-xl">
					Posts
				</h2>
				<section className="w-2/3 ml-50 mt-5 mb-20 space-y-4 max-sm:ml-0 max-sm:w-full">
					{isOwnProfile && (
						<div className="flex w-full justify-end">
							<PostComposer onSubmit={handleCreatePost} />
						</div>
					)}
					{postsLoading ? (
						<div className="rounded-lg border border-arcade-white/10 bg-arcade-black/80 p-6 text-center font-secondary text-arcade-white/70">
							Loading posts...
						</div>
					) : postsError ? (
						<div className="rounded-lg border border-red-300/30 bg-arcade-black/80 p-6 text-center font-secondary text-red-300">
							{postsError}
						</div>
					) : posts.length > 0 ? (
						posts.map((post) => (
							<PostCard
								key={post.id}
								post={post}
								apiUrl={apiUrl}
								canEdit={isOwnProfile}
								canDelete={canDeletePosts}
								onUpdate={isOwnProfile ? handleUpdatePost : undefined}
								onDelete={canDeletePosts ? handleDeletePost : undefined}
							/>
						))
					) : (
						<div className="rounded-lg border border-arcade-white/10 bg-arcade-black/80 p-6 text-center font-secondary text-arcade-white/70">
							No posts yet.
						</div>
					)}
				</section>
			</div>
		</>
	);
}
