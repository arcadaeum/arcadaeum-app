import { useEffect, useState } from "react";
import { GameCard } from "@/components/game";
import { PostCard } from "@/components/posts";
import type { Game } from "@/types/game";
import type { SocialPost } from "@/types/posts";
import type { UserProfileWithId } from "@/types/user";
import { deletePost, fetchFollowingPosts } from "@/utils/posts";
import { isAdminUser } from "@/utils/admin";
import { getUserDisplayName } from "@/utils/user";

type NewsItem = {
	title?: string;
	url?: string;
	source?: string;
};

export default function HomeAuthenticatedContent() {
	const [displayName, setDisplayName] = useState<string | null>(null);
	const [currentUser, setCurrentUser] = useState<UserProfileWithId | null>(null);
	const [news, setNews] = useState<NewsItem[]>([]);
	const [gameOfTheDay, setGameOfTheDay] = useState<Game | null>(null);
	const [gameOfTheDayLoading, setGameOfTheDayLoading] = useState(false);
	const [feedPosts, setFeedPosts] = useState<SocialPost[]>([]);
	const [feedLoading, setFeedLoading] = useState(false);
	const [feedError, setFeedError] = useState("");
	const apiUrl = import.meta.env.VITE_API_URL as string;

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) return;

		fetch(`${apiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } })
			.then((res) => {
				if (!res.ok) return null;
				return res.json();
			})
			.then((data) => {
				if (!data) return;
				setCurrentUser(data);
				setDisplayName(getUserDisplayName(data, "Player"));
			})
			.catch(() => {
				setCurrentUser(null);
				/* ignore */
			});
	}, [apiUrl]);

	useEffect(() => {
		const params = new URLSearchParams({
			query: '"video game"',
			language: "en",
			country: "us",
			limit: "5",
		});

		fetch(`${apiUrl}/news/search?${params.toString()}`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch news");
				return res.json();
			})
			.then((data) => {
				setNews(data);
			})
			.catch(() => setNews([]));
	}, [apiUrl]);

	useEffect(() => {
		Promise.resolve()
			.then(() => {
				setGameOfTheDayLoading(true);
				return fetch(`${apiUrl}/games/game-of-the-day`);
			})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch game of the day");
				return res.json();
			})
			.then((data: Game) => setGameOfTheDay(data))
			.catch(() => setGameOfTheDay(null))
			.finally(() => setGameOfTheDayLoading(false));
	}, [apiUrl]);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) return;

		Promise.resolve()
			.then(() => {
				setFeedLoading(true);
				setFeedError("");
				return fetchFollowingPosts(apiUrl, token, 3);
			})
			.then(setFeedPosts)
			.catch(() => {
				setFeedPosts([]);
				setFeedError("Unable to load social posts.");
			})
			.finally(() => setFeedLoading(false));
	}, [apiUrl]);

	const nameToShow = displayName ?? localStorage.getItem("username") ?? "Player";
	const handleDeletePost = async (postId: number) => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			throw new Error("You must be logged in to delete posts.");
		}

		await deletePost(apiUrl, token, postId);
		setFeedPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
	};

	return (
		<div className="relative w-full min-h-screen px-4 pb-16">
			<section className="w-full max-w-6xl mx-auto pt-28">
				<div className="relative overflow-hidden rounded-3xl border border-arcade-white/10 bg-arcade-black/60 shadow-[0_0_40px_rgba(86,71,241,0.25)]">
					<div className="absolute inset-0">
						<div
							className="h-full w-full bg-center bg-cover opacity-80"
							style={{
								backgroundImage:
									"url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1800&q=80')",
							}}
						/>
						<div className="absolute inset-0 bg-linear-to-b from-transparent via-arcade-black/40 to-arcade-black" />
						<div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-arcade-violet/40 via-arcade-blue/20 to-transparent" />
					</div>
					<div className="relative z-10 px-6 py-16 sm:px-10 md:px-14 md:py-24">
						<p className="font-title text-arcade-white/90 text-lg sm:text-xl">
							Welcome back, {nameToShow}!
						</p>
						<h1 className="mt-3 font-title tracking-tighter text-arcade-white text-4xl sm:text-5xl md:text-6xl drop-shadow-[0_0_6px_rgba(254,253,220,0.35)]">
							Discover your next adventure
						</h1>
						<p className="mt-4 max-w-2xl text-arcade-white/70 text-base sm:text-lg">
							Curated picks, fresh updates, and a spotlight on what you love most.
						</p>
					</div>
				</div>
			</section>

			<section className="w-full max-w-6xl mx-auto mt-10 grid gap-6 md:grid-cols-3">
				<div className="min-h-48 rounded-2xl border border-arcade-white/10 bg-arcade-black/80 p-6">
					<h2 className="font-title text-arcade-white text-2xl">News Feed</h2>
					<div className="mt-4 space-y-3">
						{news.slice(0, 3).map((item, index) => (
							<a
								key={`${item.title ?? "news"}-${index}`}
								href={item.url}
								target="_blank"
								rel="noreferrer"
								className="block rounded-lg border border-arcade-white/10 bg-arcade-white/5 p-3 font-secondary text-sm text-arcade-white/75 transition hover:border-arcade-blue/60 hover:text-arcade-white"
							>
								<span className="block">{item.title ?? "Gaming news update"}</span>
								{item.source && (
									<span className="mt-1 block text-xs text-arcade-white/45">
										{item.source}
									</span>
								)}
							</a>
						))}
						{news.length === 0 && (
							<p className="font-secondary text-sm text-arcade-white/60">
								Latest headlines and updates go here.
							</p>
						)}
					</div>
				</div>
				<div className="min-h-48 rounded-2xl border border-arcade-white/10 bg-arcade-black/80 p-6">
					<h2 className="font-title text-arcade-white text-2xl">Social Spotlight</h2>
					<div className="mt-4 space-y-3">
						{feedLoading ? (
							<p className="font-secondary text-sm text-arcade-white/60">
								Loading friend posts...
							</p>
						) : feedError ? (
							<p className="font-secondary text-sm text-red-300">{feedError}</p>
						) : feedPosts.length > 0 ? (
							feedPosts.map((post) => (
								<PostCard
									key={post.id}
									post={post}
									apiUrl={apiUrl}
									compact
									profilePath={`/users/${post.user_id}`}
									canDelete={isAdminUser(currentUser)}
									onDelete={
										isAdminUser(currentUser) ? handleDeletePost : undefined
									}
								/>
							))
						) : (
							<p className="font-secondary text-sm text-arcade-white/60">
								Follow other players to see their posts here.
							</p>
						)}
					</div>
				</div>
				<div className="min-h-48 rounded-2xl border border-arcade-white/10 bg-arcade-black/80 p-6">
					<h2 className="font-title text-arcade-white text-2xl">Game of the Day</h2>
					<div className="mt-4">
						{gameOfTheDayLoading ? (
							<p className="font-secondary text-sm text-arcade-white/60">
								Choosing today's game...
							</p>
						) : gameOfTheDay ? (
							<GameCard
								id={gameOfTheDay.id}
								title={gameOfTheDay.title}
								image={gameOfTheDay.cover_url}
							/>
						) : (
							<p className="font-secondary text-sm text-arcade-white/60">
								Add games to Arcadaeum to spotlight one here.
							</p>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
