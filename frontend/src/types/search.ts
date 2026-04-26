export type GameSearchResult = {
	id?: number;
	igdb_id?: number;
	title: string;
	cover_url: string | null;
	isFromIGDB?: boolean;
};

export type UserSearchResult = {
	id: number;
	username: string;
	display_name: string;
	email: string;
	profile_picture?: string | null;
};

export type SearchState<T> = {
	query: string;
	results: T[];
	isOpen: boolean;
	isLoading: boolean;
};