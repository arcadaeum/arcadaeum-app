type AuthErrorAlertProps = {
	error: string;
};

function AuthErrorAlert({ error }: AuthErrorAlertProps) {
	if (!error) {
		return null;
	}

	return (
		<div className="bg-arcade-white/20 border border-arcade-white text-red-200 px-4 py-3 rounded mb-4">
			{error}
		</div>
	);
}

export default AuthErrorAlert;
