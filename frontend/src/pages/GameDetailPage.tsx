import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";

type Game = {
	id: string;
	title: string;
	image?: string | null;
	description?: string | null;
	developer?: string | null;
	release_date?: string | null;
};

export default function GameDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);
	const [error] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		// Need to implement games/id in backend for this to work.
		const url = `${import.meta.env.VITE_API_URL}/games/${id}`;

		// Try to fetch real data; fall back to placeholder if unavailable
		fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error("not found");
				return res.json();
			})
			.then((data) => setGame(data))
			.catch(() => {
				setGame({
					id,
					title: `Game ${id}`,
					image: `https://via.placeholder.com/800x450?text=Game+${encodeURIComponent(id)}`,
					description:
						"This is a placeholder game page. When the game API is available, real metadata and images will be shown here.",
					developer: "Unknown",
					release_date: null,
				});
			})
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) return <div>Loading game...</div>;
	if (error) return <div>{error}</div>;

	return (
		<>
			<NavigationBar />
			<div className="min-h-screen font-title px-16 pt-36 text-arcade-white">
				<button
					onClick={() => navigate(-1)}
					className="mb-4 text-sm font-default text-arcade-white border rounded px-3 py-1"
				>
					Back
				</button>

				<div className="flex gap-8 items-start">
					<div className="w-2/3 max-w-3xl">
						<img
							src={game?.image ?? undefined}
							alt={game?.title}
							className="w-full rounded-lg shadow-lg object-cover h-64"
						/>
						<h1 className="text-4xl font-title mt-4">{game?.title}</h1>
						<p className="mt-4 text-sm font-default text-gray-200">
							{game?.description}
						</p>
					</div>

					<aside className="w-1/3 max-w-xs">
						<div className="bg-arcade-black rounded-lg p-4">
							<div className="text-sm font-default text-gray-300">Developer</div>
							<div className="font-title text-arcade-white">{game?.developer}</div>
							<div className="mt-4 text-sm font-default text-gray-300">Release</div>
							<div className="font-title text-arcade-white">
								{game?.release_date ?? "—"}
							</div>
						</div>
					</aside>
				</div>
			</div>
		</>
	);
}
