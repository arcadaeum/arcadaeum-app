import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { ColorBends, MainButton, NavigationBar, PageHeader } from "@/components/ui";
import { UserCollectionsRow } from "@/components/user";
import type { Collection } from "@/types/collections";
import type { Game } from "@/types/game";
import type { UserCollectionGame, UserProfileWithId } from "@/types/user";
import {
	createCollection,
	deleteCollection,
	fetchCollectionGames,
	fetchCollections,
	fetchUserCollectionGames,
	fetchUserCollections,
	mapCollectionGames,
	renameCollection,
} from "@/utils/collections";

type CollectionWithGames = Collection & {
	games: UserCollectionGame[];
	gamesLoading: boolean;
};

type DeleteTarget = {
	id: number;
	name: string;
} | null;

export default function CollectionsPage() {
	const [collections, setCollections] = useState<CollectionWithGames[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [newCollectionName, setNewCollectionName] = useState("");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [creating, setCreating] = useState(false);
	const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
	const [statusMessage, setStatusMessage] = useState("");
	const [profile, setProfile] = useState<UserProfileWithId | null>(null);
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;
	const isPublicView = !!userId;

	const token = useMemo(() => localStorage.getItem("access_token"), []);

	const loadCollections = async () => {
		setLoading(true);
		setError("");

		try {
			const fetchedCollections =
				isPublicView && userId
					? await fetchUserCollections(apiUrl, userId)
					: await fetchCollections(apiUrl, token ?? "");
			const withLoadingState = fetchedCollections.map((collection) => ({
				...collection,
				games: [],
				gamesLoading: true,
			}));
			setCollections(withLoadingState);

			const collectionsWithGames = await Promise.all(
				fetchedCollections.map(async (collection) => {
					try {
						const games =
							isPublicView && userId
								? await fetchUserCollectionGames(apiUrl, userId, collection.id)
								: await fetchCollectionGames(apiUrl, token ?? "", collection.id);
						return {
							...collection,
							games: mapCollectionGames(games as Game[]),
							gamesLoading: false,
						};
					} catch {
						return {
							...collection,
							games: [],
							gamesLoading: false,
						};
					}
				}),
			);

			setCollections(collectionsWithGames);
		} catch {
			setError("Failed to load collections.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isPublicView && !token) {
			navigate("/signin");
			return;
		}

		void loadCollections();
	}, [navigate, token, isPublicView, userId]);

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

	const handleCreateCollection = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!token || isPublicView) return;

		const name = newCollectionName.trim();
		if (!name) {
			setError("Collection name cannot be empty.");
			return;
		}

		setCreating(true);
		setError("");

		try {
			const collection = await createCollection(apiUrl, token, { name });
			setCollections((currentCollections) => [
				...currentCollections,
				{ ...collection, games: [], gamesLoading: false },
			]);
			setNewCollectionName("");
			setShowCreateForm(false);
			showStatus(`Created ${collection.name}.`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create collection.");
		} finally {
			setCreating(false);
		}
	};

	const startEditing = (collection: Collection) => {
		setEditingCollectionId(collection.id);
		setEditingName(collection.name);
		setError("");
	};

	const handleRenameCollection = async (collectionId: number) => {
		if (!token || isPublicView) return;

		const name = editingName.trim();
		if (!name) {
			setError("Collection name cannot be empty.");
			return;
		}

		try {
			const updatedCollection = await renameCollection(apiUrl, token, collectionId, name);
			setCollections((currentCollections) =>
				currentCollections.map((collection) =>
					collection.id === collectionId
						? { ...collection, ...updatedCollection }
						: collection,
				),
			);
			setEditingCollectionId(null);
			setEditingName("");
			showStatus(`Renamed collection to ${updatedCollection.name}.`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to rename collection.");
		}
	};

	const handleDeleteCollection = async () => {
		if (!token || !deleteTarget || isPublicView) return;

		try {
			await deleteCollection(apiUrl, token, deleteTarget.id);
			setCollections((currentCollections) =>
				currentCollections.filter((collection) => collection.id !== deleteTarget.id),
			);
			showStatus(`Deleted ${deleteTarget.name}.`);
			setDeleteTarget(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete collection.");
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error && collections.length === 0) return <div>{error}</div>;

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
					title="Collections."
					subtitle={
						isPublicView
							? "Browse this user's game shelves."
							: "Create and organise your game shelves."
					}
				/>

				{isPublicView && profile && (
					<div className="w-2/3 ml-50 mt-3 font-secondary text-sm text-arcade-white/70">
						Viewing collections for{" "}
						<Link
							to={`/users/${profile.id}`}
							className="text-arcade-blue hover:underline"
						>
							{profile.display_name ?? profile.username}
						</Link>
						.
					</div>
				)}

				{!isPublicView && (
					<div className="w-2/3 ml-50 mt-10">
						{showCreateForm ? (
							<form
								onSubmit={handleCreateCollection}
								className="flex flex-col gap-3 sm:flex-row"
							>
								<input
									type="text"
									value={newCollectionName}
									onChange={(event) =>
										setNewCollectionName(event.target.value)
									}
									placeholder="New collection name"
									autoFocus
									className="min-w-0 flex-1 rounded-lg border-2 border-arcade-white bg-arcade-black px-4 py-2 font-default text-sm text-arcade-white placeholder:text-arcade-white/40 focus:border-arcade-blue focus:outline-none"
								/>
								<MainButton
									text={creating ? "Creating..." : "Create Collection"}
									type="submit"
									disabled={creating}
								/>
								<button
									type="button"
									onClick={() => {
										setShowCreateForm(false);
										setNewCollectionName("");
									}}
									className="rounded-lg border-2 border-arcade-white bg-arcade-black px-4 py-2 font-title text-arcade-white transition-colors hover:bg-arcade-white/10"
								>
									Cancel
								</button>
							</form>
						) : (
							<div className="flex justify-center">
								<MainButton
									text="Add Collection"
									onClick={() => {
										setError("");
										setShowCreateForm(true);
									}}
								/>
							</div>
						)}
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

				{collections.length > 0 ? (
					<div className="mt-12 w-full">
						{collections.map((collection, index) => {
							const borderColors = [
								"border-arcade-white",
								"border-arcade-blue",
								"border-arcade-purple",
								"border-arcade-violet",
							];
							const borderColor = borderColors[index % borderColors.length];
							const isEditing = editingCollectionId === collection.id;

							return (
								<section key={collection.id} className="mb-8">
									<div
										className={`w-2/3 ml-50 flex items-center justify-between gap-4 border-b-4 ${borderColor}`}
									>
										{isEditing ? (
											<input
												type="text"
												value={editingName}
												onChange={(event) =>
													setEditingName(event.target.value)
												}
												className="mb-2 min-w-0 flex-1 rounded-lg border border-arcade-white/20 bg-arcade-black px-3 py-2 font-title text-2xl tracking-tighter text-arcade-white focus:border-arcade-blue focus:outline-none"
											/>
										) : (
											<h2 className="min-w-0 truncate text-2xl font-title text-arcade-white tracking-tighter">
												{collection.name}
											</h2>
										)}

										{!collection.is_default && !isPublicView && (
											<div className="mb-2 flex shrink-0 items-center gap-2">
												{isEditing ? (
													<>
														<button
															type="button"
															onClick={() =>
																handleRenameCollection(
																	collection.id,
																)
															}
															className="rounded-full p-2 text-arcade-white transition hover:bg-arcade-white/10 hover:text-arcade-blue"
															aria-label="Save collection name"
														>
															<Check className="h-4 w-4" />
														</button>
														<button
															type="button"
															onClick={() => {
																setEditingCollectionId(null);
																setEditingName("");
															}}
															className="rounded-full p-2 text-arcade-white/70 transition hover:bg-arcade-white/10 hover:text-arcade-white"
															aria-label="Cancel rename"
														>
															<X className="h-4 w-4" />
														</button>
													</>
												) : (
													<>
														<button
															type="button"
															onClick={() => startEditing(collection)}
															className="rounded-full p-2 text-arcade-white/70 transition hover:bg-arcade-white/10 hover:text-arcade-blue"
															aria-label={`Rename ${collection.name}`}
														>
															<Pencil className="h-4 w-4" />
														</button>
														<button
															type="button"
															onClick={() =>
																setDeleteTarget({
																	id: collection.id,
																	name: collection.name,
																})
															}
															className="rounded-full p-2 text-arcade-white/70 transition hover:bg-red-500/10 hover:text-red-300"
															aria-label={`Delete ${collection.name}`}
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</>
												)}
											</div>
										)}
									</div>

									{collection.gamesLoading ? (
										<div className="w-2/3 ml-50 py-6 font-secondary text-sm text-arcade-white/60">
											Loading games...
										</div>
									) : (
										<UserCollectionsRow
											collections={collection.games}
											emptyMessage="No games in this collection yet."
										/>
									)}
								</section>
							);
						})}
					</div>
				) : (
					<div className="w-2/3 ml-50 mt-10 rounded-lg border border-arcade-white/10 bg-arcade-black/80 p-6 text-center font-secondary text-arcade-white/70">
						{isPublicView ? (
							"This user has no collections yet."
						) : (
							<>
								No collections yet. Create one above or add games from the{" "}
								<Link to="/browse" className="text-arcade-blue hover:underline">
									Arcadaeum
								</Link>
								.
							</>
						)}
					</div>
				)}
			</div>

			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-xl border border-arcade-white/20 bg-arcade-black/95 p-6 shadow-2xl">
						<h2 className="text-xl font-title text-arcade-white tracking-tighter">
							Delete collection?
						</h2>
						<p className="mt-3 font-secondary text-sm text-arcade-white/70">
							This will delete "{deleteTarget.name}" and remove its saved game list.
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
								onClick={handleDeleteCollection}
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
