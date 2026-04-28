import { GameCard } from "@/components/game";
import type { Game } from "@/types/game";

type GameGridProps = {
	games: Pick<Game, "id" | "title" | "cover_url">[];
	emptyMessage?: string;
};

export default function GameGrid({ games, emptyMessage }: GameGridProps) {
	return (
		<div className="w-full max-w-7xl mx-auto px-4 py-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
				{games.map((game) => (
					<GameCard key={game.id} id={game.id} title={game.title} image={game.cover_url} />
				))}
			</div>

			{games.length === 0 && emptyMessage && (
				<p className="mt-8 text-center text-sm font-default text-gray-300">{emptyMessage}</p>
			)}
		</div>
	);
}
