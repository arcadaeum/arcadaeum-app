import type { ReactNode } from "react";

export type PasswordResetApiResponse = {
	message?: string;
	detail?: string;
};

export type PasswordStatusAlertProps = {
	message: string;
	variant: "error" | "success";
};

export type PasswordPageLayoutProps = {
	title?: string;
	description?: string;
	children: ReactNode;
};
