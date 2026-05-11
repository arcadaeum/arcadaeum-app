import type { Collection, CreateCollectionRequest } from "@/types/collections";
import type { Game } from "@/types/game";

const getCollectionsUrl = (apiUrl: string) => `${apiUrl}/users/me/collections`;
const getUserCollectionsUrl = (apiUrl: string, userId: string | number) =>
	`${apiUrl}/users/${userId}/collections`;
const getCollectionUrl = (apiUrl: string, collectionId: number) =>
	`${apiUrl}/users/me/collections/${collectionId}`;
const getCollectionGamesUrl = (apiUrl: string, collectionId: number) =>
	`${apiUrl}/users/me/collections/${collectionId}/games`;
const getUserCollectionGamesUrl = (
	apiUrl: string,
	userId: string | number,
	collectionId: number,
) => `${apiUrl}/users/${userId}/collections/${collectionId}/games`;
const getCollectionGameUrl = (apiUrl: string, collectionId: number, gameId: number) =>
	`${apiUrl}/users/me/collections/${collectionId}/games/${gameId}`;

export async function fetchCollections(apiUrl: string, token: string): Promise<Collection[]> {
	const res = await fetch(getCollectionsUrl(apiUrl), {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		throw new Error("Failed to fetch collections");
	}

	return res.json();
}

export async function fetchUserCollections(
	apiUrl: string,
	userId: string | number,
): Promise<Collection[]> {
	const res = await fetch(getUserCollectionsUrl(apiUrl, userId));

	if (!res.ok) {
		throw new Error("Failed to fetch collections");
	}

	return res.json();
}

export async function createCollection(
	apiUrl: string,
	token: string,
	request: CreateCollectionRequest,
): Promise<Collection> {
	const res = await fetch(getCollectionsUrl(apiUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(request),
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to create collection");
	}

	return res.json();
}

export async function renameCollection(
	apiUrl: string,
	token: string,
	collectionId: number,
	name: string,
): Promise<Collection> {
	const res = await fetch(getCollectionUrl(apiUrl, collectionId), {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ name }),
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to rename collection");
	}

	return res.json();
}

export async function deleteCollection(
	apiUrl: string,
	token: string,
	collectionId: number,
): Promise<void> {
	const res = await fetch(getCollectionUrl(apiUrl, collectionId), {
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to delete collection");
	}
}

export async function fetchCollectionGames(
	apiUrl: string,
	token: string,
	collectionId: number,
): Promise<Game[]> {
	const res = await fetch(getCollectionGamesUrl(apiUrl, collectionId), {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		throw new Error("Failed to fetch collection games");
	}

	return res.json();
}

export async function fetchUserCollectionGames(
	apiUrl: string,
	userId: string | number,
	collectionId: number,
): Promise<Game[]> {
	const res = await fetch(getUserCollectionGamesUrl(apiUrl, userId, collectionId));

	if (!res.ok) {
		throw new Error("Failed to fetch collection games");
	}

	return res.json();
}

export async function addGameToCollection(
	apiUrl: string,
	token: string,
	collectionId: number,
	gameId: number,
): Promise<{ id: number; collection_id: number; game_id: number }> {
	const res = await fetch(getCollectionGamesUrl(apiUrl, collectionId), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ game_id: gameId }),
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to add game to collection");
	}

	return res.json();
}

export async function removeGameFromCollection(
	apiUrl: string,
	token: string,
	collectionId: number,
	gameId: number,
): Promise<void> {
	const res = await fetch(getCollectionGameUrl(apiUrl, collectionId, gameId), {
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to remove game from collection");
	}
}
