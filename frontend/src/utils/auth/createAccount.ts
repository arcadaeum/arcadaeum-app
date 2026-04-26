import type { CreateAccountInput, CreateAccountPayload, ErrorResponse } from "../../types/auth";

export function validateCreateAccountInput(input: CreateAccountInput): string | null {
	const { email, username, password, confirm } = input;

	if (!email || !username || !password || !confirm) {
		return "All fields are required.";
	}

	if (!/\S+@\S+\.\S+/.test(email)) {
		return "Invalid email address.";
	}

	if (password.length < 6) {
		return "Password must be at least 6 characters.";
	}

	if (password !== confirm) {
		return "Passwords do not match.";
	}

	return null;
}

export function toCreateAccountPayload(input: CreateAccountInput): CreateAccountPayload {
	return {
		email: input.email,
		username: input.username,
		password: input.password,
	};
}

export async function createAccountRequest(
	payload: CreateAccountPayload,
	backendUrl: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
	try {
		const response = await fetch(`${backendUrl}/users/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (response.ok) {
			return { ok: true };
		}

		const data = (await response.json().catch(() => ({}))) as ErrorResponse;
		return {
			ok: false,
			message: data.detail || data.message || "Failed to create account.",
		};
	} catch (error) {
		return {
			ok: false,
			message: `${String(error)}: Is the backend running?`,
		};
	}
}
