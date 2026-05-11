import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

type PostComposerProps = {
	onSubmit: (content: string) => Promise<void>;
};

export default function PostComposer({ onSubmit }: PostComposerProps) {
	const [content, setContent] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const nextContent = content.trim();
		if (!nextContent) {
			setError("Post content cannot be empty.");
			return;
		}

		setBusy(true);
		setError("");
		try {
			await onSubmit(nextContent);
			setContent("");
			setIsOpen(false);
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : "Failed to create post.");
		} finally {
			setBusy(false);
		}
	};

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="inline-flex items-center gap-2 rounded-lg border border-arcade-blue/70 bg-arcade-blue/10 px-4 py-2 font-secondary text-sm font-bold text-arcade-white transition hover:border-arcade-white hover:bg-arcade-blue/20"
			>
				<Send className="size-4" />
				Add Post
			</button>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full rounded-lg border border-arcade-blue/40 bg-arcade-black/80 p-4"
		>
			<textarea
				value={content}
				onChange={(event) => setContent(event.target.value)}
				maxLength={1000}
				rows={4}
				placeholder="Share what you are playing..."
				className="w-full resize-none rounded-lg border border-arcade-blue/50 bg-arcade-white p-3 font-secondary text-sm text-arcade-black outline-none placeholder:text-arcade-black/50 focus:border-arcade-blue"
			/>
			<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
				<div className="font-secondary text-xs text-arcade-white/50">
					{content.length}/1000
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => {
							setIsOpen(false);
							setContent("");
							setError("");
						}}
						className="rounded-lg border border-arcade-white/20 px-4 py-2 font-secondary text-sm text-arcade-white/70 transition hover:text-arcade-white"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={busy}
						className="inline-flex items-center gap-2 rounded-lg border border-arcade-blue/70 bg-arcade-blue/20 px-4 py-2 font-secondary text-sm font-bold text-arcade-white transition hover:border-arcade-white disabled:opacity-50"
					>
						<Send className="size-4" />
						Post
					</button>
				</div>
			</div>
			{error && <p className="mt-2 font-secondary text-sm text-red-300">{error}</p>}
		</form>
	);
}
