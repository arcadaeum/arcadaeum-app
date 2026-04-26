import { GameCard } from "@/components/game";
import type { UserFavoriteGame } from "@/types/user";

type UserFavoritesRowProps = {
	favorites: UserFavoriteGame[];
	emptyMessage?: string;
};

export default function UserFavoritesRow({
	favorites,
	emptyMessage,
}: UserFavoritesRowProps) {
	return (
		<div className="w-2/3 ml-50">
			<div className="overflow-x-auto py-6 -mx-2">
				<div className="flex gap-6 px-2">
					{favorites.length > 0 ? (
						favorites.map((g) => (
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
