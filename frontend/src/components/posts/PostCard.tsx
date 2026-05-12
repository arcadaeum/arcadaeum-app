import { Check, Pencil, Trash2, X, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { SocialPost } from "@/types/posts";
import { getUserProfileImageProxyUrl } from "@/utils/user";

type PostCardProps = {
	post: SocialPost;
	apiUrl: string;
	canManage?: boolean;
	canDelete?: boolean;
	canEdit?: boolean;
	compact?: boolean;
	profilePath?: string;
	onUpdate?: (postId: number, content: string) => Promise<void>;
	onDelete?: (postId: number) => Promise<void>;
};

const formatPostDate = (value?: string | null) => {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export default function PostCard({
	post,
	apiUrl,
	canManage = false,
	canDelete,
	canEdit,
	compact = false,
	profilePath,
	onUpdate,
	onDelete,
}: PostCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(post.content);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	const displayName = post.display_name ?? "Arcadaeum user";
	const profileImage = post.profile_picture
		? getUserProfileImageProxyUrl(apiUrl, post.profile_picture)
		: null;
	const showEditControl = canEdit ?? canManage;
	const showDeleteControl = canDelete ?? canManage;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!onUpdate) return;

		const content = draft.trim();
		if (!content) {
			setError("Post content cannot be empty.");
			return;
		}

		setBusy(true);
		setError("");
		try {
			await onUpdate(post.id, content);
			setIsEditing(false);
		} catch (updateError) {
			setError(updateError instanceof Error ? updateError.message : "Failed to update post.");
		} finally {
			setBusy(false);
		}
	};

	const handleDelete = async () => {
		if (!onDelete) return;
		setBusy(true);
		setError("");
		try {
			await onDelete(post.id);
		} catch (deleteError) {
			setError(deleteError instanceof Error ? deleteError.message : "Failed to delete post.");
			setBusy(false);
		}
	};

	const card = (
		<article className="rounded-lg border border-arcade-white/15 bg-arcade-black/80 p-4 text-arcade-white max-sm:p-3">
			<div className="flex items-start gap-3 max-sm:gap-2">
				<div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-arcade-blue/60 bg-arcade-white/10 max-sm:size-9">
					{profileImage ? (
						<img src={profileImage} alt="" className="h-full w-full object-cover" />
					) : (
						<UserRound className="size-6 text-arcade-white/70 max-sm:size-5" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="min-w-0">
							<div className="truncate font-title text-lg leading-tight text-arcade-white max-sm:text-base">
								{displayName}
							</div>
							<div className="text-xs text-arcade-white/50">
								{formatPostDate(post.created_at)
									? ` - ${formatPostDate(post.created_at)}`
									: ""}
							</div>
						</div>
						{(showEditControl || showDeleteControl) && !isEditing && (
							<div className="flex items-center gap-2 max-sm:gap-1">
								{showEditControl && (
									<button
										type="button"
										onClick={() => {
											setDraft(post.content);
											setIsEditing(true);
											setError("");
										}}
										className="rounded-full border border-arcade-white/20 p-2 text-arcade-white/70 transition hover:text-arcade-blue max-sm:p-1.5"
										aria-label="Edit post"
									>
										<Pencil className="size-4" />
									</button>
								)}
								{showDeleteControl && (
									<button
										type="button"
										onClick={handleDelete}
										disabled={busy}
										className="rounded-full border border-arcade-white/20 p-2 text-arcade-white/70 transition hover:text-red-300 disabled:opacity-50 max-sm:p-1.5"
										aria-label="Delete post"
									>
										<Trash2 className="size-4" />
									</button>
								)}
							</div>
						)}
					</div>

					{isEditing ? (
						<form onSubmit={handleSubmit} className="mt-3 space-y-3">
							<textarea
								value={draft}
								onChange={(event) => setDraft(event.target.value)}
								maxLength={1000}
								rows={compact ? 3 : 4}
								className="w-full resize-none rounded-lg border border-arcade-blue/50 bg-arcade-white p-3 font-secondary text-sm text-arcade-black outline-none focus:border-arcade-blue"
							/>
							<div className="flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => {
										setIsEditing(false);
										setDraft(post.content);
										setError("");
									}}
									className="rounded-full border border-arcade-white/20 p-2 text-arcade-white/70 transition hover:text-arcade-white"
									aria-label="Cancel edit"
								>
									<X className="size-4" />
								</button>
								<button
									type="submit"
									disabled={busy}
									className="rounded-full border border-arcade-blue/60 p-2 text-arcade-blue transition hover:text-arcade-white disabled:opacity-50"
									aria-label="Save post"
								>
									<Check className="size-4" />
								</button>
							</div>
						</form>
					) : (
						<p
							className={`mt-3 whitespace-pre-wrap wrap-break-word font-secondary text-arcade-white/85 ${compact ? "text-sm" : "text-base max-sm:text-sm"}`}
						>
							{post.content}
						</p>
					)}
					{error && <p className="mt-2 text-sm text-red-300">{error}</p>}
				</div>
			</div>
		</article>
	);

	if (profilePath && !showEditControl && !showDeleteControl && !isEditing) {
		return (
			<Link to={profilePath} className="block transition hover:scale-[1.01]">
				{card}
			</Link>
		);
	}

	return card;
}
