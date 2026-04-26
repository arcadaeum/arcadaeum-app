import type { Game } from "@/types/game";
import { getReleaseYear } from "@/utils/game";
import { GameDetailReviewsSection } from "@/components/game";

type GameDetailMainContentProps = {
	game: Game | null;
	onAddReview: () => void;
};

export default function GameDetailMainContent({ game, onAddReview }: GameDetailMainContentProps) {
	return (
		<div className="flex-col h-full w-full">
			<h1 className="text-4xl font-title mt-4">{game?.title}</h1>
			<h2 className="text-xl font-default text-gray-300 mt-2">
				<i>
					{game?.developer ?? "Unknown developer"},{" "}
					{getReleaseYear(game?.release_date ?? null)}
				</i>
			</h2>
			<p className="mt-8 text-md font-default text-gray-200rounded-lg  flex-1 overflow-auto">
				{game?.summary}
			</p>
			<div className="flex-col mt-16 h-full w-full ">
				<p>Additional content can go here, such as screenshots, videos, reviews, etc.</p>
			</div>

			{/* Example of how to use screenshots for Fred, obviously change this and make it look better,
				maybe try and do the blured screenshot background thing you were thinking of trying */}
			<div className="mt-8">
				<h3 className="text-2xl font-title mb-4">Screenshots</h3>
				<div className="flex gap-4 overflow-x-auto">
					{game?.screenshots?.map((screenshot, index) => (
						<img
							key={index}
							src={screenshot}
							alt={`Screenshot ${index + 1}`}
							className="w-64 h-36 object-cover rounded-lg"
						/>
					))}
				</div>
			</div>
			<GameDetailReviewsSection onAddReview={onAddReview} />
		</div>
	);
}
