import type { PasswordResetApiResponse } from "@/types/password";

export const validatePasswordResetInput = (newPassword: string, confirmPassword: string) => {
	if (newPassword !== confirmPassword) {
		return "Passwords do not match";
	}

	return null;
};

export const requestPasswordReset = async (email: string, apiUrl: string) => {
	const response = await fetch(`${apiUrl}/password-reset/request`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email }),
	});

	const data = (await response.json()) as PasswordResetApiResponse;

	if (response.ok) {
		return {
			ok: true as const,
			message: data.message || "Check your email for a reset link.",
		};
	}

	return {
		ok: false as const,
		message: data.detail || "Failed to send reset link.",
	};
};

export const submitPasswordReset = async (
	token: string | null,
	newPassword: string,
	apiUrl: string,
) => {
	const response = await fetch(`${apiUrl}/password-reset/reset`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token,
			new_password: newPassword,
		}),
	});

	const data = (await response.json()) as PasswordResetApiResponse;

	if (response.ok) {
		return {
			ok: true as const,
			message: "Password reset successfully! Redirecting to login...",
		};
	}

	return {
		ok: false as const,
		message: data.detail || "Reset failed",
	};
};
