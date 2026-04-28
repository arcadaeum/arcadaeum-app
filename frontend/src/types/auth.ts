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

export type PasswordFieldProps = {
	label: string;
	value: string;
	showPassword: boolean;
	onChange: (value: string) => void;
	onToggleMouseDown: () => void;
	onToggleMouseUp: () => void;
	onToggleMouseLeave: () => void;
	required?: boolean;
	inputId?: string;
	placeholder?: string;
};

export type AuthTextFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "email";
	required?: boolean;
	inputId?: string;
	placeholder?: string;
	autoComplete?: string;
};
