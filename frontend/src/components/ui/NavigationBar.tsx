import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import pngLogo from "@/assets/images/LOGO_PURPLE.png";
import { GameSearch, UserSearch } from "@/components/search";

type NavigationBarProps = {
	isSignInPage?: boolean;
};

export default function NavigationBar({ isSignInPage = false }: NavigationBarProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchType, setSearchType] = useState<"games" | "users">("games");
	const [menuOpen, setMenuOpen] = useState(false);
	const token = localStorage.getItem("access_token");
	const isAuthenticated = token ? true : false;

	// Routes where search bar should not be shown
	const noSearchRoutes = ["/signin", "/forgot-password", "/reset-password", "/createaccount"];
	const shouldShowSearch = !noSearchRoutes.includes(location.pathname) && isAuthenticated;

	const handleLogout = () => {
		localStorage.removeItem("access_token");
		navigate("/signin");
	};

	const handleMenuToggle = () => {
		setMenuOpen((open) => !open);
	};

	const handleMenuClose = () => {
		setMenuOpen(false);
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

			<div className="flex items-center gap-4">
				{/* Search bar with selector - only show on specific pages */}
				{shouldShowSearch && (
					<div className="flex items-center gap-2">
						{/* Search type selector */}
						<select
							value={searchType}
							onChange={(e) => setSearchType(e.target.value as "games" | "users")}
							className="px-3 py-2 bg-arcade-black border-2 border-arcade-white rounded-lg text-arcade-white font-secondary focus:border-arcade-blue focus:outline-none transition-colors"
						>
							<option value="games">Games</option>
							<option value="users">Users</option>
						</select>

						{/* Render appropriate search component */}
						{searchType === "games" ? <GameSearch /> : <UserSearch />}
					</div>
				)}

				{isAuthenticated && (
					<Link
						to="/user"
						className="flex items-center justify-center rounded-full bg-arcade-black/80 p-3 text-arcade-white shadow-sm transition hover:bg-arcade-black/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcade-blue hover:scale-110"
						aria-label="Go to profile"
					>
						<User className="h-5 w-5" aria-hidden="true" />
					</Link>
				)}

				{/* Right-side menu */}
				<div className="relative font-title text-lg">
					<button
						onClick={handleMenuToggle}
						type="button"
						className="flex items-center justify-center rounded-full bg-arcade-black/80 p-3 text-arcade-white shadow-sm transition hover:bg-arcade-black/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcade-blue hover:scale-110 hover:cursor-pointer"
						aria-haspopup="menu"
						aria-expanded={menuOpen}
						aria-label="Open menu"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M3 5h14M3 10h14M3 15h14"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
							/>
						</svg>
					</button>
				</div>
			</div>

			{menuOpen && (
				<div
					className="fixed  rounded-2xl inset-0 z-30 flex items-center justify-center bg-arcade-white/5 backdrop-blur-xl"
					role="menu"
					onClick={handleMenuClose}
				>
					<div
						className="flex min-w-65 flex-col items-center gap-6 rounded-3xl px-10 py-12 font-title text-lg"
						onClick={(event) => event.stopPropagation()}
					>
						{!isAuthenticated && !isSignInPage && (
							<Link
								to="/signin"
								className="text-2xl transition hover:text-arcade-blue"
								role="menuitem"
								onClick={handleMenuClose}
							>
								Sign In
							</Link>
						)}
						{isAuthenticated && (
							<>
								<Link
									to="/browse"
									className="text-2xl transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
									onClick={handleMenuClose}
								>
									Browse
								</Link>
								<Link
									to="/library"
									className="text-2xl transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
									onClick={handleMenuClose}
								>
									Library
								</Link>
								<Link
									to="/collections"
									className="text-2xl transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
									onClick={handleMenuClose}
								>
									Collections
								</Link>
								<Link
									to="/user"
									className="text-2xl transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
									onClick={handleMenuClose}
								>
									Profile
								</Link>
								<Link
									to="/social"
									className="text-2xl transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
									onClick={handleMenuClose}
								>
									Social
								</Link>
								<Link
									to="/settings"
									className="text-2xl transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
									onClick={handleMenuClose}
								>
									Settings
								</Link>
								<button
									onClick={() => {
										handleLogout();
										handleMenuClose();
									}}
									type="button"
									className="text-2xl  text-arcade-white transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
								>
									Log Out
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
