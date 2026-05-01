import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ColorBends, NavigationBar } from "@/components/ui";
import { AuthErrorAlert, AuthTextField, PasswordField } from "@/components/auth";
import {
	createAccountRequest,
	signInWithPassword,
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
	const navigate = useNavigate();

	const backend = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8000";
	const apiUrl = (import.meta.env.VITE_API_URL as string) || backend;

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
			try {
				const data = await signInWithPassword(email, password, apiUrl);
				localStorage.setItem("access_token", data.access_token);
				setLoading(false);
				navigate("/user");
				return;
			} catch {
				setError("Account created, but auto sign-in failed. Please sign in.");
				setLoading(false);
				return;
			}
		}

		setError(result.message);
		setLoading(false);
	};

	return (
		<>
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90"
				rotation={32}
				colors={["#8122c0", "#5647f1", "#37b0ea"]}
				speed={0.2}
				scale={2}
				frequency={1}
				warpStrength={1}
				mouseInfluence={1}
				parallax={0.5}
				noise={0.1}
				transparent
				autoRotate={0}
			/>
			<NavigationBar />
			<div className="flex flex-col items-center font-title min-h-screen pt-50 px-4">
				<form
					onSubmit={handleSubmit}
					className="w-full max-w-md bg-arcade-black p-8 rounded-lg space-y-4"
				>
					<h1 className="text-2xl font-title text-center mb-2">Create Account</h1>

					<AuthTextField
						label="Email"
						type="email"
						value={email}
						onChange={setEmail}
						required
						inputId="create-account-email"
						autoComplete="email"
						fontClass="font-title"
					/>

					<AuthTextField
						label="Username"
						type="text"
						value={username}
						onChange={setUsername}
						required
						inputId="create-account-username"
						autoComplete="username"
						fontClass="font-title"
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
						fontClass="font-title"
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
						fontClass="font-title"
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
