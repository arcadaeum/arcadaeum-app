import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import { GameCard } from "@/components/game";
import { UserProfileHero, UserStickyHeader } from "@/components/user";
import type { LibraryEntry, UserProfile } from "@/types/user";
import { getUserDisplayName, getUserProfileBorderColor } from "@/utils/user";

export default function LibraryPage() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [library, setLibrary] = useState<LibraryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [showHeader, setShowHeader] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;

	const displayName = getUserDisplayName(user);
	const borderColor = getUserProfileBorderColor(user);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) {
			navigate("/signin");
			return;
		}
		fetch(`${apiUrl}/me`, {
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
	}, [apiUrl, navigate]);

	// Intersection observer to show header when profile section is scrolled out of view.
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

	// Fetch user's library from API (only after user is loaded)
	useEffect(() => {
		if (!user) return; // Wait for user to be authenticated

		const token = localStorage.getItem("access_token");
		if (!token) {
			return;
		}
		fetch(`${apiUrl}/users/me/library`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch library");
				return res.json();
			})
			.then((data: LibraryEntry[]) => setLibrary(data))
			.catch(() => setLibrary([]));
	}, [apiUrl, user]);

	const handleEdit = () => {
		setNewDisplayName(user?.display_name || "");
		setEditing(true);
	};

	const handleSave = async () => {
		const token = localStorage.getItem("access_token");
		const res = await fetch(`${apiUrl}/me`, {
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
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90 blur-3xl"
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
			{showHeader && <UserStickyHeader displayName={displayName} />}
			<div className="flex flex-col items-start font-title min-h-screen pt-40 px-16">
				<UserProfileHero
					user={user}
					profileRef={profileRef}
					borderColor={borderColor}
					apiUrl={apiUrl}
					editing={editing}
					newDisplayName={newDisplayName}
					displayName={displayName}
					onDisplayNameChange={setNewDisplayName}
					canEdit={false}
					onEdit={handleEdit}
					onSave={handleSave}
					onCancel={() => setEditing(false)}
				/>
				<h2 className="w-2/3 mt-20 text-4xl ml-50 font-title text-arcade-white tracking-tighter">
					Your Library
				</h2>
				<div className="w-full max-w-7xl mx-auto px-4 py-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
						{library.map((entry) => (
							<GameCard
								key={entry.id}
								id={entry.game_id}
								title={entry.title}
								image={entry.cover_url}
							/>
						))}
					</div>

					{library.length === 0 && (
						<h3 className="mt-8 text-center text-2xl font-title text-arcade-white tracking-tighter">
							Your library is currently empty. Browse the{" "}
							<Link to="/browse" className="text-arcade-violet hover:underline">
								Arcadaeum
							</Link>{" "}
							to find games to add!
						</h3>
					)}
				</div>
			</div>
		</>
	);
}
