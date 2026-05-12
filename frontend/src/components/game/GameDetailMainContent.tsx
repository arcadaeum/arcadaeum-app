import type { Game } from "@/types/game";
import type { ArcadaeumReview } from "@/types/gameDetail";
import { getReleaseYear } from "@/utils/game/detail";
import { GameDetailReviewsSection } from "@/components/game";

type GameDetailMainContentProps = {
	game: Game | null;
	apiUrl: string;
	gameId: string | number;
	arcadaeumReview?: ArcadaeumReview | null;
	onRequireSignIn: () => void;
};

export default function GameDetailMainContent({
	game,
	apiUrl,
	gameId,
	arcadaeumReview,
	onRequireSignIn,
}: GameDetailMainContentProps) {
	return (
		<div className="flex-col h-full w-full min-w-0">
			<h1 className="text-4xl font-title mt-4 max-sm:mt-0 max-sm:text-3xl max-sm:leading-tight">
				{game?.title}
			</h1>
			<h2 className="text-xl font-default text-gray-300 mt-2 max-sm:text-base">
				<i>
					{game?.developer ?? "Unknown developer"},{" "}
					{getReleaseYear(game?.release_date ?? null)}
				</i>
			</h2>
			<p className="mt-8 text-md font-default text-gray-200 rounded-lg flex-1 overflow-auto max-sm:mt-5 max-sm:text-sm max-sm:leading-6">
				{game?.summary}
			</p>

			<div className="mt-8">
				<h3 className="text-2xl font-title mb-4 max-sm:text-xl">Screenshots</h3>
				<div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 max-sm:-mx-4 max-sm:px-4">
					{game?.screenshots?.map((screenshot: string, index: number) => (
						<img
							key={index}
							src={screenshot}
							alt={`Screenshot ${index + 1}`}
							className="w-64 h-36 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer max-sm:h-32 max-sm:w-56 max-sm:shrink-0"
							onClick={() => {
								window.open(screenshot, "_blank");
							}}
						/>
					))}
				</div>
			</div>
			<GameDetailReviewsSection
				apiUrl={apiUrl}
				gameId={gameId}
				gameTitle={game?.title}
				arcadaeumReview={arcadaeumReview}
				onRequireSignIn={onRequireSignIn}
			/>
		</div>
	);
}
