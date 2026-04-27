import { GameCard } from "@/components/game";
import type { BrowseGamesGridProps } from "@/types/browse";

export default function BrowseGamesGrid({
	visibleGames,
	totalGamesCount,
	hasMoreGames,
	onLoadMore,
	pageSize,
}: BrowseGamesGridProps) {
	return (
		<div className="w-full max-w-7xl mx-auto px-4 py-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
				{visibleGames.map((game) => (
					<GameCard
						key={game.id}
						id={game.id}
						title={game.title}
						image={game.cover_url}
					/>
				))}
			</div>

			{totalGamesCount === 0 && (
				<p className="mt-8 text-center text-sm font-default text-gray-300">
					No games matched your search.
				</p>
			)}

			{hasMoreGames && (
				<div className="mt-8 flex justify-center">
					<button
						onClick={onLoadMore}
						className="bg-arcade-black hover:bg-arcade-blue text-arcade-white font-title py-2 px-6 border-2 border-arcade-white rounded-lg"
					>
						Load {pageSize} More
					</button>
				</div>
			)}
		</div>
	);
}
