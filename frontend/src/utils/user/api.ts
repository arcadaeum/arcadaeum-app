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

// Steam account linking functions
export async function linkSteamAccount(
    token: string,
    apiUrl: string,
    steamId: string,
): Promise<{ success: boolean; message: string; steam_id: string }> {
    const res = await fetch(`${apiUrl}/steam/link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ steam_id: steamId }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to link Steam account");
    }

    return res.json();
}

export async function unlinkSteamAccount(
    token: string,
    apiUrl: string,
): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${apiUrl}/steam/unlink`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to unlink Steam account");
    }

    return res.json();
}

export async function getSteamAccount(
    token: string,
    apiUrl: string,
): Promise<{ steam_id: string | null; steam_username: string | null }> {
    const res = await fetch(`${apiUrl}/steam/account`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Steam account");
    }

    return res.json();
}