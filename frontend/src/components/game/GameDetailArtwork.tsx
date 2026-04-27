import heartIconFilled from "@/assets/images/heart-icon-filled.svg";
import heartIconUnfilled from "@/assets/images/heart-icon-unfilled.svg";
import type { Game } from "@/types/game";

type GameDetailArtworkProps = {
	game: Game | null;
	favourited: boolean;
	onToggleFavourite: () => void;
};

export default function GameDetailArtwork({
	game,
	favourited,
	onToggleFavourite,
}: GameDetailArtworkProps) {
	return (
		<div className="w-1/3 max-w-md">
			<div className="relative pb-8">
				<img
					src={game?.cover_url ?? undefined}
					alt={game?.title}
					className="shadow-lg object-cover rounded-xl h-auto w-full border-5 border-arcade-white"
				/>

				<div className="absolute inset-0 z-30 flex items-end mb-1 justify-center pointer-events-none">
					<button
						aria-label="Favourite"
						onClick={onToggleFavourite}
						className="opacity-0 pointer-events-auto text-arcade-white bg-arcade-black rounded-full p-1 transition-transform hover:scale-110 hover:opacity-100 duration-100"
					>
						{favourited ? (
							<img src={heartIconFilled} alt="Favourite" className="w-5 h-5" />
						) : (
							<img src={heartIconUnfilled} alt="Favourite" className="w-5 h-5" />
						)}
					</button>
				</div>

				<button
					aria-label="Favourite floating"
					onClick={onToggleFavourite}
					className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto bg-arcade-black text-arcade-white rounded-full p-3 shadow-lg hover:scale-105 transition-transform duration-150"
				>
					{favourited ? (
						<img src={heartIconFilled} alt="Favourite" className="w-6 h-6" />
					) : (
						<img src={heartIconUnfilled} alt="Favourite" className="w-6 h-6" />
					)}
				</button>
			</div>
		</div>
	);
}
