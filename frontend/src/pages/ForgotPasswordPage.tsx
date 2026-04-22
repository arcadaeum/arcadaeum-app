import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import ColorBends from "../components/ColorBends";
import pngLogo from "../assets/images/LOGO_PURPLE.png";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/password-reset/request`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();
			if (response.ok) {
				setMessage(data.message || "Check your email for a reset link.");
				setEmail("");
			} else {
				setError(data.detail || "Failed to send reset link.");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
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
						Enter your email to receive a password reset link.
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

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-arcade-white font-kilimanjaro mb-2">
								Email Address
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2 bg-arcade-white text-arcade-black font-kilimanjaro rounded border border-arcade-blue/50 focus:border-arcade-blue focus:outline-none"
								placeholder="Enter your email"
								required
							/>
						</div>

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
				</div>
			</div>
		</>
	);
} 