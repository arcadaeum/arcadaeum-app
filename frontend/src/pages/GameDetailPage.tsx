import { useEffect, useState } from "react";
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

	// Temporary state for favouriting - will need to be replaced using the api and database.
	const [favourited, setFavourited] = useState(false);

	useEffect(() => {
		if (!id) return;

		const url = `${import.meta.env.VITE_API_URL}/games/${id}`;

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
	}, [id]);

	if (!id) return <div>Invalid game id.</div>;
	if (loading) return <div>Loading game...</div>;
	if (error) return <div>{error}</div>;

	console.log("Game data:", game);

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
						onToggleFavourite={() => setFavourited(!favourited)}
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
