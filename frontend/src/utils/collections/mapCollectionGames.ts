import type { Game } from "@/types/game";
import type { UserCollectionGame } from "@/types/user";

export const mapCollectionGames = (games: Game[]): UserCollectionGame[] =>
	games.map((g) => ({
		id: g.id,
		title: g.title ?? "",
		cover_url: g.cover_url ?? null,
	}));
