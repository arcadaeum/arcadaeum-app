import type { PasswordStatusAlertProps } from "@/types/password";

export default function PasswordStatusAlert({ message, variant }: PasswordStatusAlertProps) {
	if (!message) {
		return null;
	}

	const className =
		variant === "error"
			? "bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4"
			: "bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded mb-4";

	return <div className={className}>{message}</div>;
}
