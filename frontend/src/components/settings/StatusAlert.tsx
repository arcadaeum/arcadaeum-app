import { AlertTriangle, Check, X } from "lucide-react";
import type { StatusAlertProps } from "@/types/settings";

export default function StatusAlert({ message, variant, onDismiss }: StatusAlertProps) {
	if (!message) return null;

	const isError = variant === "error";

	return (
		<div
			className={`flex items-start gap-3 px-4 py-3 rounded-lg border mb-5 text-sm font-default ${
				isError
					? "bg-black border-red-500/40 text-red-300"
					: "bg-black border-green-500/40 text-green-300"
			}`}
		>
			{isError ? (
				<AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
			) : (
				<Check className="w-4 h-4 mt-0.5 shrink-0" />
			)}
			<span className="flex-1">{message}</span>
			<button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
				<X className="w-4 h-4" />
			</button>
		</div>
	);
}
