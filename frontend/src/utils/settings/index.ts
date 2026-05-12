import type { AlertVariant, SettingsSectionConfig } from "@/types/settings";

export const settingsSections: SettingsSectionConfig[] = [
	{
		key: "username",
		icon: "user",
		label: "Change Username",
		description: "Update the handle others use to find you",
		danger: false,
	},
	{
		key: "displayname",
		icon: "type",
		label: "Change Display Name",
		description: "Edit the name shown on your profile",
		danger: false,
	},
	{
		key: "password",
		icon: "key",
		label: "Change Password",
		description: "Update your login password",
		danger: false,
	},
	{
		key: "steam",
		icon: "gamepad",
		label: "Steam Account",
		description: "Link or unlink your Steam profile",
		danger: false,
	},
	{
		key: "bug",
		icon: "bug",
		label: "Report a Bug",
		description: "Something broken? Let us know",
		danger: false,
	},
	{
		key: "delete",
		icon: "trash",
		label: "Delete Account",
		description: "Permanently remove your account and all data",
		danger: true,
	},
];

const steamErrorMessages: Record<string, string> = {
	invalid_token: "Invalid or expired verification token",
	token_expired: "Verification token expired. Please try again.",
	verification_failed: "Steam verification failed. Please try again.",
	already_linked: "This Steam account is already linked to another user",
	link_failed: "Failed to link Steam account. Please try again.",
};

export function getSteamStatusFromSearchParams(
	searchParams: URLSearchParams,
): { message: string; variant: AlertVariant } | null {
	if (searchParams.has("steam_success")) {
		return {
			message: "Steam account linked successfully!",
			variant: "success",
		};
	}

	if (!searchParams.has("steam_error")) {
		return null;
	}

	const errorCode = searchParams.get("steam_error") ?? "";
	return {
		message: steamErrorMessages[errorCode] || "Steam verification failed",
		variant: "error",
	};
}
