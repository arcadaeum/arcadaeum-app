import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import type { Game } from "@/types/game";
import type { SocialLibraryUser } from "@/types/user";
import {
	fetchSocialLibraryUsers,
	formatGenres,
	formatIgdbRating,
	formatPlatforms,
} from "@/utils/game/detail";
import { getUserProfileImageProxyUrl } from "@/utils/user";

type GameDetailSidebarProps = {
	game: Game | null;
	apiUrl: string;
	gameId: string;
};

export default function GameDetailSidebar({ game, apiUrl, gameId }: GameDetailSidebarProps) {
	const [activeTab, setActiveTab] = useState<"stats" | "social">("stats");
	const [socialUsers, setSocialUsers] = useState<SocialLibraryUser[] | null>(null);
	const [socialError, setSocialError] = useState(false);
	const [socialRequiresSignIn, setSocialRequiresSignIn] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			setSocialUsers([]);
			setSocialRequiresSignIn(true);
			return;
		}

		setSocialUsers(null);
		setSocialError(false);
		setSocialRequiresSignIn(false);
		fetchSocialLibraryUsers(apiUrl, token, gameId)
			.then(setSocialUsers)
			.catch(() => {
				setSocialUsers([]);
				setSocialError(true);
			});
	}, [apiUrl, gameId]);

	const getRelationshipLabel = (user: SocialLibraryUser) => {
		if (user.follows_you && user.followed_by_you) return "Mutual";
		if (user.followed_by_you) return "Following";
		return "Follower";
	};

	return (
		<aside className="w-1/3 max-w-xs max-sm:w-full max-sm:max-w-none">
			<div className="bg-arcade-black rounded-lg p-4">
				<div className="flex items-center gap-2 border-b border-arcade-white/10 pb-3 max-sm:w-full">
					<button
						type="button"
						onClick={() => setActiveTab("stats")}
						className={`rounded-full px-3 py-1 text-xs font-title transition-colors max-sm:flex-1 ${
							activeTab === "stats"
								? "bg-arcade-white text-arcade-black"
								: "text-arcade-white/70 hover:text-arcade-white"
						}`}
					>
						Stats
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("social")}
						className={`rounded-full px-3 py-1 text-xs font-title transition-colors max-sm:flex-1 ${
							activeTab === "social"
								? "bg-arcade-white text-arcade-black"
								: "text-arcade-white/70 hover:text-arcade-white"
						}`}
					>
						Social
					</button>
				</div>

				{activeTab === "stats" ? (
					<div className="pt-4">
						<div className="text-sm font-default text-gray-300">IGDB Rating</div>
						<div className="font-title text-arcade-white">
							{formatIgdbRating(game?.igdb_rating ?? null)}
						</div>
						<div className="mt-4 text-sm font-default text-gray-300">Release</div>
						<div className="font-title text-arcade-white">
							{game?.release_date ?? "—"}
						</div>
						<div className="mt-4 text-sm font-default text-gray-300">Genres</div>
						<div className="font-title text-arcade-white">
							{formatGenres(game?.genres ?? null)}
						</div>
						<div className="mt-4 text-sm font-default text-gray-300">Platforms</div>
						<div className="font-title text-arcade-white">
							{formatPlatforms(game?.platforms ?? null)}
						</div>
					</div>
				) : (
					<div className="pt-4">
						<div className="text-sm font-default text-gray-300">
							People with this game
						</div>
						{socialRequiresSignIn ? (
							<div className="mt-3 text-sm font-default text-arcade-white/70">
								Sign in to see followers and following with this game.
							</div>
						) : socialError ? (
							<div className="mt-3 text-sm font-default text-arcade-white/70">
								Unable to load social activity.
							</div>
						) : socialUsers === null ? (
							<div className="mt-3 text-sm font-default text-arcade-white/70">
								Loading...
							</div>
						) : socialUsers.length === 0 ? (
							<div className="mt-3 text-sm font-default text-arcade-white/70">
								No followers or following have this game yet.
							</div>
						) : (
							<ul className="mt-3 flex flex-col gap-2">
								{socialUsers.map((user) => (
									<li key={user.id}>
										<Link
											to={`/users/${user.id}`}
											className="flex items-center gap-3 rounded-lg border border-arcade-white/10 bg-arcade-white/5 p-2 text-sm text-arcade-white transition-colors hover:border-arcade-blue max-sm:gap-2"
										>
											<span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-arcade-blue/30">
												{user.profile_picture ? (
													<img
														src={getUserProfileImageProxyUrl(
															apiUrl,
															user.profile_picture,
														)}
														alt={user.display_name ?? user.username}
														className="h-full w-full object-cover"
													/>
												) : (
													<UserRound className="h-5 w-5 text-arcade-white" />
												)}
											</span>
											<span className="min-w-0 flex-1">
												<span className="block truncate font-title">
													{user.display_name ?? user.username}
												</span>
											</span>
											<span className="shrink-0 rounded-full bg-arcade-black/70 px-2 py-1 text-xs font-default text-arcade-white/70">
												{getRelationshipLabel(user)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>
		</aside>
	);
}
