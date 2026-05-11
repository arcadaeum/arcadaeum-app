import { GameCard } from "@/components/game";
import type { UserCollectionGame } from "@/types/user";

type UserCollectionsRowProps = {
	collections: UserCollectionGame[];
	emptyMessage?: string;
	className?: string;
};

export default function UserCollectionsRow({
	collections,
	emptyMessage,
	className,
}: UserCollectionsRowProps) {
	return (
		<div className={`w-2/3 ml-50 max-sm:ml-0 max-sm:w-full ${className ?? ""}`}>
			<div className="-mx-2 overflow-x-auto py-6 max-sm:-mx-1 max-sm:py-4">
				<div className="flex gap-6 px-2 max-sm:gap-3 max-sm:px-1">
					{collections.length > 0 ? (
						collections.map((g) => (
							<GameCard key={g.id} id={g.id} title={g.title} image={g.cover_url} />
						))
					) : emptyMessage ? (
						<p className="text-gray-400">{emptyMessage}</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
