import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";

import pngLogo from "../assets/images/LOGO_PURPLE.png";
import { ColorBends, NavigationBar } from "@/components/ui";
import { AuthErrorAlert, AuthTextField, GoogleSignInButton, PasswordField } from "@/components/auth";
import { buildGoogleSignInUrl, signInWithPassword } from "@/utils/auth";

function SignInPage() {
	const [usernameOrEmail, setUsernameOrEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const apiUrl = import.meta.env.VITE_API_URL as string;

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");

		try {
			const data = await signInWithPassword(usernameOrEmail, password, apiUrl);
			localStorage.setItem("access_token", data.access_token);
			navigate("/user");
		} catch {
			setError("Incorrect username or password");
		}
	};

	const handleGoogleSignIn = () => {
		window.location.href = buildGoogleSignInUrl(apiUrl);
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

					<h1 className="text-4xl font-title tracking-tighter text-arcade-white bg-arcade-black mb-6 text-center">
						Sign in to Arcadaeum
					</h1>

					<AuthErrorAlert error={error} />

					<form onSubmit={handleSubmit} className="space-y-6">
						<AuthTextField
							label="Username or Email"
							type="text"
							value={usernameOrEmail}
							onChange={setUsernameOrEmail}
							required
							inputId="signin-username-or-email"
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
							inputId="signin-password"
						/>

						<div className="text-right">
							<button
								type="button"
								onClick={() => navigate("/forgot-password")}
								className="text-arcade-blue hover:text-arcade-white text-sm font-kilimanjaro transition-colors"
							>
								Forgot password?
							</button>
						</div>

						<button
							type="submit"
							className="w-full bg-arcade-blue text-arcade-black font-default py-3 rounded-full hover:bg- transition-colors"
						>
							Sign In
						</button>
					</form>

					<div className="mt-6">
						<GoogleSignInButton onClick={handleGoogleSignIn} />
					</div>

					<div className="mt-8 text-center">
						<p className="text-arcade-white/70 mb-4">New here? Create an account</p>
						<button
							type="button"
							onClick={() => navigate("/createaccount")}
							className="w-full bg-arcade-black text-arcade-blue font-default py-3 rounded border border-arcade-blue hover:bg-arcade-blue transition-colors"
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
