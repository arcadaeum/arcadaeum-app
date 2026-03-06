import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import AsciiText from "../components/AsciiText";
import LetterGlitch from "../components/LetterGlitch";

function SignInPage() {
	const [usernameOrEmail, setUsernameOrEmail] = useState("");
	const [password, setPassword] = useState("");
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
			<div className="fixed inset-0 -z-20 pointer-events-none">
				<LetterGlitch
					glitchSpeed={50}
					centerVignette={true}
					outerVignette={false}
					smooth={true}
					glitchColors={["#42424236", "#ffb3002c", "#ffb30038"]}
					characters={'ARCADAEM!?"$£@=+-_'}
				/>
			</div>
			<NavigationBar />
			<div className="flex flex-col items-center justify-center font-main min-h-screen pt-20 px-4">
				<div className="w-full max-w-md bg-arcade-black/80 rounded-lg p-8 shadow-lg border border-arcade-orange/30">
					<div className="relative w-full mb-6 h-28 sm:h-32 md:h-36 lg:h-40">
						<AsciiText
							text="Sign In"
							enableWaves={false}
							asciiFontSize={3}
							textFontSize={80}
							planeBaseHeight={16}
						/>
					</div>

					{error && (
						<div className="bg-arcade-red/20 border border-arcade-red text-red-200 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-white font-secondary mb-2">
								Username or Email
							</label>
							<input
								type="text"
								value={usernameOrEmail}
								onChange={(e) => setUsernameOrEmail(e.target.value)}
								className="w-full px-4 py-2 bg-arcade-black text-white rounded border border-arcade-orange/50 focus:border-arcade-gold focus:outline-none"
								required
							/>
						</div>

						<div>
							<label className="block text-white font-secondary mb-2">Password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-2 bg-arcade-black text-white rounded border border-arcade-orange/50 focus:border-arcade-gold focus:outline-none"
								required
							/>
						</div>

						<button
							type="submit"
							className="w-full bg-arcade-gold text-arcade-black font-secondary py-3 rounded hover:bg-arcade-yellow transition-colors"
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
