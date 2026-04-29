import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import pngLogo from "@/assets/images/LOGO_PURPLE.png";
import { GameSearch, UserSearch } from "@/components/search";
import { MainButton } from "@/components/ui";

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
					<MainButton text="SIGN IN" navigateTo="/signin" />
				) : null}
				{isAuthenticated && (
					<>
						<MainButton text="BROWSE" navigateTo="/browse" />
						<MainButton text="LIBRARY" navigateTo="/library" />
						<MainButton text="PROFILE" navigateTo="/user" />
						<MainButton text="LOG OUT" onClick={handleLogout} />
					</>
				)}
			</div>
		</nav>
	);
}
