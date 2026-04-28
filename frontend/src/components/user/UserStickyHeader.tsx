import type { UserStickyHeaderProps } from "@/types/user";

export default function UserStickyHeader({ displayName, withGlow = false }: UserStickyHeaderProps) {
	return (
		<div className="fixed top-0 left-0 w-full z-50 bg-arcade-black opacity-100">
			<div className="flex items-center gap-4 px-16 py-3">
				<span
					className="text-xl font-title text-arcade-white tracking-tighter"
					style={withGlow ? { textShadow: "0 0 3px #fefddc" } : undefined}
				>
					{displayName}
				</span>
			</div>
			<div className="flex h-1">
				<div className="flex-1 bg-arcade-white" />
				<div className="flex-1 bg-arcade-blue" />
				<div className="flex-1 bg-arcade-violet" />
				<div className="flex-1 bg-arcade-purple" />
			</div>
		</div>
	);
}
