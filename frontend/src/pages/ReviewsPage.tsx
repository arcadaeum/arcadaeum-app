import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { ColorBends, MainButton, NavigationBar, PageHeader } from "@/components/ui";
import { RatingStarBar } from "@/components/game";
import type { UserGameReview } from "@/types/gameDetail";
import type { UserProfileWithId } from "@/types/user";
import {
	deleteUserReview,
	fetchCurrentUserReviews,
	fetchUserReviews,
	updateUserReview,
} from "@/utils/game";
import { isAdminUser } from "@/utils/admin";

type DeleteTarget = {
	id: number;
	gameTitle: string;
} | null;

const formatReviewDate = (value: string | null) => {
	if (!value) return "Unknown date";
	return new Date(value).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export default function ReviewsPage() {
	const [reviews, setReviews] = useState<UserGameReview[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [statusMessage, setStatusMessage] = useState("");
	const [profile, setProfile] = useState<UserProfileWithId | null>(null);
	const [currentUser, setCurrentUser] = useState<UserProfileWithId | null>(null);
	const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
	const [editingRating, setEditingRating] = useState(0);
	const [editingText, setEditingText] = useState("");
	const [savingReviewId, setSavingReviewId] = useState<number | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;
	const isPublicView = !!userId;
	const token = useMemo(() => localStorage.getItem("access_token"), []);
	const isAdmin = isAdminUser(currentUser);

	const loadReviews = async () => {
		setLoading(true);
		setError("");

		try {
			const fetchedReviews =
				isPublicView && userId
					? await fetchUserReviews(apiUrl, userId)
					: await fetchCurrentUserReviews(apiUrl, token ?? "");
			setReviews(fetchedReviews);
		} catch {
			setError("Failed to load reviews.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isPublicView && !token) {
			navigate("/signin");
			return;
		}

		void loadReviews();
	}, [navigate, token, isPublicView, userId]);

	useEffect(() => {
		if (!token) {
			setCurrentUser(null);
			return;
		}

		fetch(`${apiUrl}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => (res.ok ? res.json() : null))
			.then((data: UserProfileWithId | null) => setCurrentUser(data))
			.catch(() => setCurrentUser(null));
	}, [apiUrl, token]);

	useEffect(() => {
		if (!userId) {
			setProfile(null);
			return;
		}

		fetch(`${apiUrl}/users/${userId}`)
			.then((res) => {
				if (!res.ok) throw new Error("User not found");
				return res.json();
			})
			.then((data: UserProfileWithId) => setProfile(data))
			.catch(() => setProfile(null));
	}, [apiUrl, userId]);

	const showStatus = (message: string) => {
		setStatusMessage(message);
		window.setTimeout(() => setStatusMessage(""), 2500);
	};

	const startEditing = (review: UserGameReview) => {
		setEditingReviewId(review.id);
		setEditingRating(review.rating);
		setEditingText(review.review_text ?? "");
		setError("");
	};

	const cancelEditing = () => {
		setEditingReviewId(null);
		setEditingRating(0);
		setEditingText("");
	};

	const handleSaveReview = async (reviewId: number) => {
		if (!token || isPublicView) return;

		setSavingReviewId(reviewId);
		setError("");

		try {
			const updatedReview = await updateUserReview(apiUrl, token, reviewId, {
				rating: editingRating,
				review_text: editingText.trim() ? editingText.trim() : null,
			});
			setReviews((currentReviews) =>
				currentReviews.map((review) =>
					review.id === reviewId ? updatedReview : review,
				),
			);
			cancelEditing();
			showStatus(`Updated review for ${updatedReview.game_title}.`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update review.");
		} finally {
			setSavingReviewId(null);
		}
	};

	const handleDeleteReview = async () => {
		if (!token || !deleteTarget || (isPublicView && !isAdmin)) return;

		try {
			await deleteUserReview(apiUrl, token, deleteTarget.id);
			setReviews((currentReviews) =>
				currentReviews.filter((review) => review.id !== deleteTarget.id),
			);
			showStatus(`Deleted review for ${deleteTarget.gameTitle}.`);
			setDeleteTarget(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete review.");
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error && reviews.length === 0) return <div>{error}</div>;

	return (
		<>
			<NavigationBar />
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90 blur-3xl"
				rotation={32}
				colors={["#8122c0", "#5647f1", "#37b0ea"]}
				speed={0.2}
				scale={2}
				frequency={1}
				warpStrength={1}
				mouseInfluence={1}
				parallax={0.5}
				noise={0.1}
				transparent
				autoRotate={0}
			/>
			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16 pb-20">
				<PageHeader
					title="Reviews."
					subtitle={
						isPublicView
							? "Browse this user's game reviews."
							: "View, edit, and delete your game reviews."
					}
				/>

				{isPublicView && profile && (
					<div className="w-2/3 ml-50 mt-3 font-secondary text-sm text-arcade-white/70">
						Viewing reviews for{" "}
						<Link
							to={`/users/${profile.id}`}
							className="text-arcade-blue hover:underline"
						>
							{profile.display_name ?? profile.username}
						</Link>
						.
					</div>
				)}

				{error && (
					<div className="w-2/3 ml-50 mt-4 rounded-lg border border-red-300/30 bg-arcade-black/80 px-4 py-3 font-secondary text-sm text-red-300">
						{error}
					</div>
				)}
				{statusMessage && (
					<div className="w-2/3 ml-50 mt-4 rounded-lg border border-arcade-blue/30 bg-arcade-black/80 px-4 py-3 font-secondary text-sm text-arcade-white/80">
						{statusMessage}
					</div>
				)}

				{reviews.length > 0 ? (
					<div className="mt-12 w-full space-y-6">
						{reviews.map((review, index) => {
							const borderColors = [
								"border-arcade-white",
								"border-arcade-blue",
								"border-arcade-purple",
								"border-arcade-violet",
							];
							const borderColor = borderColors[index % borderColors.length];
							const isEditing = editingReviewId === review.id;

							return (
								<section
									key={review.id}
									className={`w-2/3 ml-50 rounded-lg border ${borderColor} bg-arcade-black/80 p-5`}
								>
									<div className="flex gap-5">
										<Link
											to={`/games/${review.game_id}`}
											className="h-32 w-24 shrink-0 overflow-hidden rounded-sm bg-gray-800"
										>
											<img
												src={
													review.game_cover_url ??
													`https://via.placeholder.com/320x420?text=${encodeURIComponent(
														review.game_title,
													)}`
												}
												alt={review.game_title}
												className="h-full w-full object-cover"
											/>
										</Link>

										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-4">
												<div className="min-w-0">
													<Link
														to={`/games/${review.game_id}`}
														className="text-2xl font-title tracking-tighter text-arcade-white hover:text-arcade-blue"
													>
														{review.game_title}
													</Link>
													<div className="mt-1 font-secondary text-xs text-arcade-white/60">
														{formatReviewDate(review.created_at)}
													</div>
												</div>

												{(!isPublicView || isAdmin) && (
													<div className="flex shrink-0 items-center gap-2">
														{isEditing ? (
															<>
																<button
																	type="button"
																	onClick={() =>
																		handleSaveReview(review.id)
																	}
																	disabled={
																		savingReviewId === review.id
																	}
																	className="rounded-full p-2 text-arcade-white transition hover:bg-arcade-white/10 hover:text-arcade-blue disabled:opacity-50"
																	aria-label="Save review"
																>
																	<Check className="h-4 w-4" />
																</button>
																<button
																	type="button"
																	onClick={cancelEditing}
																	className="rounded-full p-2 text-arcade-white/70 transition hover:bg-arcade-white/10 hover:text-arcade-white"
																	aria-label="Cancel edit"
																>
																	<X className="h-4 w-4" />
																</button>
															</>
														) : (
															<>
																{!isPublicView && (
																	<button
																		type="button"
																		onClick={() =>
																			startEditing(review)
																		}
																		className="rounded-full p-2 text-arcade-white/70 transition hover:bg-arcade-white/10 hover:text-arcade-blue"
																		aria-label={`Edit review for ${review.game_title}`}
																	>
																		<Pencil className="h-4 w-4" />
																	</button>
																)}
																<button
																	type="button"
																	onClick={() =>
																		setDeleteTarget({
																			id: review.id,
																			gameTitle:
																				review.game_title,
																		})
																	}
																	className="rounded-full p-2 text-arcade-white/70 transition hover:bg-red-500/10 hover:text-red-300"
																	aria-label={`Delete review for ${review.game_title}`}
																>
																	<Trash2 className="h-4 w-4" />
																</button>
															</>
														)}
													</div>
												)}
											</div>

											{isEditing ? (
												<div className="mt-4">
													<RatingStarBar
														value={editingRating}
														onChange={setEditingRating}
														className="mt-0"
													/>
													<textarea
														value={editingText}
														onChange={(event) =>
															setEditingText(event.target.value)
														}
														rows={4}
														className="mt-4 w-full rounded-lg border-2 border-arcade-white bg-arcade-black px-4 py-3 font-default text-sm text-arcade-white placeholder:text-arcade-white/40 focus:border-arcade-blue focus:outline-none"
														placeholder="Review text"
													/>
													<div className="mt-3 flex justify-end">
														<MainButton
															text={
																savingReviewId === review.id
																	? "Saving..."
																	: "Save Review"
															}
															onClick={() =>
																handleSaveReview(review.id)
															}
															disabled={savingReviewId === review.id}
														/>
													</div>
												</div>
											) : (
												<>
													<RatingStarBar
														value={review.rating}
														disabled
														className="mt-3"
													/>
													<div className="mt-4 font-default text-sm leading-6 text-arcade-white/80">
														{review.review_text ?? "No written review."}
													</div>
												</>
											)}
										</div>
									</div>
								</section>
							);
						})}
					</div>
				) : (
					<div className="w-2/3 ml-50 mt-10 rounded-lg border border-arcade-white/10 bg-arcade-black/80 p-6 text-center font-secondary text-arcade-white/70">
						{isPublicView
							? "This user has not reviewed any games yet."
							: "You have not reviewed any games yet."}
					</div>
				)}
			</div>

			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-xl border border-arcade-white/20 bg-arcade-black/95 p-6 shadow-2xl">
						<h2 className="text-xl font-title text-arcade-white tracking-tighter">
							Delete review?
						</h2>
						<p className="mt-3 font-secondary text-sm text-arcade-white/70">
							This will delete the review for "{deleteTarget.gameTitle}".
						</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setDeleteTarget(null)}
								className="rounded-lg border border-arcade-white/20 px-4 py-2 font-title text-sm text-arcade-white transition hover:bg-arcade-white/10"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDeleteReview}
								className="rounded-lg bg-red-400 px-4 py-2 font-title text-sm text-arcade-black transition hover:scale-95"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
