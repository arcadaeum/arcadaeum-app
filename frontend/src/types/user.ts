export type UserProfile = {
	username: string;
	email: string;
	display_name: string;
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
