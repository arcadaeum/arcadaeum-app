const apiUrl = import.meta.env.VITE_API_URL as string;

export interface SteamLinkResponse {
	success: boolean;
	message: string;
	steam_id?: string;
}

export interface SteamUnlinkResponse {
	success: boolean;
	message: string;
}

/**
 * Link a Steam account to the user's Arcadaeum account
 * @param steamUrl - Steam ID, Steam URL, or Steam vanity URL
 * @param token - Authentication token
 */
export async function linkSteamAccount(
	steamUrl: string,
	token: string,
): Promise<SteamLinkResponse> {
	const response = await fetch(`${apiUrl}/steam/link`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			steam_id: steamUrl,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || "Failed to link Steam account");
	}

	return response.json();
}

/**
 * Unlink the Steam account from the user's Arcadaeum account
 * @param token - Authentication token
 */
export async function unlinkSteamAccount(token: string): Promise<SteamUnlinkResponse> {
	const response = await fetch(`${apiUrl}/steam/unlink`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.detail || "Failed to unlink Steam account");
	}

	return response.json();
}
