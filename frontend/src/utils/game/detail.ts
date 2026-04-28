import type { Game } from "@/types/game";
import type { GameDetailReview } from "@/types/gameDetail";

export type LibraryPopupType = "success" | "error";

export const getReleaseYear = (releaseDate: string | null) => releaseDate?.slice(0, 4) ?? "-";

export const formatIgdbRating = (rating: number | null) => (rating ? rating.toFixed(1) : "—");

export const formatPlatforms = (platforms: string[] | null) => platforms?.join(", ") ?? "—";

export const getGameDetailUrl = (apiUrl: string, gameId: string | number) =>
	`${apiUrl}/games/${gameId}`;

export const getUserLibraryUrl = (apiUrl: string) => `${apiUrl}/users/me/library`;

export const getUserLibraryItemUrl = (apiUrl: string, gameId: string | number) =>
	`${apiUrl}/users/me/library/${gameId}`;

export const getLibraryPopupMessage = (
	action: "added" | "removed" | "already-exists" | "network-error",
) => {
	switch (action) {
		case "removed":
			return "Removed from your library.";
		case "already-exists":
			return "Already in your library.";
		case "network-error":
			return "Network error. Please try again.";
		case "added":
		default:
			return "Added to your library.";
	}
};

export const getLibraryPopupType = (
	action: "added" | "removed" | "already-exists" | "network-error",
): LibraryPopupType => {
	switch (action) {
		case "already-exists":
		case "network-error":
			return "error";
		case "added":
		case "removed":
		default:
			return "success";
	}
};

export const fetchGameDetail = async (apiUrl: string, gameId: string | number): Promise<Game> => {
	const response = await fetch(getGameDetailUrl(apiUrl, gameId));

	if (!response.ok) {
		throw new Error("Game not found");
	}

	return response.json();
};

export const fetchLibraryMembership = async (
	apiUrl: string,
	token: string,
	gameId: string | number,
): Promise<boolean> => {
	const response = await fetch(getUserLibraryUrl(apiUrl), {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error("Failed to fetch library");
	}

	const entries = (await response.json()) as Array<{ game_id: number }>;
	const numericGameId = Number(gameId);

	return entries.some((entry) => entry.game_id === numericGameId);
};

export const toggleLibraryMembership = async (
	apiUrl: string,
	token: string,
	gameId: string | number,
	inLibrary: boolean,
) => {
	const numericGameId = Number(gameId);
	const isRemoving = inLibrary;

	const response = await fetch(
		isRemoving ? getUserLibraryItemUrl(apiUrl, numericGameId) : getUserLibraryUrl(apiUrl),
		{
			method: isRemoving ? "DELETE" : "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: isRemoving ? undefined : JSON.stringify({ game_id: numericGameId }),
		},
	);

	return { response, isRemoving };
};

export const showLibraryPopup = ({
	message,
	type = "success",
	setLibraryPopup,
	setLibraryPopupType,
	popupTimerRef,
	durationMs = 2500,
}: {
	message: string;
	type?: LibraryPopupType;
	setLibraryPopup: (value: string | null) => void;
	setLibraryPopupType: (value: LibraryPopupType) => void;
	popupTimerRef: { current: number | null };
	durationMs?: number;
}) => {
	setLibraryPopup(message);
	setLibraryPopupType(type);

	if (popupTimerRef.current) {
		window.clearTimeout(popupTimerRef.current);
	}

	popupTimerRef.current = window.setTimeout(() => {
		setLibraryPopup(null);
	}, durationMs);
};

export const toggleLibrary = async ({
	id,
	apiUrl,
	inLibrary,
	setInLibrary,
	token,
	onRequireSignIn,
	showPopup,
}: {
	id: string | undefined;
	apiUrl: string;
	inLibrary: boolean;
	setInLibrary: (value: boolean) => void;
	token: string | null;
	onRequireSignIn: () => void;
	showPopup: (message: string, type?: LibraryPopupType) => void;
}) => {
	if (!id) return;

	if (!token) {
		onRequireSignIn();
		return;
	}

	const previousInLibrary = inLibrary;
	setInLibrary(!previousInLibrary);

	try {
		const { response, isRemoving } = await toggleLibraryMembership(
			apiUrl,
			token,
			id,
			previousInLibrary,
		);

		if (response.ok) {
			showPopup(
				getLibraryPopupMessage(isRemoving ? "removed" : "added"),
				getLibraryPopupType(isRemoving ? "removed" : "added"),
			);
			return;
		}

		setInLibrary(previousInLibrary);

		if (response.status === 409) {
			setInLibrary(true);
			showPopup(
				getLibraryPopupMessage("already-exists"),
				getLibraryPopupType("already-exists"),
			);
			return;
		}

		const errorData = await response.json().catch(() => ({}));
		const message =
			errorData.detail || `Failed to ${isRemoving ? "remove from" : "add to"} library`;
		console.error(message);
		showPopup(message, "error");
	} catch (error) {
		setInLibrary(previousInLibrary);
		console.error("Network error:", error);
		showPopup(getLibraryPopupMessage("network-error"), getLibraryPopupType("network-error"));
	}
};

export const PLACEHOLDER_REVIEWS: GameDetailReview[] = [
	{
		author: "User123",
		date: "2024-01-01",
		content: "Great game — loved the soundtrack and levels.",
	},
	{
		author: "PlayerTwo",
		date: "2024-02-14",
		content: "Challenging but rewarding. Would recommend.",
	},
];
