import { GameCard } from "@/components/game";
import type { UserCollectionGame } from "@/types/user";

type UserCollectionsRowProps = {
	collections: UserCollectionGame[];
	emptyMessage?: string;
};

export default function UserCollectionsRow({ collections, emptyMessage }: UserCollectionsRowProps) {
	return (
		<div className="w-2/3 ml-50">
			<div className="overflow-x-auto py-6 -mx-2">
				<div className="flex gap-6 px-2">
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
