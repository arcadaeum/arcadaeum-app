export type UserProfile = {
	username: string;
	email: string;
	display_name: string | null;
	profile_picture: string | null;
};

export type UserProfileWithId = UserProfile & {
	id: number;
};

export type UserFavoriteGame = {
	id: number;
	title: string;
	cover_url?: string | null;
};

export type UserStickyHeaderProps = {
	displayName: string;
	withGlow?: boolean;
};

export type LibraryEntry = {
	id: number;
	user_id: number;
	game_id: number;
	added_at?: string | null;
	status?: string | null;
	title: string;
	igdb_id: number;
	summary?: string | null;
	developer?: string | null;
	cover_url?: string | null;
	platforms?: string[] | null;
	genres?: string[] | null;
	screenshots?: string[] | null;
	release_date?: string | null;
	igdb_rating?: number | null;
	created_at?: string | null;
};
