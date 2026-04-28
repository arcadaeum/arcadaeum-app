import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import { GameDetailArtwork, GameDetailMainContent, GameDetailSidebar } from "@/components/game";
import type { Game } from "@/types/game";
import {
	fetchGameDetail,
	fetchLibraryMembership,
	showLibraryPopup,
	toggleLibrary,
	type LibraryPopupType,
} from "@/utils/game";

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
	const [libraryPopupType, setLibraryPopupType] = useState<LibraryPopupType>("success");
	const popupTimerRef = useRef<number | null>(null);

	const apiUrl = import.meta.env.VITE_API_URL as string;

	useEffect(() => {
		if (!id) return;

		fetchGameDetail(apiUrl, id)
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

		fetchLibraryMembership(apiUrl, token, id)
			.then((isInLibrary) => {
				setInLibrary(isInLibrary);
			})
			.catch(() => {
				setInLibrary(false);
			});
	}, [apiUrl, id]);

	const handleShowLibraryPopup = (message: string, type: LibraryPopupType = "success") => {
		showLibraryPopup({
			message,
			type,
			setLibraryPopup,
			setLibraryPopupType,
			popupTimerRef,
		});
	};

	useEffect(() => {
		return () => {
			if (popupTimerRef.current) {
				window.clearTimeout(popupTimerRef.current);
			}
		};
	}, []);

	const handleToggleLibrary = async () => {
		await toggleLibrary({
			id,
			apiUrl,
			inLibrary,
			setInLibrary,
			token: localStorage.getItem("access_token"),
			onRequireSignIn: () => navigate("/signin"),
			showPopup: handleShowLibraryPopup,
		});
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
						onToggleLibrary={handleToggleLibrary}
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
