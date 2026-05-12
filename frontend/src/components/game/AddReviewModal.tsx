import { useEffect, useRef, useState } from "react";
import RatingStarBar from "./RatingStarBar";

const CloseIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

type AddReviewModalProps = {
	gameTitle?: string;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (rating: number, reviewText: string) => Promise<void> | void;
	isSubmitting?: boolean;
	errorMessage?: string | null;
};

export default function AddReviewModal({
	gameTitle,
	isOpen,
	onClose,
	onSubmit,
	isSubmitting = false,
	errorMessage = null,
}: AddReviewModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);
	const [rating, setRating] = useState(5);
	const [reviewText, setReviewText] = useState("");

	const handleClose = () => {
		setRating(5);
		setReviewText("");
		onClose();
	};

	useEffect(() => {
		if (!isOpen) return;

		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleClose();
		};

		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) return;

		const handleClick = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (modalRef.current && target && !modalRef.current.contains(target)) {
				handleClose();
			}
		};

		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm max-sm:items-end max-sm:px-3 max-sm:pb-3">
			<div
				ref={modalRef}
				className="w-full max-w-lg rounded-2xl border border-arcade-white/10 bg-arcade-black/95 p-6 shadow-2xl max-sm:max-h-[90vh] max-sm:overflow-y-auto max-sm:p-4"
			>
				<div className="flex items-start justify-between gap-3">
					<div>
						<h2 className="text-2xl font-title text-arcade-white tracking-tighter max-sm:text-xl">
							Add a review
						</h2>
						{gameTitle ? (
							<p className="mt-1 text-sm text-arcade-white/60">{gameTitle}</p>
						) : null}
					</div>
					<button
						type="button"
						onClick={handleClose}
						className="rounded-full p-2 text-arcade-white/60 hover:bg-arcade-white/10 hover:text-arcade-white"
						aria-label="Close"
					>
						<CloseIcon />
					</button>
				</div>

				<form
					onSubmit={async (event) => {
						event.preventDefault();
						if (isSubmitting) return;
						await onSubmit(rating, reviewText.trim());
					}}
					className="mt-6 space-y-4"
				>
					<label className="block text-sm font-title text-arcade-white/80">
						<div className="flex items-center justify-between">
							<span>Rating</span>
						</div>
						<RatingStarBar
							value={rating}
							onChange={setRating}
							disabled={isSubmitting}
							className="mt-1"
						/>
					</label>

					{errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

					<label className="block text-sm font-title text-arcade-white/80">
						Review
						<textarea
							value={reviewText}
							onChange={(event) => setReviewText(event.target.value)}
							rows={5}
							placeholder="Share your thoughts..."
							className="mt-2 w-full rounded-lg border border-arcade-white/10 bg-arcade-black px-3 py-2 text-arcade-white placeholder:text-arcade-white/40"
						/>
					</label>

					<div className="flex items-center justify-end gap-3 max-sm:flex-col-reverse max-sm:items-stretch">
						<button
							type="button"
							onClick={handleClose}
							disabled={isSubmitting}
							className="rounded-full border border-arcade-white/30 px-4 py-2 text-sm text-arcade-white/80 hover:border-arcade-white hover:text-arcade-white disabled:cursor-not-allowed disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-full bg-arcade-white px-5 py-2 text-sm font-title text-arcade-black transition-transform hover:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isSubmitting ? "Submitting..." : "Submit review"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
