import type { RefObject } from "react";
import { Pencil, UserRound } from "lucide-react";
import type { UserProfile } from "@/types/user";
import { getUserProfileImageProxyUrl } from "@/utils/user";

type UserProfileHeroProps = {
	user: UserProfile | null;
	profileRef: RefObject<HTMLDivElement | null>;
	borderColor: string;
	apiUrl: string;
	canEdit?: boolean;
	editing: boolean;
	newDisplayName: string;
	displayName: string;
	onDisplayNameChange: (value: string) => void;
	onEdit: () => void;
	onSave: () => void;
	onCancel: () => void;
};

export default function UserProfileHero({
	user,
	profileRef,
	borderColor,
	apiUrl,
	canEdit = true,
	editing,
	newDisplayName,
	displayName,
	onDisplayNameChange,
	onEdit,
	onSave,
	onCancel,
}: UserProfileHeroProps) {
	return (
		<div ref={profileRef} className="relative flex w-full overflow-visible h-64">
			<div
				className={`border-4 ${borderColor} rounded-full ml-40 relative z-10 w-64 h-64 bg-arcade-white overflow-hidden flex items-centerjustify-center shrink-0`}
			>
				{user?.profile_picture ? (
					<img
						src={getUserProfileImageProxyUrl(apiUrl, user.profile_picture)}
						alt="Profile Picture"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="flex items-center justify-center bg-arcade-black  w-64 h-64">
						<UserRound className="text-arcade-white w-32 h-32" />
					</div>
				)}
			</div>
			<div className="mt-2 pointer-events-none absolute -left-16 top-1/2 z-0 -translate-y-1/2 flex flex-col w-screen">
				<div className="h-12 w-screen mb-1 bg-arcade-white" />
				<div className="h-7 w-screen mb-1 bg-arcade-blue" />
				<div className="h-5 w-screen mb-1 bg-arcade-violet" />
				<div className="h-3 w-screen mb-1 bg-arcade-purple" />
			</div>
			<div className="relative z-10 -mt-40 self-center flex flex-col pl-10 ">
				<h1 className="text-6xl font-title text-arcade-white flex items-center gap-2 whitespace-nowrap mb-2 tracking-tighter">
					{canEdit && editing ? (
						<>
							<input
								type="text"
								value={newDisplayName}
								onChange={(e) => onDisplayNameChange(e.target.value)}
								className="border rounded px-2 py-1"
							/>
							<button
								onClick={onSave}
								className="ml-1 text-lg font-default text-arcade-white border tracking-wide rounded px-2 py-1"
							>
								Save
							</button>
							<button
								onClick={onCancel}
								className="ml-1 text-lg font-default text-arcade-white border tracking-wide rounded px-2 py-1"
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
				</h1>
			</div>
		</div>
	);
}
