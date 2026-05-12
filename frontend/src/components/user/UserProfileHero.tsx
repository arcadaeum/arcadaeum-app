import type { RefObject } from "react";
import { Pencil, UserRound } from "lucide-react";
import type { UserProfile } from "@/types/user";
import { getUserProfileImageProxyUrl } from "@/utils/user";
import { MainButton } from "@/components/ui";

type UserProfileHeroProps = {
	user: UserProfile | null;
	profileRef: RefObject<HTMLDivElement | null>;
	borderColor: string;
	apiUrl: string;
	className?: string;
	canEdit?: boolean;
	editing: boolean;
	newDisplayName: string;
	displayName: string;
	onDisplayNameChange: (value: string) => void;
	onEdit: () => void;
	onSave: () => void;
	onCancel: () => void;
	isFollowing?: boolean;
	followLoading?: boolean;
	onFollowToggle?: () => void;
};

export default function UserProfileHero({
	user,
	profileRef,
	borderColor,
	apiUrl,
	className,
	canEdit = true,
	editing,
	newDisplayName,
	displayName,
	onDisplayNameChange,
	onEdit,
	onSave,
	onCancel,
	isFollowing = false,
	followLoading = false,
	onFollowToggle,
}: UserProfileHeroProps) {
	return (
		<div
			ref={profileRef}
			className={`relative flex h-64 w-full overflow-visible max-sm:h-auto max-sm:flex-col max-sm:items-center ${className ?? ""}`}
		>
			<div
				className={`border-4 ${borderColor} relative z-10 ml-40 flex h-64 w-64 shrink-0 items-center justify-center overflow-hidden rounded-full bg-arcade-white max-sm:ml-0 max-sm:h-40 max-sm:w-40`}
			>
				{user?.profile_picture ? (
					<img
						src={getUserProfileImageProxyUrl(apiUrl, user.profile_picture)}
						alt="Profile Picture"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="flex h-64 w-64 items-center justify-center bg-arcade-black max-sm:h-40 max-sm:w-40">
						<UserRound className="text-arcade-white w-32 h-32" />
					</div>
				)}
			</div>
			<div className="pointer-events-none absolute -left-16 top-1/2 z-0 mt-2 flex w-screen -translate-y-1/2 flex-col max-sm:hidden">
				<div className="h-12 w-screen mb-1 bg-arcade-white" />
				<div className="h-7 w-screen mb-1 bg-arcade-blue" />
				<div className="h-5 w-screen mb-1 bg-arcade-violet" />
				<div className="h-3 w-screen mb-1 bg-arcade-purple" />
			</div>
			<div className="relative z-10 -mt-40 flex flex-col self-center pl-10 max-sm:mt-0 max-sm:w-full max-sm:pl-0 max-sm:text-center">
				<h1 className="mb-2 flex items-center gap-2 whitespace-nowrap text-6xl tracking-tighter font-title text-arcade-white max-sm:flex-wrap max-sm:justify-center max-sm:whitespace-normal max-sm:text-3xl max-sm:leading-tight">
					{canEdit && editing ? (
						<>
							<input
								type="text"
								value={newDisplayName}
								onChange={(e) => onDisplayNameChange(e.target.value)}
								className="border rounded px-2 py-1 max-sm:w-full"
							/>
							<button
								onClick={onSave}
								className="ml-1 text-lg font-default text-arcade-white border tracking-wide rounded px-2 py-1 max-sm:ml-0 max-sm:text-sm"
							>
								Save
							</button>
							<button
								onClick={onCancel}
								className="ml-1 text-lg font-default text-arcade-white border tracking-wide rounded px-2 py-1 max-sm:ml-0 max-sm:text-sm"
							>
								Cancel
							</button>
						</>
					) : (
						<>
							{displayName}
							{canEdit && (
								<button onClick={onEdit} className="ml-2" title="Edit display name">
									<Pencil />
								</button>
							)}
						</>
					)}
					{!canEdit && (
						<MainButton
							text={isFollowing ? "UNFOLLOW" : "FOLLOW"}
							className="ml-3 px-3 py-1 font-secondary text-sm tracking-wider max-sm:ml-0"
							onClick={onFollowToggle}
							disabled={followLoading || !onFollowToggle}
						/>
					)}
				</h1>
			</div>
		</div>
	);
}
