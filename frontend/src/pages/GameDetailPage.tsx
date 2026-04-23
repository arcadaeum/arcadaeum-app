import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import ColorBends from "../components/ColorBends";
import heartIconFilled from "../assets/images/heart-icon-filled.svg";
import heartIconUnfilled from "../assets/images/heart-icon-unfilled.svg";
import type { Game } from "../types/game";

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
					developer: null,
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
					<div className="w-1/3 max-w-md">
						{/* Game image with overlayed favourite */}
						<div className="relative pb-8">
							<img
								src={game?.cover_url ?? undefined}
								alt={game?.title}
								className="shadow-lg object-cover rounded-xl h-auto w-full border-5 border-arcade-white"
							/>

							<div className="absolute inset-0 z-30 flex items-end mb-1 justify-center pointer-events-none">
								<button
									aria-label="Favourite"
									onClick={() => setFavourited(!favourited)}
									className="opacity-0 pointer-events-auto text-arcade-white bg-arcade-black rounded-full p-1 transition-transform hover:scale-110 hover:opacity-100 duration-100"
								>
									{favourited ? (
										<img
											src={heartIconFilled}
											alt="Favourite"
											className="w-5 h-5"
										/>
									) : (
										<img
											src={heartIconUnfilled}
											alt="Favourite"
											className="w-5 h-5"
										/>
									)}
								</button>
							</div>

							{/* Floating favourite button beneath artwork */}
							<button
								aria-label="Favourite floating"
								onClick={() => setFavourited(!favourited)}
								className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto bg-arcade-black text-arcade-white rounded-full p-3 shadow-lg hover:scale-105 transition-transform duration-150"
							>
								{favourited ? (
									<img
										src={heartIconFilled}
										alt="Favourite"
										className="w-6 h-6"
									/>
								) : (
									<img
										src={heartIconUnfilled}
										alt="Favourite"
										className="w-6 h-6"
									/>
								)}
							</button>
						</div>
					</div>

					{/* Game title and summary */}
					<div className="flex-col h-full w-full">
						<h1 className="text-4xl font-title mt-4">{game?.title}</h1>
						<h2 className="text-xl font-default text-gray-300 mt-2">
							<i>
								{game?.developer ?? "Unknown developer"},{" "}
								{game?.release_date?.slice(0, 4) ?? "-"}
							</i>
						</h2>
						<p className="mt-8 text-md font-default text-gray-200rounded-lg  flex-1 overflow-auto">
							{game?.summary}
						</p>
						<div className="flex-col mt-16 h-full w-full ">
							<p>
								Additional content can go here, such as screenshots, videos,
								reviews, etc.
							</p>
						</div>
						<div className="flex flex-col gap-4 mt-8 bg-arcade-black rounded-lg p-4">
							<h2 className="text-2xl font-title">Reviews</h2>
							<div className="flex justify-start">
								<button
									onClick={() => navigate(`/games/${game?.id}/add-review`)}
									className="text-arcade-white border border-arcade-white rounded px-4 py-2 hover:bg-arcade-white hover:text-arcade-black transition-colors duration-200"
								>
									Add Review
								</button>
							</div>
							{/* Placeholder review cards - replace with real data when available */}
							<div className="grid gap-4 mt-2">
								<div className="bg-arcade-black/60 rounded-lg p-3">
									<div className="text-sm font-default text-gray-300">
										User123 · 2024-01-01
									</div>
									<div className="mt-2 text-md font-default text-gray-200">
										Great game — loved the soundtrack and levels.
									</div>
								</div>
								<div className="bg-arcade-black/60 rounded-lg p-3">
									<div className="text-sm font-default text-gray-300">
										PlayerTwo · 2024-02-14
									</div>
									<div className="mt-2 text-md font-default text-gray-200">
										Challenging but rewarding. Would recommend.
									</div>
								</div>
							</div>
						</div>
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
