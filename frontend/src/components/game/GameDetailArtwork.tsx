import { useEffect, useRef, useState } from "react";
import addIcon from "@/assets/images/add-icon.svg";
import heartIconFilled from "@/assets/images/heart-icon-filled.svg";
import heartIconUnfilled from "@/assets/images/heart-icon-unfilled.svg";
import removeIcon from "@/assets/images/remove-icon.svg";
import type { Game } from "@/types/game";
import CollectionPickerModal from "./CollectionPickerModal";

type GameDetailArtworkProps = {
	game: Game | null;
	favourited: boolean;
	inLibrary: boolean;
	isCurrentlyPlaying: boolean;
	onToggleFavourite: () => void | Promise<boolean>;
	onToggleLibrary?: () => void;
	onToggleCurrentlyPlaying?: () => void | Promise<void>;
	apiUrl: string;
};

export default function GameDetailArtwork({
	game,
	favourited,
	inLibrary,
	isCurrentlyPlaying,
	onToggleFavourite,
	onToggleLibrary,
	onToggleCurrentlyPlaying,
	apiUrl,
}: GameDetailArtworkProps) {
	const token = localStorage.getItem("access_token");
	const isAuthenticated = token ? true : false;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const [actionMessage, setActionMessage] = useState<string | null>(null);
	const actionTimerRef = useRef<number | null>(null);

	const [isPickerOpen, setIsPickerOpen] = useState(false);

	const handleOpenPicker = () => {
		setIsMenuOpen(false);
		setIsPickerOpen(true);
	};

	const handleToggleLibrary = () => {
		setIsMenuOpen(false);
		onToggleLibrary?.();
		setActionMessage(inLibrary ? "Removed from library" : "Added to library");
	};

	const handleToggleFavourite = async () => {
		setIsMenuOpen(false);
		const success = await onToggleFavourite();
		if (success !== false) {
			setActionMessage(favourited ? "Removed from favorites" : "Added to favorites");
		}
	};

	const handleToggleCurrentlyPlaying = async () => {
		setIsMenuOpen(false);
		await onToggleCurrentlyPlaying?.();
		setActionMessage(
			isCurrentlyPlaying ? "Cleared currently playing" : "Set as currently playing",
		);
	};

	const favouritesIcon = favourited ? heartIconFilled : heartIconUnfilled;
	const libraryIcon = inLibrary ? removeIcon : addIcon;
	const currentlyPlayingIcon = isCurrentlyPlaying ? removeIcon : addIcon;
	const menuLabel = isMenuOpen ? "Close actions" : "Open actions";

	useEffect(() => {
		if (actionTimerRef.current) {
			window.clearTimeout(actionTimerRef.current);
		}
		if (actionMessage) {
			actionTimerRef.current = window.setTimeout(() => {
				setActionMessage(null);
				actionTimerRef.current = null;
			}, 2000);
		}

		return () => {
			if (actionTimerRef.current) {
				window.clearTimeout(actionTimerRef.current);
			}
		};
	}, [actionMessage]);

	useEffect(() => {
		if (!isMenuOpen) return;

		const handleClick = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (menuRef.current && target && !menuRef.current.contains(target)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClick);
		return () => {
			document.removeEventListener("mousedown", handleClick);
		};
	}, [isMenuOpen]);
	return (
		<div className="w-1/3 max-w-md max-sm:w-full max-sm:max-w-none">
			<div className="relative">
				<img
					src={game?.cover_url ?? undefined}
					alt={game?.title}
					className="shadow-lg object-cover rounded-xl h-auto w-full border-5 border-arcade-white max-sm:mx-auto max-sm:max-h-[70vh] max-sm:w-auto max-sm:max-w-full"
				/>

				{/* This should be refactored into a component once the style is finalised @FRED */}
				{isAuthenticated && (
					<div className="mt-4">
						<div className="flex items-center justify-center">
							<div className="relative" ref={menuRef}>
								<button
									type="button"
									aria-expanded={isMenuOpen}
									aria-label={menuLabel}
									onClick={() => setIsMenuOpen((prev) => !prev)}
									className="rounded-full border border-arcade-white/40 bg-arcade-black p-2 transition-colors hover:border-arcade-white"
								>
									<img src={addIcon} alt="Open actions" className="h-5 w-5" />
								</button>
								{isMenuOpen && (
									<div className="absolute left-1/2 z-10 mt-2 w-48 -translate-x-1/2 rounded-lg border border-arcade-white/20 bg-arcade-black/95 shadow-lg max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:w-auto max-sm:translate-x-0">
										<button
											type="button"
											onClick={handleToggleFavourite}
											className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-arcade-white hover:bg-arcade-white/10"
										>
											<img src={favouritesIcon} alt="" className="h-4 w-4" />
											<span>
												{favourited ? "Remove from " : "Add to "}
												<span className="text-arcade-violet">
													Favorites
												</span>
											</span>
										</button>
										<div className="h-px bg-arcade-white/10" />
										<button
											type="button"
											onClick={handleToggleLibrary}
											className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-arcade-white hover:bg-arcade-white/10"
										>
											<img src={libraryIcon} alt="" className="h-4 w-4" />
											<span>
												{inLibrary ? "Remove from " : "Add to "}
												<span className="text-arcade-violet">Library</span>
											</span>
										</button>
										{inLibrary && onToggleCurrentlyPlaying && (
											<>
												<div className="h-px bg-arcade-white/10" />
												<button
													type="button"
													onClick={handleToggleCurrentlyPlaying}
													className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-arcade-white hover:bg-arcade-white/10"
												>
													<img
														src={currentlyPlayingIcon}
														alt=""
														className="h-4 w-4"
													/>
													<span>
														{isCurrentlyPlaying ? "Clear " : "Set as "}
														<span className="text-arcade-violet">
															Currently Playing
														</span>
													</span>
												</button>
											</>
										)}
										<div className="h-px bg-arcade-white/10" />
										<button
											type="button"
											onClick={handleOpenPicker}
											className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-arcade-white hover:bg-arcade-white/10"
										>
											<img src={addIcon} alt="" className="h-4 w-4" />
											<span>
												Add to{" "}
												<span className="text-arcade-violet">
													Collection
												</span>
											</span>
										</button>
									</div>
								)}
							</div>
						</div>
						{actionMessage && (
							<div className="mt-2 text-center text-xs text-arcade-white/80">
								{actionMessage}
							</div>
						)}
					</div>
				)}
			</div>
			{game && (
				<CollectionPickerModal
					apiUrl={apiUrl}
					gameId={game.id}
					isOpen={isPickerOpen}
					onClose={() => setIsPickerOpen(false)}
				/>
			)}
		</div>
	);
}
