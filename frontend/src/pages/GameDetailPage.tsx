import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import { GameDetailArtwork, GameDetailMainContent, GameDetailSidebar } from "@/components/game";
import type { Game } from "@/types/game";

export default function GameDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [inLibrary, setInLibrary] = useState(false);

	// Temporary state for favouriting - will need to be replaced using the api and database.
	const [favourited, setFavourited] = useState(false);

	const [libraryPopup, setLibraryPopup] = useState<string | null>(null);
	const [libraryPopupType, setLibraryPopupType] = useState<"success" | "error">("success");
	const popupTimerRef = useRef<number | null>(null);

	const apiUrl = import.meta.env.VITE_API_URL as string;

	useEffect(() => {
		if (!id) return;

		const url = `${apiUrl}/games/${id}`;

		fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error("Game not found");
				return res.json();
			})
			.then((data) => {
				setGame(data);
				setError(null);
			})
			.catch(() => {
				setGame(null);
				setError("Unable to load game details.");
			})
			.finally(() => setLoading(false));
	}, [apiUrl, id]);

	useEffect(() => {
		if (!id) return;

		const token = localStorage.getItem("access_token");
		if (!token) return;

		fetch(`${apiUrl}/users/me/library`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch library");
				return res.json();
			})
			.then((entries: { game_id: number }[]) => {
				const gameId = Number(id);
				setInLibrary(entries.some((entry) => entry.game_id === gameId));
			})
			.catch(() => {
				setInLibrary(false);
			});
	}, [apiUrl, id]);

	const showLibraryPopup = (message: string, type: "success" | "error" = "success") => {
		setLibraryPopup(message);
		setLibraryPopupType(type);

		if (popupTimerRef.current) {
			window.clearTimeout(popupTimerRef.current);
		}

		popupTimerRef.current = window.setTimeout(() => {
			setLibraryPopup(null);
		}, 2500);
	};

	useEffect(() => {
		return () => {
			if (popupTimerRef.current) {
				window.clearTimeout(popupTimerRef.current);
			}
		};
	}, []);

	// Toggle library
	const toggleLibrary = async () => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			navigate("/signin");
			return;
		}

		const gameId = Number(id);
		const isRemoving = inLibrary;
		const url = isRemoving
			? `${apiUrl}/users/me/library/${gameId}`
			: `${apiUrl}/users/me/library`;
		const method = isRemoving ? "DELETE" : "POST";

		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
		const body = isRemoving ? undefined : JSON.stringify({ game_id: gameId });

		const previousInLibrary = inLibrary;
		setInLibrary(!previousInLibrary);

		try {
			const res = await fetch(url, { method, headers, body });
			if (res.ok) {
				showLibraryPopup(
					previousInLibrary ? "Removed from your library." : "Added to your library.",
					"success",
				);
			} else {
				setInLibrary(previousInLibrary);

				if (res.status === 409) {
					setInLibrary(true);
					showLibraryPopup("Already in your library.", "error");
					return;
				}

				const errorData = await res.json().catch(() => ({}));
				const message =
					errorData.detail ||
					`Failed to ${isRemoving ? "remove from" : "add to"} library`;
				console.error(message);
				showLibraryPopup(message, "error");
			}
		} catch (error) {
			setInLibrary(previousInLibrary);
			console.error("Network error:", error);
			showLibraryPopup("Network error. Please try again.", "error");
		}
	};

	if (!id) return <div>Invalid game id.</div>;
	if (loading) return <div>Loading game...</div>;
	if (error) return <div>{error}</div>;

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
			<div className="min-h-screen ml-16 font-title px-16 pt-36 text-arcade-white">
				<div className="flex gap-8 items-start">
					<GameDetailArtwork
						game={game}
						favourited={favourited}
						inLibrary={inLibrary}
						onToggleFavourite={() => setFavourited(!favourited)}
						onToggleLibrary={toggleLibrary}
						libraryPopupMessage={libraryPopup}
						libraryPopupType={libraryPopupType}
					/>
					<GameDetailMainContent
						game={game}
						onAddReview={() => navigate(`/games/${game?.id}/add-review`)}
					/>
					<GameDetailSidebar game={game} />
				</div>
			</div>
		</>
	);
}
