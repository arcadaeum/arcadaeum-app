import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Search, X } from "lucide-react";
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
	const [searchOpen, setSearchOpen] = useState(false);
	const token = localStorage.getItem("access_token");
	const isAuthenticated = token ? true : false;

	// Scroll-follow: smooth small downward offset as the page scrolls
	const [topOffset, setTopOffset] = useState(16);
	const targetTopRef = useRef(16);
	const currentTopRef = useRef(16);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const base = 16; // px
		const maxScroll = 200; // px of scroll to cap movement
		const factor = 0.25; // how much of scroll translates to offset

		const step = () => {
			const prev = currentTopRef.current;
			const target = targetTopRef.current;
			const next = prev + (target - prev) * 0.15;
			currentTopRef.current = next;
			setTopOffset(Math.round(next));
			if (Math.abs(next - target) > 0.5) {
				rafRef.current = requestAnimationFrame(step);
			} else {
				currentTopRef.current = target;
				setTopOffset(Math.round(target));
				rafRef.current = null;
			}
		};

		const onScroll = () => {
			targetTopRef.current = base + Math.min(window.scrollY, maxScroll) * factor;
			if (!rafRef.current) rafRef.current = requestAnimationFrame(step);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		// initialize
		onScroll();

		return () => {
			window.removeEventListener("scroll", onScroll);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

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

	const handleSearchToggle = () => {
		setSearchOpen((open) => !open);
	};

	const handleSearchClose = () => {
		setSearchOpen(false);
	};

	return (
		<nav
			className="navigation-bar fixed left-4 right-4 z-20 flex items-center justify-between gap-3 text-arcade-white"
			style={{ top: `${topOffset}px` }}
		>
			<div className="navigation-bar__brand">
				<Link to="/">
					<img
						src={pngLogo}
						alt="Arcadaeum Logo"
						className="h-12 w-12p-1 rounded-br-2xl rounded-tl-2xl cursor-pointer hover:scale-110 transition-transform"
					/>
				</Link>
			</div>

			<div className="navigation-bar__actions flex items-center gap-4">
				{/* Search bar with selector - only show on specific pages */}
				{shouldShowSearch && (
					<div className="navigation-bar__search flex items-center gap-2">
						{/* Search type selector */}
						<select
							value={searchType}
							onChange={(e) => setSearchType(e.target.value as "games" | "users")}
							className="px-3 py-2 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-secondary focus:border-arcade-blue focus:outline-none transition-colors"
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
						className="navigation-bar__profile flex items-center justify-center rounded-full bg-arcade-black p-3 text-arcade-white shadow-sm transition hover:bg-arcade-black/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcade-blue hover:scale-110"
						aria-label="Go to profile"
					>
						<User className="h-5 w-5" aria-hidden="true" />
					</Link>
				)}

				{/* Minimal search icon for mobile (CSS toggles visibility) */}
				<button
					onClick={handleSearchToggle}
					type="button"
					className="navigation-bar__search-icon hidden items-center justify-center rounded-full bg-arcade-black p-3 text-arcade-white shadow-sm transition hover:bg-arcade-black/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcade-blue hover:scale-110"
					aria-label="Open search"
				>
					<Search className="h-5 w-5" aria-hidden="true" />
				</button>

				{/* Right-side menu */}
				<div className="navigation-bar__menu relative font-title text-lg">
					<button
						onClick={handleMenuToggle}
						type="button"
						className="navigation-bar__menu-button flex items-center justify-center rounded-full bg-arcade-black border border-arcade-white/20 p-3 text-arcade-white shadow-sm transition hover:bg-arcade-black/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcade-blue hover:scale-110 hover:cursor-pointer"
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
					className="navigation-bar__overlay fixed rounded-2xl inset-0 z-30 flex items-center justify-center bg-arcade-white/5 backdrop-blur-xl"
					role="menu"
					onClick={handleMenuClose}
				>
					<div
						className="navigation-bar__menu-panel flex min-w-65 flex-col items-center gap-6 rounded-3xl px-10 py-12 font-title text-lg"
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
									to="/reviews"
									className="text-2xl transition hover:text-arcade-violet hover:scale-120"
									role="menuitem"
									onClick={handleMenuClose}
								>
									Reviews
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

			{searchOpen && (
				<div
					className="navigation-bar__search-overlay fixed inset-0 z-40 flex items-start justify-center bg-arcade-white/5 backdrop-blur-xl p-4"
					onClick={handleSearchClose}
					role="dialog"
				>
					<div
						className="navigation-bar__search-panel w-full max-w-lg bg-arcade-black/95 rounded-2xl p-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-3">
							<select
								value={searchType}
								onChange={(e) => setSearchType(e.target.value as "games" | "users")}
								className="px-3 py-2 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-secondary focus:border-arcade-blue focus:outline-none transition-colors"
							>
								<option value="games">Games</option>
								<option value="users">Users</option>
							</select>
							<button
								onClick={handleSearchClose}
								className="p-2 text-arcade-white/70 hover:text-arcade-white"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						{searchType === "games" ? <GameSearch /> : <UserSearch />}
					</div>
				</div>
			)}
		</nav>
	);
}
