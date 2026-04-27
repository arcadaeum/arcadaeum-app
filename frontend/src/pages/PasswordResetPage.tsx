import { useState, type SubmitEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PasswordField } from "@/components/auth";
import { PasswordPageLayout, PasswordStatusAlert } from "@/components/password";
import { submitPasswordReset, validatePasswordResetInput } from "@/utils/password";

export default function PasswordResetPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const token = searchParams.get("token");
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const handleReset = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const validationError = validatePasswordResetInput(newPassword, confirmPassword);
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);
		setError("");
		setMessage("");

		try {
			const result = await submitPasswordReset(token, newPassword, apiUrl);
			if (result.ok) {
				setMessage(result.message);
				setTimeout(() => navigate("/signin"), 2000);
			} else {
				setError(result.message);
			}
		} catch {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<PasswordPageLayout>
				<div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded text-center">
					Invalid reset link. Please request a new one.
				</div>
				<div className="mt-6 text-center">
					<button
						onClick={() => navigate("/forgot-password")}
						className="text-arcade-blue hover:text-arcade-white text-sm font-kilimanjaro transition-colors"
					>
						Request new reset link
					</button>
				</div>
			</PasswordPageLayout>
		);
	}

	return (
		<PasswordPageLayout title="Reset Password" description="Enter your new password below.">
			<PasswordStatusAlert message={error} variant="error" />
			<PasswordStatusAlert message={message} variant="success" />

			<form onSubmit={handleReset} className="space-y-4">
				<PasswordField
					label="New Password"
					value={newPassword}
					showPassword={showNewPassword}
					onChange={setNewPassword}
					onToggleMouseDown={() => setShowNewPassword((s) => !s)}
					onToggleMouseUp={() => setShowNewPassword(false)}
					onToggleMouseLeave={() => setShowNewPassword(false)}
					required
					placeholder="Enter new password"
					inputId="reset-password-new"
				/>

				<PasswordField
					label="Confirm Password"
					value={confirmPassword}
					showPassword={showConfirmPassword}
					onChange={setConfirmPassword}
					onToggleMouseDown={() => setShowConfirmPassword((s) => !s)}
					onToggleMouseUp={() => setShowConfirmPassword(false)}
					onToggleMouseLeave={() => setShowConfirmPassword(false)}
					required
					placeholder="Confirm new password"
					inputId="reset-password-confirm"
				/>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-arcade-blue text-arcade-black font-default py-3 rounded-full hover:bg-arcade-blue/90 transition-colors disabled:opacity-50"
				>
					{loading ? "Resetting..." : "Reset Password"}
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
