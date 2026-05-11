import { useEffect, useRef, useState } from "react";
import type { Collection } from "@/types/collections";
import {
	addGameToCollection,
	createCollection,
	fetchCollectionGames,
	fetchCollections,
	removeGameFromCollection,
} from "@/utils/collections/api";
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

const CheckIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);

type CollectionMembership = Collection & { hasGame: boolean };

type CollectionPickerModalProps = {
	apiUrl: string;
	gameId: number;
	isOpen: boolean;
	onClose: () => void;
};

export default function CollectionPickerModal({
	apiUrl,
	gameId,
	isOpen,
	onClose,
}: CollectionPickerModalProps) {
	const [collections, setCollections] = useState<CollectionMembership[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [actionMessage, setActionMessage] = useState<string | null>(null);
	const [newCollectionName, setNewCollectionName] = useState("");
	const [creatingCollection, setCreatingCollection] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const actionTimerRef = useRef<number | null>(null);

	const token = localStorage.getItem("access_token");

	// Load collections and determine membership when opened
	useEffect(() => {
		if (!isOpen || !token) return;

		setLoading(true);
		setError("");

		fetchCollections(apiUrl, token)
			.then(async (cols) => {
				// Check membership for each collection
				const withMembership = await Promise.all(
					cols.map(async (col) => {
						try {
							const gameList = await fetchCollectionGames(apiUrl, token, col.id);
							return { ...col, hasGame: gameList.some((g) => g.id === gameId) };
						} catch {
							return { ...col, hasGame: false };
						}
					}),
				);
				setCollections(withMembership);
			})
			.catch(() => setError("Failed to load collections."))
			.finally(() => setLoading(false));
	}, [isOpen, apiUrl, gameId, token]);

	// Close on ESC
	useEffect(() => {
		if (!isOpen) return;

		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	// Click outside to close
	useEffect(() => {
		if (!isOpen) return;

		const handleClick = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (modalRef.current && target && !modalRef.current.contains(target)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [isOpen, onClose]);

	// Auto-dismiss action message
	useEffect(() => {
		if (actionTimerRef.current) {
			window.clearTimeout(actionTimerRef.current);
		}
		if (actionMessage) {
			actionTimerRef.current = window.setTimeout(() => {
				setActionMessage(null);
				actionTimerRef.current = null;
			}, 2000);
		}
		return () => {
			if (actionTimerRef.current) {
				window.clearTimeout(actionTimerRef.current);
			}
		};
	}, [actionMessage]);

	const handleToggle = async (collection: CollectionMembership) => {
		if (!token) return;

		const previousHasGame = collection.hasGame;
		const newCollections = collections.map((c) =>
			c.id === collection.id ? { ...c, hasGame: !previousHasGame } : c,
		);
		setCollections(newCollections);

		try {
			if (previousHasGame) {
				await removeGameFromCollection(apiUrl, token, collection.id, gameId);
				setActionMessage(`Removed from ${collection.name}`);
			} else {
				await addGameToCollection(apiUrl, token, collection.id, gameId);
				setActionMessage(`Added to ${collection.name}`);
			}
		} catch (err) {
			// Revert on error
			setCollections(
				collections.map((c) =>
					c.id === collection.id ? { ...c, hasGame: previousHasGame } : c,
				),
			);
			setActionMessage(err instanceof Error ? err.message : "Something went wrong.");
		}
	};

	const handleCreateCollection = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!token) return;

		const name = newCollectionName.trim();
		if (!name) {
			setActionMessage("Collection name cannot be empty.");
			return;
		}

		setCreatingCollection(true);

		try {
			const collection = await createCollection(apiUrl, token, { name });
			setCollections((currentCollections) => [
				...currentCollections,
				{ ...collection, hasGame: false },
			]);
			setNewCollectionName("");
			setActionMessage(`Created ${collection.name}`);
		} catch (err) {
			setActionMessage(err instanceof Error ? err.message : "Failed to create collection.");
		} finally {
			setCreatingCollection(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div
				ref={modalRef}
				className="relative w-full max-w-sm rounded-xl border border-arcade-white/20 bg-arcade-black/95 p-6 shadow-2xl"
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-3 right-3 rounded-full p-1 text-arcade-white/60 hover:bg-arcade-white/10 hover:text-arcade-white"
					aria-label="Close"
				>
					<CloseIcon />
				</button>

				<h2 className="mb-4 text-xl font-title text-arcade-white tracking-tighter">
					Add to collection
				</h2>

				<form onSubmit={handleCreateCollection} className="mb-4 flex gap-2">
					<input
						type="text"
						value={newCollectionName}
						onChange={(event) => setNewCollectionName(event.target.value)}
						placeholder="New collection"
						className="min-w-0 flex-1 rounded-lg border border-arcade-white/20 bg-arcade-black px-3 py-2 font-default text-sm text-arcade-white placeholder:text-arcade-white/40 focus:border-arcade-blue focus:outline-none"
					/>
					<button
						type="submit"
						disabled={creatingCollection}
						className="rounded-lg bg-arcade-white px-3 py-2 font-title text-sm text-arcade-black transition hover:scale-95 disabled:opacity-50"
					>
						{creatingCollection ? "..." : "Create"}
					</button>
				</form>

				{loading && <p className="text-sm text-arcade-white/60">Loading collections...</p>}

				{error && <p className="text-sm text-red-400">{error}</p>}

				{!loading && !error && collections.length === 0 && (
					<p className="text-sm text-arcade-white/60">No collections found.</p>
				)}

				{!loading && !error && collections.length > 0 && (
					<div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
						{collections.map((collection) => (
							<button
								type="button"
								key={collection.id}
								onClick={() => handleToggle(collection)}
								className="flex items-center justify-between rounded-lg border border-arcade-white/10 bg-arcade-white/5 px-3 py-2 text-left text-sm text-arcade-white transition-colors hover:bg-arcade-white/10"
							>
								<span className="truncate">{collection.name}</span>
								{collection.hasGame && <CheckIcon />}
							</button>
						))}
					</div>
				)}

				{actionMessage && (
					<div className="mt-3 text-center text-xs text-arcade-white/80">
						{actionMessage}
					</div>
				)}
			</div>
		</div>
	);
}
