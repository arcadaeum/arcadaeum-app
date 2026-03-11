import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import GameCard from "../components/GameCard";
import { Pencil, UserRound } from "lucide-react";

function UserPage() {
	type Game = {
		id: number;
		title: string;
		cover_url?: string | null;
	};

	const [user, setUser] = useState<{
		username: string;
		email: string;
		display_name: string;
		profile_picture: string | null;
	} | null>(null);
	const [favorites, setFavorites] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [showHeader, setShowHeader] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	const borderColors = [
		"border-arcade-gold",
		"border-arcade-yellow",
		"border-arcade-red",
		"border-arcade-green",
	] as const;
	const colorKey = user?.username ?? user?.display_name ?? "";
	const borderColor = borderColors[colorKey ? colorKey.charCodeAt(0) % borderColors.length : 0];

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			navigate("/signin");
			return;
		}
		fetch(`${import.meta.env.VITE_API_URL}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Unauthorized");
				return res.json();
			})
			.then((data) => setUser(data))
			.catch(() => {
				setError("You must be logged in.");
				localStorage.removeItem("access_token");
				navigate("/signin");
			})
			.finally(() => setLoading(false));
	}, [navigate]);

	useEffect(() => {
		const el = profileRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => setShowHeader(!entry.isIntersecting),
			{ rootMargin: "-200px 0px 0px 0px", threshold: 0 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [loading]);

	// Get games from the URL, This needs to be changed to get favourites instead of popular.
	useEffect(() => {
		const url = import.meta.env.VITE_API_URL;

		// Stores the data from the game api into the favorites state.
		fetch(`${url}/games`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch games");
				return res.json();
			})
			.then((data: Game[]) => setFavorites(data))
			.catch(() => setFavorites([]));
	}, []);

	const handleEdit = () => {
		setNewDisplayName(user?.display_name || "");
		setEditing(true);
	};

	const handleSave = async () => {
		const token = localStorage.getItem("access_token");
		const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ display_name: newDisplayName }),
		});
		if (res.ok) {
			const updated = await res.json();
			setUser(updated);
			setEditing(false);
		} else {
			setError("Failed to update display name.");
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	return (
		<>
			<NavigationBar />
			{showHeader && (
				<div className="fixed top-0 left-0 w-full z-50 bg-[#191617] opacity-100">
					<div className="flex items-center gap-4 px-16 py-3">
						<span
							className="text-xl font-main text-arcade-white tracking-tighter"
							style={{ textShadow: "0 0 3px #fefddc" }}
						>
							{user?.display_name ?? user?.username}
						</span>
					</div>
					<div className="flex h-1">
						<div className="flex-1 bg-arcade-red" />
						<div className="flex-1 bg-arcade-gold" />
						<div className="flex-1 bg-arcade-yellow" />
						<div className="flex-1 bg-arcade-green" />
					</div>
				</div>
			)}
			<div className="flex flex-col items-start font-main min-h-screen pt-40 px-16">
				<div ref={profileRef} className="relative flex w-full overflow-visible h-64">
					<div
						className={`border-4 ${borderColor} rounded-full ml-40 relative z-10 w-64 h-64 bg-arcade-white rounded-full overflow-hidden flex items-centerjustify-center flex-shrink-0`}
					>
						{user?.profile_picture ? (
							<img
								src={`${import.meta.env.VITE_API_URL}/proxy/profile-image?url=${encodeURIComponent(user.profile_picture)}`}
								alt="Profile Picture"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="flex items-center justify-center bg-arcade-black  w-64 h-64">
								<UserRound className="text-arcade-white w-32 h-32" />
							</div>
						)}
					</div>
					<div className="pointer-events-none absolute -left-16 top-1/2 z-0 -translate-y-1/2 flex flex-col w-screen">
						<div className="h-5 w-screen bg-arcade-red drop-shadow-[0_0_8px_#ff2a2a]" />
						<div className="h-5 w-screen bg-arcade-gold drop-shadow-[0_0_8px_#ffb300]" />
						<div className="h-5 w-screen bg-arcade-yellow drop-shadow-[0_0_8px_#ffe826]" />
						<div className="h-5 w-screen bg-arcade-green drop-shadow-[0_0_8px_#00c951]" />
					</div>
					<div className="relative z-10 -mt-40 self-center flex flex-col pl-10">
						<h1 className="text-6xl font-main text-arcade-white flex items-center gap-2 whitespace-nowrap drop-shadow-[0_0_3px_#fefddc] mb-2 tracking-tighter">
							{editing ? (
								<>
									<input
										type="text"
										value={newDisplayName}
										onChange={(e) => setNewDisplayName(e.target.value)}
										className="border rounded px-2 py-1"
									/>
									<button
										onClick={handleSave}
										className="ml-1 text-lg font-secondary text-arcade-white border tracking-wide rounded px-2 py-1"
									>
										Save
									</button>
									<button
										onClick={() => setEditing(false)}
										className="ml-1 text-lg font-secondary text-arcade-white border tracking-wide rounded px-2 py-1"
									>
										Cancel
									</button>
								</>
							) : (
								<>
									{user?.display_name ?? user?.username}
									<button
										onClick={handleEdit}
										className="ml-2"
										title="Edit display name"
									>
										<Pencil />
									</button>
								</>
							)}
						</h1>
					</div>
				</div>
				<div
					className="flex gap-6 -mt-16 font-secondary text-xs text-gray-400 tracking-wider items-center"
					style={{ marginLeft: "28.5rem" }}
				>
					<span>
						<span className="text-arcade-white font-bold">128</span> Followers
					</span>
					<span className="w-1 h-1 rounded-full bg-gray-500" />
					<span>
						<span className="text-arcade-white font-bold">64</span> Following
					</span>
					<span className="w-1 h-1 rounded-full bg-gray-500" />
					<span>
						<span className="text-arcade-white font-bold">42</span> Games
					</span>
					<span className="w-1 h-1 rounded-full bg-gray-500" />
					<span>
						<span className="text-arcade-white font-bold">17</span> Reviews
					</span>
				</div>

				<h2
					className="w-2/3 mt-25 text-2xl ml-50 font-main text-arcade-white border-b-4 border-arcade-red tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Favorite Games
				</h2>
				<div className="w-2/3 ml-50">
					<div className="overflow-x-auto py-6 -mx-2">
						<div className="flex gap-6 px-2">
							{favorites.map((g) => (
								<GameCard
									key={g.id}
									id={g.id}
									title={g.title}
									image={g.cover_url}
								/>
							))}
						</div>
					</div>
				</div>

				<h2
					className="w-2/3 z-50 text-2xl ml-50 font-main text-arcade-white border-b-4 border-arcade-gold tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Reviews
				</h2>
				<div className="w-2/3 ml-50 h-48" />

				<h2
					className="w-2/3 z-50 text-2xl ml-50 font-main text-arcade-white border-b-4 border-arcade-yellow tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Collections
				</h2>
				<div className="w-2/3 ml-50 h-48" />

				<h2
					className="w-2/3 z-50 text-2xl ml-50 font-main text-arcade-white border-b-4 border-arcade-green tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Posts
				</h2>
				<div className="w-2/3 ml-50 h-48" />
			</div>
		</>
	);
}

export default UserPage;
