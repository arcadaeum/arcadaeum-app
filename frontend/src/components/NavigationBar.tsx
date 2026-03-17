import { Link, useNavigate } from "react-router-dom";
import pngLogo from "../assets/images/LOGO_PURPLE.png";

type NavigationBarProps = {
	isSignInPage?: boolean;
};

export default function NavigationBar({ isSignInPage = false }: NavigationBarProps) {
	const navigate = useNavigate();
	const token = localStorage.getItem("access_token");
	const isAuthenticated = token ? true : false;

	const handleLogout = () => {
		localStorage.removeItem("access_token");
		navigate("/signin");
	};

	const actionClassName =
		"font-tester inline-flex items-center justify-center rounded-2xl border-4 border-arcade-white px-8 py-2 bg-transparent font-bold tracking-tighter text-sm leading-none";

	return (
		<nav className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center  text-arcade-white">
			{/* Logo on top-left */}
			<Link to="/">
				<img
					src={pngLogo}
					alt="Arcadaeum Logo"
					className="h-15 w-15p-1 rounded-br-2xl rounded-tl-2xl cursor-pointer hover:scale-110 transition-transform"
				/>
			</Link>

			{/* Right-side links */}
			<div className="flex items-center gap-4 ">
				{!isAuthenticated && !isSignInPage ? (
					<Link
						to="/signin"
						className={
							actionClassName +
							" relative cursor-pointer hover:scale-110 transition-transform drop-shadow-[0_0_1px_#fefddc]"
						}
						cursor-pointer
						hover:scale-110
						transition-transform
					>
						SIGN IN
					</Link>
				) : null}
				{isAuthenticated && (
					<>
						<Link
							to="/user"
							className={
								actionClassName +
								" relative cursor-pointer hover:scale-110 transition-transform drop-shadow-[0_0_1px_#fefddc]"
							}
						>
							USER PAGE
						</Link>
						<button
							type="button"
							onClick={handleLogout}
							className={
								actionClassName +
								" cursor-pointer hover:scale-110 transition-transform drop-shadow-[0_0_1px_#fefddc]"
							}
						>
							LOGOUT
						</button>
					</>
				)}
			</div>
		</nav>
	);
}
