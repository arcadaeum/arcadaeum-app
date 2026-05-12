import type { ReactNode } from "react";
import type { UserProfileWithId } from "./user";

export type SettingSection =
	| "username"
	| "displayname"
	| "password"
	| "steam"
	| "bug"
	| "delete"
	| null;

export type AlertVariant = "success" | "error";

export type SettingsIconKey = "user" | "type" | "key" | "trash" | "bug" | "gamepad";

export type SettingsSectionConfig = {
	key: SettingSection;
	icon: SettingsIconKey;
	label: string;
	description: string;
	danger: boolean;
};

export type StatusAlertProps = {
	message: string;
	variant: AlertVariant;
	onDismiss: () => void;
};

export type SectionRowProps = {
	icon: ReactNode;
	label: string;
	description: string;
	active: boolean;
	danger?: boolean;
	onClick: () => void;
};

export type SettingsPanelProps = {
	token: string;
	user: UserProfileWithId;
	onStatusChange: (message: string, variant: AlertVariant) => void;
	onUserUpdate?: (user: UserProfileWithId | null) => void;
};
