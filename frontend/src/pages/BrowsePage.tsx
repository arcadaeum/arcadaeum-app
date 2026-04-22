import ColorBends from "../components/ColorBends";
import NavigationBar from "../components/NavigationBar";
import GameCard from "../components/GameCard";
import { useEffect, useState } from "react";

function BrowsePage() {
	type Game = {
		id: number;
		title: string;
		cover_url?: string | null;
	};

	const [games, setGames] = useState<Game[]>([]);

	// Get games from the URL, This needs to be changed to get favourites instead of popular.
	useEffect(() => {
		const url = import.meta.env.VITE_API_URL;

		// Stores the data from the game api into the favorites state.
		fetch(`${url}/games`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch games");
				return res.json();
			})
			.then((data: Game[]) => setGames(data))
			.catch(() => setGames([]));
	}, []);

	return (
		<>
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
			<NavigationBar />

			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16">
				<h1
					className="w-full mt-25 text-2xl font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Browse
				</h1>
				<p className="mt-4 text-sm font-default text-gray-200">
					Discover new games and explore your library.
				</p>
				<div className="w-full max-w-7xl mx-auto px-4 py-6">
					{" "}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{" "}
						{games.map((game) => (
							<GameCard
								key={game.id}
								id={game.id}
								title={game.title}
								image={game.cover_url}
							/>
						))}{" "}
					</div>{" "}
				</div>
			</div>
		</>
	);
}

export default BrowsePage;
