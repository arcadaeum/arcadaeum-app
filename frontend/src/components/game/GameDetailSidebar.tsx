import { useState } from "react";
import type { Game } from "@/types/game";
import { formatIgdbRating, formatPlatforms } from "@/utils/game";

type GameDetailSidebarProps = {
	game: Game | null;
};

export default function GameDetailSidebar({ game }: GameDetailSidebarProps) {
	const [activeTab, setActiveTab] = useState<"stats" | "friends">("stats");

	return (
		<aside className="w-1/3 max-w-xs">
			<div className="bg-arcade-black rounded-lg p-4">
				<div className="flex items-center gap-2 border-b border-arcade-white/10 pb-3">
					<button
						type="button"
						onClick={() => setActiveTab("stats")}
						className={`rounded-full px-3 py-1 text-xs font-title transition-colors ${
							activeTab === "stats"
								? "bg-arcade-white text-arcade-black"
								: "text-arcade-white/70 hover:text-arcade-white"
						}`}
					>
						Stats
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("friends")}
						className={`rounded-full px-3 py-1 text-xs font-title transition-colors ${
							activeTab === "friends"
								? "bg-arcade-white text-arcade-black"
								: "text-arcade-white/70 hover:text-arcade-white"
						}`}
					>
						Friends
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
						<div className="mt-4 text-sm font-default text-gray-300">Platforms</div>
						<div className="font-title text-arcade-white">
							{formatPlatforms(game?.platforms ?? null)}
						</div>
					</div>
				) : (
					<div className="pt-4">
						<div className="text-sm font-default text-gray-300">Friends who play</div>
						<div className="mt-2 flex flex-col gap-2">
							<div className="flex items-center gap-3 text-sm text-arcade-white">
								<span className="grid h-8 w-8 place-items-center rounded-full bg-arcade-blue/30 text-xs font-title text-arcade-white">
									NP
								</span>
								<span>NeoPixel42</span>
							</div>
							<div className="flex items-center gap-3 text-sm text-arcade-white">
								<span className="grid h-8 w-8 place-items-center rounded-full bg-arcade-violet/30 text-xs font-title text-arcade-white">
									AM
								</span>
								<span>ArcadeMoth</span>
							</div>
							<div className="flex items-center gap-3 text-sm text-arcade-white">
								<span className="grid h-8 w-8 place-items-center rounded-full bg-arcade-purple/30 text-xs font-title text-arcade-white">
									SB
								</span>
								<span>Starbit88</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
