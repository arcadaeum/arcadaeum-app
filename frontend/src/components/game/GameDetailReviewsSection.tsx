import { PLACEHOLDER_REVIEWS } from "@/utils/game";

type GameDetailReviewsSectionProps = {
	onAddReview: () => void;
};

export default function GameDetailReviewsSection({ onAddReview }: GameDetailReviewsSectionProps) {
	return (
		<div className="flex flex-col gap-4 mt-8 bg-arcade-black rounded-lg p-4">
			<h2 className="text-2xl font-title">Reviews</h2>
			<div className="flex justify-start">
				<button
					onClick={onAddReview}
					className="text-arcade-white border border-arcade-white rounded px-4 py-2 hover:bg-arcade-white hover:text-arcade-black transition-colors duration-200"
				>
					Add Review
				</button>
			</div>
			<div className="grid gap-4 mt-2">
				{PLACEHOLDER_REVIEWS.map((review) => (
					<div
						key={`${review.author}-${review.date}`}
						className="bg-arcade-black/60 rounded-lg p-3"
					>
						<div className="text-sm font-default text-gray-300">
							{review.author} · {review.date}
						</div>
						<div className="mt-2 text-md font-default text-gray-200">{review.content}</div>
					</div>
				))}
			</div>
		</div>
	);
}
