import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import ColorBends from "../components/ColorBends";
import pngLogo from "../assets/images/LOGO_PURPLE.png";

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

	const handleReset = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/password-reset/reset`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					token,
					new_password: newPassword,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage("Password reset successfully! Redirecting to login...");
				setTimeout(() => navigate("/signin"), 2000);
			} else {
				setError(data.detail || "Reset failed");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
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
				<NavigationBar isSignInPage={true} />
				<div className="flex flex-col items-center justify-center font-title min-h-1/2 pt-20 px-4">
					<div className="w-full max-w-md bg-arcade-black p-8 shadow-lg">
						<div className="flex justify-center mb-6">
							<img
								src={pngLogo}
								alt="Arcadaeum logo"
								className="w-20 h-20 object-contain rounded-xl p-1"
							/>
						</div>
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
					</div>
				</div>
			</>
		);
	}

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

			<NavigationBar isSignInPage={true} />
			<div className="flex flex-col items-center justify-center font-title min-h-1/2 pt-20 px-4">
				<div className="w-full max-w-md bg-arcade-black p-8 shadow-lg">
					<div className="flex justify-center">
						<img
							src={pngLogo}
							alt="Arcadaeum logo"
							className="w-20 h-20 mb-6 mx-auto object-contain rounded-xl p-1"
						/>
					</div>
					<h1 className="text-4xl font-title tracking-tighter text-arcade-white bg-arcade-black mb-2 text-center">
						Reset Password
					</h1>
					<p className="text-arcade-white/70 text-center mb-6 text-sm font-secondary">
						Enter your new password below.
					</p>

					{error && (
						<div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					{message && (
						<div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
							{message}
						</div>
					)}

					<form onSubmit={handleReset} className="space-y-4">
						<div>
							<label className="block text-arcade-white font-kilimanjaro mb-2">
								New Password
							</label>
							<div className="relative">
								<input
									type={showNewPassword ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="w-full px-4 py-2 pr-10 bg-arcade-white text-arcade-black font-kilimanjaro rounded border border-arcade-blue/50 focus:border-arcade-blue focus:outline-none"
									placeholder="Enter new password"
									required
								/>
								<button
									type="button"
									onMouseDown={() => setShowNewPassword((s) => !s)}
									onMouseUp={() => setShowNewPassword(false)}
									onMouseLeave={() => setShowNewPassword(false)}
									aria-label={showNewPassword ? "Hide password" : "Show password"}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-arcade-black/60 hover:text-arcade-black"
								>
									{showNewPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<div>
							<label className="block text-arcade-white font-kilimanjaro mb-2">
								Confirm Password
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="w-full px-4 py-2 pr-10 bg-arcade-white text-arcade-black font-kilimanjaro rounded border border-arcade-blue/50 focus:border-arcade-blue focus:outline-none"
									placeholder="Confirm new password"
									required
								/>
								<button
									type="button"
									onMouseDown={() => setShowConfirmPassword((s) => !s)}
									onMouseUp={() => setShowConfirmPassword(false)}
									onMouseLeave={() => setShowConfirmPassword(false)}
									aria-label={showConfirmPassword ? "Hide password" : "Show password"}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-arcade-black/60 hover:text-arcade-black"
								>
									{showConfirmPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

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
				</div>
			</div>
		</>
	);
} 