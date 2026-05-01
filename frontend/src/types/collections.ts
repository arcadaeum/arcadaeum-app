export type Collection = {
	id: number;
	user_id: number;
	name: string;
	is_default: boolean;
	created_at: string | null;
};

export type CollectionGame = {
	id: number;
	collection_id: number;
	game_id: number;
	added_at: string | null;
};

export type CreateCollectionRequest = {
	name: string;
};

export type RenameCollectionRequest = {
	name: string;
};

export type AddGameToCollectionRequest = {
	game_id: number;
};
