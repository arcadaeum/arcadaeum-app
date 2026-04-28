import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import pngLogo from "@/assets/images/LOGO_PURPLE.png";
import { GameSearch, UserSearch } from "@/components/search";

type NavigationBarProps = {
	isSignInPage?: boolean;
};

export default function NavigationBar({ isSignInPage = false }: NavigationBarProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchType, setSearchType] = useState<"games" | "users">("games");
	const token = localStorage.getItem("access_token");
	const isAuthenticated = token ? true : false;

	// Routes where search bar should not be shown
	const noSearchRoutes = ["/signin", "/forgot-password", "/reset-password", "/create-account"];
	const shouldShowSearch = !noSearchRoutes.includes(location.pathname) && isAuthenticated;

	const handleLogout = () => {
		localStorage.removeItem("access_token");
		navigate("/signin");
	};

	const actionClassName =
		"font-secondary inline-flex items-center justify-center rounded-2xl border-4 border-arcade-white px-8 py-2 bg-transparent font-bold tracking-tighter text-sm leading-none";

	return (
		<nav className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center text-arcade-white">
			{/* Logo on top-left */}
			<Link to="/">
				<img
					src={pngLogo}
					alt="Arcadaeum Logo"
					className="h-12 w-12p-1 rounded-br-2xl rounded-tl-2xl cursor-pointer hover:scale-110 transition-transform"
				/>
			</Link>

			{/* Search bar with selector - only show on specific pages */}
			{shouldShowSearch && (
				<div className="flex items-center gap-2">
					{/* Search type selector */}
					<select
						value={searchType}
						onChange={(e) => setSearchType(e.target.value as "games" | "users")}
						className="px-3 py-2 bg-arcade-black border-2 border-arcade-white/30 rounded-lg text-arcade-white font-secondary focus:border-arcade-blue focus:outline-none transition-colors"
					>
						<option value="games">Search Games</option>
						<option value="users">Search Users</option>
					</select>

					{/* Render appropriate search component */}
					{searchType === "games" ? <GameSearch /> : <UserSearch />}
				</div>
			)}

			{/* Right-side links */}
			<div className="flex items-center gap-4">
				{!isAuthenticated && !isSignInPage ? (
					<Link
						to="/signin"
						className={
							actionClassName +
							" relative cursor-pointer hover:scale-110 transition-transform"
						}
					>
						SIGN IN
					</Link>
				) : null}
				{isAuthenticated && (
					<>
						<Link
							to="/browse"
							className={
								actionClassName +
								" relative cursor-pointer hover:scale-110 transition-transform"
							}
						>
							BROWSE
						</Link>
						<Link
							to="/library"
							className={
								actionClassName +
								" relative cursor-pointer hover:scale-110 transition-transform"
							}
						>
							LIBRARY
						</Link>
						<Link
							to="/user"
							className={
								actionClassName +
								" relative cursor-pointer hover:scale-110 transition-transform "
							}
						>
							USER PAGE
						</Link>
						<button
							type="button"
							onClick={handleLogout}
							className={
								actionClassName +
								" cursor-pointer hover:scale-110 transition-transform"
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
