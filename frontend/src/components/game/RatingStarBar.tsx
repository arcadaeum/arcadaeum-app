import { useState, type CSSProperties } from "react";
import { getRatingColor } from "@/utils/game/stars";

type StarIconProps = {
	className?: string;
	style?: CSSProperties;
};

function StarIcon({ className, style }: StarIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			style={style}
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 2l2.95 6.23 6.87 1-4.98 4.86 1.17 6.91L12 17.9 6 21l1.17-6.91L2.2 9.23l6.86-1L12 2z" />
		</svg>
	);
}

export default function RatingStarBar() {
	const [rating, setRating] = useState<number | null>(null);
	const [hoverRating, setHoverRating] = useState<number | null>(null);
	const displayRating = hoverRating ?? rating ?? 0;
	const ratingColor = getRatingColor(displayRating);

	return (
		<div className="mt-3">
			<div className="mt-2 flex items-center justify-center gap-2">
				<div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)}>
					{Array.from({ length: 5 }, (_, index) => {
						const starValue = index + 1;
						const fillAmount = Math.min(Math.max(displayRating - index, 0), 1);
						const fillPercent = fillAmount * 100;
						const leftValue = starValue - 0.5;
						const rightValue = starValue;

						return (
							<div key={starValue} className="relative h-7 w-7">
								<StarIcon className="absolute inset-0 h-full w-full text-arcade-white/30" />
								<div
									className="absolute inset-0"
									style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
								>
									<StarIcon
										className="absolute inset-0 h-full w-full"
										style={{ color: ratingColor }}
									/>
								</div>
								<button
									type="button"
									className="absolute inset-y-0 left-0 w-[60%] cursor-pointer"
									aria-label={`Rate ${leftValue} stars`}
									onMouseEnter={() => setHoverRating(leftValue)}
									onFocus={() => setHoverRating(leftValue)}
									onClick={() => setRating(leftValue)}
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 w-[40%] cursor-pointer"
									aria-label={`Rate ${rightValue} stars`}
									onMouseEnter={() => setHoverRating(rightValue)}
									onFocus={() => setHoverRating(rightValue)}
									onClick={() => setRating(rightValue)}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
