import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AuthTextField } from "@/components/auth";
import { PasswordPageLayout, PasswordStatusAlert } from "@/components/password";
import { requestPasswordReset } from "@/utils/password";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const result = await requestPasswordReset(email, apiUrl);
			if (result.ok) {
				setMessage(result.message);
				setEmail("");
			} else {
				setError(result.message);
			}
		} catch {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<PasswordPageLayout
			title="Reset Password"
			description="Enter your email to receive a password reset link."
		>
			<PasswordStatusAlert message={error} variant="error" />
			<PasswordStatusAlert message={message} variant="success" />

			<form onSubmit={handleSubmit} className="space-y-4">
				<AuthTextField
					label="Email Address"
					type="email"
					value={email}
					onChange={setEmail}
					required
					placeholder="Enter your email"
					inputId="forgot-password-email"
				/>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-arcade-blue text-arcade-black font-default py-3 rounded-full hover:bg-arcade-blue/90 transition-colors disabled:opacity-50"
				>
					{loading ? "Sending..." : "Send Reset Link"}
				</button>
			</form>

			<div className="mt-6 text-center">
				<button
					type="button"
					onClick={() => navigate("/signin")}
					className="text-arcade-blue hover:text-arcade-white text-sm font-kilimanjaro transition-colors"
				>
					Back to Sign In
				</button>
			</div>
		</PasswordPageLayout>
	);
}
