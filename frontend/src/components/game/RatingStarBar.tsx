import { useState, type CSSProperties } from "react";
import { getRatingColor } from "@/utils/game/stars";

type StarIconProps = {
	className?: string;
	style?: CSSProperties;
};

type RatingStarBarProps = {
	value?: number;
	onChange?: (value: number) => void;
	disabled?: boolean;
	className?: string;
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

export default function RatingStarBar({
	value,
	onChange,
	disabled = false,
	className,
}: RatingStarBarProps) {
	const [internalRating, setInternalRating] = useState<number | null>(null);
	const [hoverRating, setHoverRating] = useState<number | null>(null);
	const effectiveRating = value ?? internalRating ?? 0;
	const displayRating = hoverRating ?? effectiveRating;
	const displayStars = displayRating / 2;
	const ratingColor = getRatingColor(displayStars);

	const handleSelect = (nextValue: number) => {
		if (disabled) return;
		if (onChange) {
			onChange(nextValue);
			return;
		}
		setInternalRating(nextValue);
	};

	return (
		<div className={className ?? "mt-3"}>
			<div className="mt-2 flex items-center justify-center gap-2">
				<div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)}>
					{Array.from({ length: 5 }, (_, index) => {
						const starValue = index + 1;
						const fillAmount = Math.min(Math.max(displayStars - index, 0), 1);
						const fillPercent = fillAmount * 100;
						const leftValue = starValue - 0.5;
						const rightValue = starValue;
						const leftRating = leftValue * 2;
						const rightRating = rightValue * 2;

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
									disabled={disabled}
									className="absolute inset-y-0 left-0 w-[60%] cursor-pointer disabled:cursor-not-allowed"
									aria-label={`Rate ${leftRating} out of 10`}
									onMouseEnter={() => {
										if (!disabled) setHoverRating(leftRating);
									}}
									onFocus={() => {
										if (!disabled) setHoverRating(leftRating);
									}}
									onClick={() => handleSelect(leftRating)}
								/>
								<button
									type="button"
									disabled={disabled}
									className="absolute inset-y-0 right-0 w-[40%] cursor-pointer disabled:cursor-not-allowed"
									aria-label={`Rate ${rightRating} out of 10`}
									onMouseEnter={() => {
										if (!disabled) setHoverRating(rightRating);
									}}
									onFocus={() => {
										if (!disabled) setHoverRating(rightRating);
									}}
									onClick={() => handleSelect(rightRating)}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
