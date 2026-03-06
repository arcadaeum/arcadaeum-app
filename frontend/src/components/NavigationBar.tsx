import { Link, useNavigate } from "react-router-dom";
import smallLogo from "../assets/images/small_logo.jpg";

export default function NavigationBar() {
	const navigate = useNavigate();
	const isAuthenticated = !!localStorage.getItem("access_token");

	const handleLogout = () => {
		localStorage.removeItem("access_token");
		navigate("/signin");
	};

	return (
		<nav className="absolute top-4 left-4 right-4 z-20 font-main flex justify-between items-center">
			{/* Logo on top-left */}
			<Link to="/">
				<img src={smallLogo} alt="Arcadaeum Logo" className="h-15 w-15" />
			</Link>

			{/* Right-side links */}
			<div className="space-x-4 text-base">
				{!isAuthenticated && <Link to="/signin">Sign In</Link>}
				{isAuthenticated && (
					<>
						<Link to="/user">User Page</Link>
						<button onClick={handleLogout} className="ml-2">
							Logout
						</button>
					</>
				)}
			</div>
		</nav>
	);
}
