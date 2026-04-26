export type CreateAccountInput = {
	email: string;
	username: string;
	password: string;
	confirm: string;
};

export type CreateAccountPayload = {
	email: string;
	username: string;
	password: string;
};

export type ErrorResponse = {
	detail?: string;
	message?: string;
};

export type SignInSuccess = {
	access_token: string;
	token_type: string;
};
