// src/utils/user/settings.ts

const API_URL = import.meta.env.VITE_API_URL;

export interface UserProfile {
	id: number;
	username: string;
	email: string;
	display_name?: string;
	profile_picture?: string;
	oauth_provider?: string;
}

export async function changeUsername(
	token: string,
	newUsername: string,
	password: string,
): Promise<UserProfile> {
	const res = await fetch(`${API_URL}/me/username`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ new_username: newUsername, password }),
	});
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to change username");
	}
	return res.json();
}

export async function changeDisplayName(token: string, displayName: string): Promise<UserProfile> {
	const res = await fetch(`${API_URL}/me`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ display_name: displayName }),
	});
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to change display name");
	}
	return res.json();
}

export async function changePassword(
	token: string,
	oldPassword: string,
	newPassword: string,
): Promise<void> {
	const res = await fetch(`${API_URL}/me/password`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
	});
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to change password");
	}
}

export async function deleteAccount(token: string, password: string): Promise<void> {
	const res = await fetch(`${API_URL}/me`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ password }),
	});
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to delete account");
	}
}

export async function submitBugReport(
	token: string,
	title: string,
	description: string,
): Promise<void> {
	const res = await fetch(`${API_URL}/me/bug-reports`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ title, description }),
	});
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.detail || "Failed to submit bug report");
	}
}
