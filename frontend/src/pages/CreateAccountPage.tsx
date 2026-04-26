import { useState, type SubmitEvent } from "react";
import { NavigationBar } from "@/components/ui";
import { AuthErrorAlert, AuthTextField, PasswordField } from "@/components/auth";
import {
	createAccountRequest,
	toCreateAccountPayload,
	validateCreateAccountInput,
} from "@/utils/auth";

export default function CreateAccountPage() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const backend = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8000";

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		const validationError = validateCreateAccountInput({
			email,
			username,
			password,
			confirm,
		});

		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);

		const payload = toCreateAccountPayload({
			email,
			username,
			password,
			confirm,
		});

		const result = await createAccountRequest(payload, backend);

		if (result.ok) {
			setSuccess("Account created successfully. You can now log in.");
			setEmail("");
			setUsername("");
			setPassword("");
			setConfirm("");
			setShowPassword(false);
			setShowConfirmPassword(false);
			setLoading(false);
			return;
		}

		setError(result.message);
		setLoading(false);
	};

	return (
		<>
			<NavigationBar />
			<div className="flex flex-col items-center font-title min-h-screen pt-50 px-4">
				<form
					onSubmit={handleSubmit}
					className="w-full max-w-md bg-arcade-black/80 p-8 rounded-lg border border-arcade-blue space-y-4"
				>
					<h1 className="text-2xl font-default text-center mb-2">Create Account</h1>

					<AuthTextField
						label="Email"
						type="email"
						value={email}
						onChange={setEmail}
						required
						inputId="create-account-email"
						autoComplete="email"
					/>

					<AuthTextField
						label="Username"
						type="text"
						value={username}
						onChange={setUsername}
						required
						inputId="create-account-username"
						autoComplete="username"
					/>

					<PasswordField
						label="Password"
						value={password}
						showPassword={showPassword}
						onChange={setPassword}
						onToggleMouseDown={() => setShowPassword((s) => !s)}
						onToggleMouseUp={() => setShowPassword(false)}
						onToggleMouseLeave={() => setShowPassword(false)}
						required
						inputId="create-account-password"
					/>

					<PasswordField
						label="Confirm Password"
						value={confirm}
						showPassword={showConfirmPassword}
						onChange={setConfirm}
						onToggleMouseDown={() => setShowConfirmPassword((s) => !s)}
						onToggleMouseUp={() => setShowConfirmPassword(false)}
						onToggleMouseLeave={() => setShowConfirmPassword(false)}
						required
						inputId="create-account-confirm-password"
					/>

					{error && <AuthErrorAlert error={error} />}
					{success && <div className="text-green-400">{success}</div>}

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 rounded bg-arcade-blue text-arcade-black font-semibold hover:opacity-90 disabled:opacity-60"
					>
						{loading ? "Creating..." : "Create Account"}
					</button>
				</form>
			</div>
		</>
	);
}
