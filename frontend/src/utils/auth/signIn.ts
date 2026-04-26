import type { SignInSuccess } from "@/types/auth";

export async function signInWithPassword(
	usernameOrEmail: string,
	password: string,
	apiUrl: string,
): Promise<SignInSuccess> {
	const formData = new URLSearchParams();
	formData.append("username", usernameOrEmail);
	formData.append("password", password);

	const response = await fetch(`${apiUrl}/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error("Invalid credentials");
	}

	return (await response.json()) as SignInSuccess;
}

export function buildGoogleSignInUrl(apiUrl: string): string {
	return `${apiUrl}/auth/oauth/google`;
}
