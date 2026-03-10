import { Link, useNavigate } from "react-router-dom";
import smallLogo from "../assets/images/small_logo.jpg";

export default function NavigationBar() {
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
		<nav className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center drop-shadow-[0_0_1px_#fefddc] text-arcade-white">
			{/* Logo on top-left */}
			<Link to="/">
				<img src={smallLogo} alt="Arcadaeum Logo" className="h-15 w-15 rounded-md p-1" />
			</Link>

			{/* Right-side links */}
			<div className="flex items-center gap-4">
				{!isAuthenticated && (
					<Link to="/signin" className={actionClassName}>
						SIGN IN
					</Link>
				)}
				{isAuthenticated && (
					<>
						<Link to="/user" className={actionClassName + " relative"}>
							USER PAGE
						</Link>
						<button
							type="button"
							onClick={handleLogout}
							className={actionClassName + " cursor-pointer"}
						>
							LOGOUT
						</button>
					</>
				)}
			</div>
		</nav>
	);
}
