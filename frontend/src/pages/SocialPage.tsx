import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends, PageHeader } from "@/components/ui";
import { UserRound } from "lucide-react";
import type { UserSummary } from "@/types/user";
import { getUserProfileImageProxyUrl } from "@/utils/user";

export default function SocialPage() {
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [followers, setFollowers] = useState<UserSummary[] | null>(null);
	const [following, setFollowing] = useState<UserSummary[] | null>(null);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;

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
			.then((data) => setCurrentUserId(data.id))
			.catch(() => {
				setError("You must be logged in.");
				localStorage.removeItem("access_token");
				navigate("/signin");
			});
	}, [apiUrl, navigate]);

	useEffect(() => {
		if (!currentUserId) return;

		Promise.all([
			fetch(`${apiUrl}/users/${currentUserId}/followers`).then((res) => {
				if (!res.ok) throw new Error("Failed to fetch followers");
				return res.json();
			}),
			fetch(`${apiUrl}/users/${currentUserId}/following`).then((res) => {
				if (!res.ok) throw new Error("Failed to fetch following");
				return res.json();
			}),
		])
			.then(([followersData, followingData]) => {
				setFollowers(followersData);
				setFollowing(followingData);
			})
			.catch(() => setError("Failed to load followers."));
	}, [apiUrl, currentUserId]);

	const followerCount = followers?.length ?? 0;
	const followingCount = following?.length ?? 0;

	const emptyFollowersMessage = useMemo(() => {
		if (!followers) return "Loading followers...";
		return "No followers yet.";
	}, [followers]);

	const emptyFollowingMessage = useMemo(() => {
		if (!following) return "Loading following...";
		return "Not following anyone yet.";
	}, [following]);

	const renderUserList = (users: UserSummary[] | null, emptyMessage: string) => {
		if (!users || !users.length) {
			return (
				<div className="text-arcade-white/70 text-sm font-default py-6 max-sm:py-4">
					{emptyMessage}
				</div>
			);
		}

		return (
			<ul className="space-y-3 max-sm:space-y-2">
				{users.map((user) => (
					<li key={user.id}>
						<Link
							to={`/users/${user.id}`}
							className="flex items-center gap-4 bg-arcade-black/60 border border-arcade-white/10 rounded-xl px-4 py-3 hover:border-arcade-blue transition-colors max-sm:gap-3 max-sm:px-3 max-sm:py-3"
						>
							<div className="w-12 h-12 rounded-full bg-arcade-black flex shrink-0 items-center justify-center overflow-hidden max-sm:h-10 max-sm:w-10">
								{user.profile_picture ? (
									<img
										src={getUserProfileImageProxyUrl(
											apiUrl,
											user.profile_picture,
										)}
										alt={user.display_name ?? user.username}
										className="w-full h-full object-cover"
									/>
								) : (
									<UserRound className="text-arcade-white w-6 h-6 max-sm:h-5 max-sm:w-5" />
								)}
							</div>
							<div className="min-w-0">
								<p className="truncate text-arcade-white font-title text-lg max-sm:text-base">
									{user.display_name ?? user.username}
								</p>
								<p className="truncate text-arcade-white/60 text-sm font-default max-sm:text-xs">
									@{user.username}
								</p>
							</div>
						</Link>
					</li>
				))}
			</ul>
		);
	};

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
				<PageHeader title="Social" subtitle="See who follows you and who you follow." />

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full mt-10 max-sm:mt-8 max-sm:gap-8">
					<section>
						<h2 className="text-2xl font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter pb-2 max-sm:text-xl">
							Followers ({followerCount})
						</h2>
						{renderUserList(followers, emptyFollowersMessage)}
					</section>
					<section>
						<h2 className="text-2xl font-title text-arcade-white border-b-4 border-arcade-blue tracking-tighter pb-2 max-sm:text-xl">
							Following ({followingCount})
						</h2>
						{renderUserList(following, emptyFollowingMessage)}
					</section>
				</div>
			</div>
		</>
	);
}
