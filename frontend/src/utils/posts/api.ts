import type { PostPayload, SocialPost } from "@/types/posts";

const authHeaders = (token: string) => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${token}`,
});

const readPostResponse = async (response: Response): Promise<SocialPost> => {
	if (!response.ok) {
		const message = await response
			.json()
			.then((data) => data.detail)
			.catch(() => "Failed to save post");
		throw new Error(message);
	}

	return response.json();
};

export async function fetchUserPosts(
	apiUrl: string,
	userId: number,
	limit = 50,
): Promise<SocialPost[]> {
	const response = await fetch(`${apiUrl}/users/${userId}/posts?limit=${limit}`);
	if (!response.ok) {
		throw new Error("Failed to fetch posts");
	}

	return response.json();
}

export async function fetchFollowingPosts(
	apiUrl: string,
	token: string,
	limit = 10,
): Promise<SocialPost[]> {
	const response = await fetch(`${apiUrl}/users/me/feed?limit=${limit}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) {
		throw new Error("Failed to fetch feed");
	}

	return response.json();
}

export async function createPost(
	apiUrl: string,
	token: string,
	payload: PostPayload,
): Promise<SocialPost> {
	const response = await fetch(`${apiUrl}/users/me/posts`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify(payload),
	});

	return readPostResponse(response);
}

export async function updatePost(
	apiUrl: string,
	token: string,
	postId: number,
	payload: PostPayload,
): Promise<SocialPost> {
	const response = await fetch(`${apiUrl}/users/me/posts/${postId}`, {
		method: "PATCH",
		headers: authHeaders(token),
		body: JSON.stringify(payload),
	});

	return readPostResponse(response);
}

export async function deletePost(apiUrl: string, token: string, postId: number): Promise<void> {
	const response = await fetch(`${apiUrl}/users/me/posts/${postId}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error("Failed to delete post");
	}
}
