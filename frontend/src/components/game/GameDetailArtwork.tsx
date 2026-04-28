import heartIconFilled from "@/assets/images/heart-icon-filled.svg";
import heartIconUnfilled from "@/assets/images/heart-icon-unfilled.svg";
import addIcon from "@/assets/images/add-icon.svg";
import removeIcon from "@/assets/images/remove-icon.svg";
import type { Game } from "@/types/game";

type GameDetailArtworkProps = {
	game: Game | null;
	favourited: boolean;
	inLibrary: boolean;
	onToggleFavourite: () => void;
	onToggleLibrary?: () => void;
	libraryPopupMessage?: string | null;
	libraryPopupType?: "success" | "error";
};

export default function GameDetailArtwork({
	game,
	favourited,
	inLibrary,
	onToggleFavourite,
	onToggleLibrary,
	libraryPopupMessage,
	libraryPopupType = "success",
}: GameDetailArtworkProps) {
	const token = localStorage.getItem("access_token");
	const isAuthenticated = token ? true : false;

	return (
		<div className="w-1/3 max-w-md">
			<div className="relative">
				<img
					src={game?.cover_url ?? undefined}
					alt={game?.title}
					className="shadow-lg object-cover rounded-xl h-auto w-full border-5 border-arcade-white"
				/>

				{/* This should be refactored into a component once the style is finalised @FRED */}
				{isAuthenticated && (
					<div className="mt-4">
						<div className="flex items-center justify-center gap-4">
							<button
								aria-label="Library"
								onClick={onToggleLibrary}
								className="text-arcade-white bg-arcade-black rounded-full p-2 transition-transform hover:scale-110 duration-100"
							>
								{inLibrary ? (
									<img
										src={removeIcon}
										alt="Remove from library"
										className="w-5 h-5"
									/>
								) : (
									<img src={addIcon} alt="Add to library" className="w-5 h-5" />
								)}
							</button>
							<button
								aria-label="Favourite"
								onClick={onToggleFavourite}
								className="text-arcade-white bg-arcade-black rounded-full p-2 transition-transform hover:scale-110 duration-100"
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
						{libraryPopupMessage && (
							<div
								className={`mt-3 text-center text-sm ${
									libraryPopupType === "error"
										? "text-red-300"
										: "text-arcade-white"
								}`}
								role="status"
								aria-live="polite"
							>
								{libraryPopupMessage}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
