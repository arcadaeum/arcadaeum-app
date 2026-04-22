import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import ColorBends from "../components/ColorBends";
import heartIconFilled from "../assets/images/heart-icon-filled.svg";
import heartIconUnfilled from "../assets/images/heart-icon-unfilled.svg";

type Game = {
	id: number;
	igdb_id: number;
	title: string;
	cover_url?: string | null;
	summary?: string | null;
	igdb_rating?: number | null;
	platforms?: string[] | null;
	release_date?: string | null;
	created_at?: string | null;
};

export default function GameDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);
	const [error] = useState<string | null>(null);

	// Temporary state for favouriting - will need to be replaced using the api and database.
	const [favourited, setFavourited] = useState(false);

	useEffect(() => {
		if (!id) return;

		// Need to implement games/id in backend for this to work.
		const url = `${import.meta.env.VITE_API_URL}/games/${id}`;

		fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error("not found");
				return res.json();
			})
			.then((data) => setGame(data))
			.catch(() => {
				const numericId = Number(id);
				setGame({
					id: numericId,
					igdb_id: numericId,
					title: `Game ${id}`,
					cover_url: `https://via.placeholder.com/800x450?text=Game+${encodeURIComponent(id)}`,
					summary:
						"This is a placeholder game page. When the game API is available, real metadata and images will be shown here.",
					igdb_rating: null,
					platforms: null,
					release_date: null,
					created_at: null,
				});
			})
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) return <div>Loading game...</div>;
	if (error) return <div>{error}</div>;

	console.log("Game data:", game);

	return (
		<>
			<NavigationBar />
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90"
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
			<div className="min-h-screen font-title px-16 pt-36 text-arcade-white">
				<button
					onClick={() => navigate(-1)}
					className="mb-4 text-sm font-default text-arcade-white border rounded px-3 py-1"
				>
					Back
				</button>

				<div className="flex gap-8 items-start">
					<div className="w-82">
						{/* Game image */}
						<img
							src={game?.cover_url ?? undefined}
							alt={game?.title}
							className="rounded-lg shadow-lg object-cover h-64"
						/>

						{/* Favourite buttons */}

						<button
							className="flex gap-2 mt-4 justify-content text-sm text-arcade-white font-secondary border-2 border-arcade-white rounded-lg p-4"
							onClick={() => setFavourited(!favourited)}
						>
							{favourited ? (
								<img src={heartIconFilled} alt="Favourite" className="w-6 h-6" />
							) : (
								<img src={heartIconUnfilled} alt="Favourite" className="w-6 h-6" />
							)}
						</button>
					</div>

					{/* Game title and summary */}
					<div className="flex-col h-full w-full">
						<h1 className="text-4xl font-title mt-4">{game?.title}</h1>
						<p className="mt-4 text-sm font-default text-gray-200">{game?.summary}</p>
					</div>

					{/* Sidebar */}
					<aside className="w-1/3 max-w-xs">
						<div className="bg-arcade-black rounded-lg p-4">
							<div className="text-sm font-default text-gray-300">IGDB Rating</div>
							<div className="font-title text-arcade-white">
								{game?.igdb_rating ? game.igdb_rating.toFixed(1) : "—"}
							</div>
							<div className="mt-4 text-sm font-default text-gray-300">Release</div>
							<div className="font-title text-arcade-white">
								{game?.release_date ?? "—"}
							</div>
							<div className="mt-4 text-sm font-default text-gray-300">Platforms</div>
							<div className="font-title text-arcade-white">
								{game?.platforms?.join(", ") ?? "—"}
							</div>
						</div>
					</aside>
				</div>
			</div>
		</>
	);
}
