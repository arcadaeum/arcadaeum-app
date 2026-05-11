import type { ArcadaeumReview } from "@/types/gameDetail";
import { getRatingColor } from "@/utils/game/stars";
import RatingStarBar from "./RatingStarBar";

type ArcadaeumRatingProps = {
	arcadaeumReview: ArcadaeumReview | null;
};

export default function ArcadaeumRating({ arcadaeumReview }: ArcadaeumRatingProps) {
	if (!arcadaeumReview || arcadaeumReview.total_reviews === 0) {
		return (
			<div className="flex flex-col gap-2 bg-arcade-black/60 rounded-lg p-4 mb-4">
				<h3 className="text-lg font-title">Arcadaeum Rating</h3>
				<p className="text-sm text-arcade-white/70">No reviews yet</p>
			</div>
		);
	}

	const displayStars = arcadaeumReview.average_rating / 2;
	const ratingColor = getRatingColor(displayStars);

	return (
		<div className="flex flex-col gap-3 bg-arcade-black/60 rounded-lg p-4 mb-4">
			<h3 className="text-lg font-title">Arcadaeum Rating</h3>
			<div className="flex items-center gap-4">
				<div className="flex flex-col gap-1">
					<div className="text-3xl font-title" style={{ color: ratingColor }}>
						{arcadaeumReview.average_rating.toFixed(1)}
					</div>
					<p className="text-xs text-arcade-white/60">
						Based on {arcadaeumReview.total_reviews} review
						{arcadaeumReview.total_reviews !== 1 ? "s" : ""}
					</p>
				</div>
				<div className="flex-1">
					<RatingStarBar
						value={arcadaeumReview.average_rating}
						disabled
						className="mt-0"
					/>
				</div>
			</div>
		</div>
	);
}
