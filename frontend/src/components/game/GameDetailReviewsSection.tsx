import { useEffect, useState } from "react";

import type { ArcadaeumReview, GameReview } from "@/types/gameDetail";
import { createGameReview, deleteUserReview, fetchGameReviews } from "@/utils/game";
import { isAdminUser } from "@/utils/admin";
import type { UserProfileWithId } from "@/types/user";
import AddReviewModal from "./AddReviewModal";
import RatingStarBar from "./RatingStarBar";
import ArcadaeumRating from "./ArcadaeumRating";

type GameDetailReviewsSectionProps = {
	apiUrl: string;
	gameId: string | number;
	gameTitle?: string;
	arcadaeumReview?: ArcadaeumReview | null;
	onRequireSignIn: () => void;
};

const formatReviewDate = (value: string | null) => {
	if (!value) return "Unknown date";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Unknown date";
	return date.toLocaleDateString();
};

export default function GameDetailReviewsSection({
	apiUrl,
	gameId,
	gameTitle,
	arcadaeumReview,
	onRequireSignIn,
}: GameDetailReviewsSectionProps) {
	const [reviews, setReviews] = useState<GameReview[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	useEffect(() => {
		if (!gameId) return;

		setLoading(true);
		setError(null);

		fetchGameReviews(apiUrl, gameId)
			.then((data) => setReviews(data))
			.catch(() => setError("Unable to load reviews."))
			.finally(() => setLoading(false));
	}, [apiUrl, gameId]);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			setCurrentUserId(null);
			setIsAdmin(false);
			return;
		}

		fetch(`${apiUrl}/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((response) => (response.ok ? response.json() : null))
			.then((data: UserProfileWithId | null) => {
				if (data && typeof data.id === "number") {
					setCurrentUserId(data.id);
					setIsAdmin(isAdminUser(data));
				}
			})
			.catch(() => {
				setCurrentUserId(null);
				setIsAdmin(false);
			});
	}, [apiUrl]);

	const handleOpenModal = () => {
		setDeleteError(null);
		const token = localStorage.getItem("access_token");
		if (!token) {
			onRequireSignIn();
			return;
		}

		setSubmitError(null);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSubmitError(null);
	};

	const handleSubmitReview = async (rating: number, reviewText: string) => {
		setDeleteError(null);
		const token = localStorage.getItem("access_token");
		if (!token) {
			onRequireSignIn();
			return;
		}

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const newReview = await createGameReview(apiUrl, token, gameId, {
				rating,
				review_text: reviewText.length ? reviewText : null,
			});

			setReviews((prev) => [newReview, ...prev]);
			setIsModalOpen(false);
		} catch (submitErr) {
			const error = submitErr as Error & { status?: number };
			if (error.status === 409) {
				setSubmitError("You already reviewed this game.");
				return;
			}
			setSubmitError(error.message || "Failed to submit review.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteReview = async (reviewId: number) => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			onRequireSignIn();
			return;
		}

		setDeletingReviewId(reviewId);
		setDeleteError(null);

		try {
			await deleteUserReview(apiUrl, token, reviewId);
			setReviews((prev) => prev.filter((review) => review.id !== reviewId));
		} catch (deleteErr) {
			const error = deleteErr as Error & { status?: number };
			setDeleteError(error.message || "Failed to delete review.");
		} finally {
			setDeletingReviewId(null);
		}
	};

	const currentUserReview = currentUserId
		? (reviews.find((review) => review.user_id === currentUserId) ?? null)
		: null;

	const orderedReviews = currentUserReview
		? [currentUserReview, ...reviews.filter((review) => review.id !== currentUserReview.id)]
		: reviews;

	return (
		<div className="flex flex-col gap-4 mt-8 bg-arcade-black rounded-lg p-4">
			<ArcadaeumRating arcadaeumReview={arcadaeumReview ?? null} />
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-title">Reviews</h2>
				<div className="flex items-center gap-3">
					<button
						onClick={handleOpenModal}
						className="text-arcade-white border border-arcade-white rounded px-4 py-2 hover:bg-arcade-white hover:text-arcade-black transition-colors duration-200"
					>
						Add Review
					</button>
				</div>
			</div>

			{loading ? (
				<p className="text-sm text-arcade-white/70">Loading reviews...</p>
			) : error ? (
				<p className="text-sm text-red-300">{error}</p>
			) : reviews.length === 0 ? (
				<p className="text-sm text-arcade-white/70">No reviews yet.</p>
			) : (
				<div className="grid gap-4 mt-2">
					{deleteError ? <p className="text-sm text-red-300">{deleteError}</p> : null}
					{orderedReviews.map((review) => {
						const canDeleteReview = isAdmin || review.user_id === currentUserId;

						return (
							<div key={review.id} className="bg-arcade-black/60 rounded-lg p-3">
								<div className="flex items-center justify-between text-sm font-default text-gray-300">
									<span>
										{review.display_name ?? review.username} ·{" "}
										{formatReviewDate(review.created_at)}
									</span>
									<div className="flex items-center gap-3">
										{canDeleteReview ? (
											<button
												type="button"
												disabled={deletingReviewId === review.id}
												onClick={() => handleDeleteReview(review.id)}
												className="text-xs text-red-300 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
											>
												{deletingReviewId === review.id
													? "Deleting..."
													: "Delete"}
											</button>
										) : null}
										<div className="flex items-center gap-2">
											<RatingStarBar
												value={review.rating}
												disabled
												className="mt-0"
											/>
										</div>
									</div>
								</div>
								{review.review_text ? (
									<div className="mt-2 text-md font-default text-gray-200">
										{review.review_text}
									</div>
								) : (
									<div className="mt-2 text-sm text-arcade-white/50">
										No written review.
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			<AddReviewModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleSubmitReview}
				isSubmitting={isSubmitting}
				errorMessage={submitError}
				gameTitle={gameTitle}
			/>
		</div>
	);
}
