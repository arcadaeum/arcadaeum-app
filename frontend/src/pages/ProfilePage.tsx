import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import GameCard from "../components/GameCard";
import { Pencil, UserRound } from "lucide-react";

type Game = {
	id: number;
	title: string;
	cover_url?: string | null;
};

type User = {
	id: number;
	username: string;
	email: string;
	display_name: string;
	profile_picture: string | null;
};

export default function ProfilePage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [favorites, setFavorites] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [showHeader, setShowHeader] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);

	const borderColors = [
		"border-arcade-blue",
		"border-arcade-violet",
		"border-arcade-white",
		"border-arcade-purple",
	] as const;
	const colorKey = user?.username ?? user?.display_name ?? "";
	const borderColor = borderColors[colorKey ? colorKey.charCodeAt(0) % borderColors.length : 0];

	const isOwnProfile = currentUserId === user?.id;

	// Get current user ID
	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (token) {
			fetch(`${import.meta.env.VITE_API_URL}/me`, {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((res) => res.json())
				.then((data) => setCurrentUserId(data.id))
				.catch(() => setCurrentUserId(null));
		}
	}, []);

	// Fetch user profile
	useEffect(() => {
		if (!userId) return;

		fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`)
			.then((res) => {
				if (!res.ok) throw new Error("User not found");
				return res.json();
			})
			.then((data) => setUser(data))
			.catch(() => {
				setError("User not found");
				navigate("/");
			})
			.finally(() => setLoading(false));
	}, [userId, navigate]);

	// Show header when profile section is out of view
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

	// Get user's favorite games
	useEffect(() => {
		if (!userId) return;

		fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/favorites`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch favorites");
				return res.json();
			})
			.then((data: Game[]) => setFavorites(data))
			.catch(() => setFavorites([]));
	}, [userId]);

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
	if (!user) return <div>User not found</div>;

	return (
		<>
			<NavigationBar />
			{showHeader && (
				<div className="fixed top-0 left-0 w-full z-50 bg-[#191617] opacity-100">
					<div className="flex items-center gap-4 px-16 py-3">
						<span
							className="text-xl font-title text-arcade-white tracking-tighter"
							style={{ textShadow: "0 0 3px #fefddc" }}
						>
							{user?.display_name ?? user?.username}
						</span>
					</div>
					<div className="flex h-1">
						<div className="flex-1 bg-arcade-white" />
						<div className="flex-1 bg-arcade-blue" />
						<div className="flex-1 bg-arcade-violet" />
						<div className="flex-1 bg-arcade-purple" />
					</div>
				</div>
			)}
			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16">
				<div ref={profileRef} className="relative flex w-full overflow-visible h-64">
					<div
						className={`border-4 ${borderColor} rounded-full ml-40 relative z-10 w-64 h-64 bg-arcade-white rounded-full overflow-hidden flex items-center justify-center flex-shrink-0`}
					>
						{user?.profile_picture ? (
							<img
								src={`${
									import.meta.env.VITE_API_URL
								}/proxy/profile-image?url=${encodeURIComponent(
									user.profile_picture,
								)}`}
								alt="Profile Picture"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="flex items-center justify-center bg-arcade-black w-64 h-64">
								<UserRound className="text-arcade-white w-32 h-32" />
							</div>
						)}
					</div>
					<div className="pointer-events-none absolute -left-16 top-1/2 z-0 -translate-y-1/2 flex flex-col w-screen">
						<div className="h-5 w-screen bg-arcade-white drop-shadow-[0_0_8px_#ece4d5]" />
						<div className="h-5 w-screen bg-arcade-blue drop-shadow-[0_0_8px_#37b0ea]" />
						<div className="h-5 w-screen bg-arcade-violet drop-shadow-[0_0_8px_#5647f1]" />
						<div className="h-5 w-screen bg-arcade-purple drop-shadow-[0_0_8px_#8122c0]" />
					</div>
					<div className="relative z-10 -mt-40 self-center flex flex-col pl-10">
						<h1 className="text-6xl font-title text-arcade-white flex items-center gap-2 whitespace-nowrap drop-shadow-[0_0_3px_#fefddc] mb-2 tracking-tighter">
							{isOwnProfile && editing ? (
								<>
									<input
										type="text"
										value={newDisplayName}
										onChange={(e) => setNewDisplayName(e.target.value)}
										className="border rounded px-2 py-1 text-arcade-black"
									/>
									<button
										onClick={handleSave}
										className="ml-1 text-lg font-default text-arcade-white border tracking-wide rounded px-2 py-1"
									>
										Save
									</button>
									<button
										onClick={() => setEditing(false)}
										className="ml-1 text-lg font-default text-arcade-white border tracking-wide rounded px-2 py-1"
									>
										Cancel
									</button>
								</>
							) : (
								<>
									{user?.display_name ?? user?.username}
									{isOwnProfile && (
										<button
											onClick={handleEdit}
											className="ml-2"
											title="Edit display name"
										>
											<Pencil />
										</button>
									)}
								</>
							)}
						</h1>
					</div>
				</div>
				<div
					className="flex gap-6 -mt-16 font-default text-xs text-gray-400 tracking-wider items-center"
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
					className="w-2/3 mt-25 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Favorite Games
				</h2>
				<div className="w-2/3 ml-50">
					<div className="overflow-x-auto py-6 -mx-2">
						<div className="flex gap-6 px-2">
							{favorites.length > 0 ? (
								favorites.map((g) => (
									<GameCard
										key={g.id}
										id={g.id}
										title={g.title}
										image={g.cover_url}
									/>
								))
							) : (
								<p className="text-gray-400">No favorite games yet</p>
							)}
						</div>
					</div>
				</div>

				<h2
					className="w-2/3 z-50 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-blue tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Reviews
				</h2>
				<div className="w-2/3 ml-50 h-48" />

				<h2
					className="w-2/3 z-50 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-violet tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Collections
				</h2>
				<div className="w-2/3 ml-50 h-48" />

				<h2
					className="w-2/3 z-50 text-2xl ml-50 font-title text-arcade-white border-b-4 border-arcade-purple tracking-tighter"
					style={{ textShadow: "0 0 2px #fefddc" }}
				>
					Posts
				</h2>
				<div className="w-2/3 ml-50 h-48" />
			</div>
		</>
	);
}
