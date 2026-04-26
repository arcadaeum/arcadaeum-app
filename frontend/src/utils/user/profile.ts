import type { UserProfile } from "../../types/user";

const PROFILE_BORDER_COLORS = [
	"border-arcade-blue",
	"border-arcade-violet",
	"border-arcade-white",
	"border-arcade-purple",
] as const;

export const getUserDisplayName = (user: UserProfile | null, fallback = "") =>
	user?.display_name ?? user?.username ?? fallback;

export const getUserProfileBorderColor = (user: UserProfile | null) => {
	const colorKey = user?.username ?? user?.display_name ?? "";
	return PROFILE_BORDER_COLORS[
		colorKey ? colorKey.charCodeAt(0) % PROFILE_BORDER_COLORS.length : 0
	];
};

export const getUserProfileImageProxyUrl = (apiUrl: string, profilePictureUrl: string) =>
	`${apiUrl}/proxy/profile-image?url=${encodeURIComponent(profilePictureUrl)}`;
