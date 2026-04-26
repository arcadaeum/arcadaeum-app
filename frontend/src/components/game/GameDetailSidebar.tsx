import type { Game } from "@/types/game";
import { formatIgdbRating, formatPlatforms } from "@/utils/game";

type GameDetailSidebarProps = {
	game: Game | null;
};

export default function GameDetailSidebar({ game }: GameDetailSidebarProps) {
	return (
		<aside className="w-1/3 max-w-xs">
			<div className="bg-arcade-black rounded-lg p-4">
				<div className="text-sm font-default text-gray-300">IGDB Rating</div>
				<div className="font-title text-arcade-white">
					{formatIgdbRating(game?.igdb_rating ?? null)}
				</div>
				<div className="mt-4 text-sm font-default text-gray-300">Release</div>
				<div className="font-title text-arcade-white">{game?.release_date ?? "—"}</div>
				<div className="mt-4 text-sm font-default text-gray-300">Platforms</div>
				<div className="font-title text-arcade-white">
					{formatPlatforms(game?.platforms ?? null)}
				</div>
			</div>
		</aside>
	);
}
