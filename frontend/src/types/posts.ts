export type SocialPost = {
	id: number;
	user_id: number;
	content: string;
	created_at?: string | null;
	updated_at?: string | null;
	username: string;
	display_name?: string | null;
	profile_picture?: string | null;
};

export type PostPayload = {
	content: string;
};
