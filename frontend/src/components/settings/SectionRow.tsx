import { ChevronRight } from "lucide-react";
import type { SectionRowProps } from "@/types/settings";

export default function SectionRow({
	icon,
	label,
	description,
	active,
	danger = false,
	onClick,
}: SectionRowProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center gap-3 px-4 py-3 md:gap-4 md:px-5 md:py-4 rounded-xl border transition-all duration-200 text-left group ${
				active
					? danger
						? "bg-arcade-black border-red-500/50"
						: "bg-arcade-black border-arcade-white/30"
					: "bg-arcade-black border-arcade-white/10 hover:border-arcade-white/30 hover:bg-arcade-black"
			}`}
		>
			<span
				className={`p-2 rounded-lg transition-colors ${
					active
						? danger
							? "bg-red-500/20 text-red-400"
							: "bg-arcade-blue/20 text-arcade-blue"
						: "bg-arcade-white/5 text-arcade-white/50 group-hover:text-arcade-white/80"
				}`}
			>
				{icon}
			</span>
			<div className="flex-1 min-w-0">
				<div
					className={`font-title text-sm tracking-tight ${danger ? "text-red-400" : "text-arcade-white"}`}
				>
					{label}
				</div>
				<div className="hidden sm:block text-xs font-default text-arcade-white/40 mt-0.5">
					{description}
				</div>
			</div>
			<ChevronRight
				className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
					active
						? "rotate-90 text-arcade-white/60"
						: "text-arcade-white/20 group-hover:text-arcade-white/40"
				}`}
			/>
		</button>
	);
}
