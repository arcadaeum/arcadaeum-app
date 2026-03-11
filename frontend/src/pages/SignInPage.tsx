import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import ColorBends from "../components/ColorBends";
import pngLogo from "../assets/images/Group 2.png";

function SignInPage() {
	const [usernameOrEmail, setUsernameOrEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setError("");

		try {
			const formData = new URLSearchParams();
			formData.append("username", usernameOrEmail);
			formData.append("password", password);

			const response = await fetch(`${import.meta.env.VITE_API_URL}/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Invalid credentials");
			}

			const data = await response.json();
			localStorage.setItem("access_token", data.access_token);
			navigate("/user");
		} catch {
			setError("Incorrect username or password");
		}
	};

	const handleGoogleSignIn = () => {
		window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/google`;
	};
	return (
		<>
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90"
				rotation={32}
				colors={["#ff2a2a", "#ff7a00", "#00c951"]}
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
			<div className="flex flex-col items-center justify-center font-main min-h-1/2 pt-20 px-4">
				<div className="w-full max-w-md bg-arcade-black p-8 shadow-lg ">
					<div className="flex justify-center">
						<img
							src={pngLogo}
							alt="Arcadaeum logo"
							className="w-20 h-20 mb-6 mx-auto object-contain rounded-xl p-1"
						/>
					</div>
					<h1 className="text-4xl font-main tracking-tighter text-white bg-arcade-black mb-6 text-center">
						Sign in to Arcadaeum
					</h1>

					{error && (
						<div className="bg-arcade-red/20 border border-arcade-red text-red-200 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-white font-kilimanjaro mb-2">
								Username or Email
							</label>
							<input
								type="text"
								value={usernameOrEmail}
								onChange={(e) => setUsernameOrEmail(e.target.value)}
								className="w-full px-4 py-2 bg-white text-arcade-black font-kilimanjaro rounded border border-arcade-orange/50 focus:border-arcade-gold focus:outline-none"
								required
							/>
						</div>

						<div>
							<label className="block text-white font-kilimanjaro mb-2">
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-4 py-2 pr-10 bg-white text-arcade-black font-kilimanjaro rounded border border-arcade-orange/50 focus:border-arcade-gold focus:outline-none"
									required
								/>
								<button
									type="button"
									onMouseDown={() => setShowPassword((s) => !s)}
									onMouseUp={() => setShowPassword(false)}
									onMouseLeave={() => setShowPassword(false)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-arcade-black/60 hover:text-arcade-black"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							className="w-full bg-arcade-gold text-arcade-black font-secondary py-3 rounded-full hover:bg-arcade-yellow transition-colors"
						>
							Sign In
						</button>
					</form>

					<div className="mt-6">
						<button
							onClick={handleGoogleSignIn}
							className="w-full bg-white text-arcade-black font-secondary py-3 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Sign in with Google
						</button>
					</div>

					<div className="mt-8 text-center">
						<p className="text-white/70 mb-4">New here? Create an account</p>
						<button
							onClick={() => navigate("/createaccount")}
							className="w-full bg-arcade-black text-arcade-gold font-secondary py-3 rounded border border-arcade-gold hover:bg-arcade-orange transition-colors"
						>
							Create Account
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

export default SignInPage;
