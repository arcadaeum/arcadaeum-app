import type { UserProfileWithId } from "@/types/user";
import type { Game } from "@/types/game";

export async function fetchUser(token: string, apiUrl: string): Promise<UserProfileWithId> {
	const res = await fetch(`${apiUrl}/me`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		throw new Error("Unauthorized");
	}

	return res.json();
}

export async function fetchFavorites(apiUrl: string): Promise<Game[]> {
	const res = await fetch(`${apiUrl}/games`);

	if (!res.ok) {
		throw new Error("Failed to fetch games");
	}

	return res.json();
}

export async function updateDisplayName(
	token: string,
	apiUrl: string,
	displayName: string,
): Promise<UserProfileWithId> {
	const res = await fetch(`${apiUrl}/me`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ display_name: displayName }),
	});

	if (!res.ok) {
		throw new Error("Failed to update display name");
	}

	return res.json();
}
