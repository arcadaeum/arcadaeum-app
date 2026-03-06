import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { Pencil, UserRound } from "lucide-react";

function UserPage() {
	const [user, setUser] = useState<{
		username: string;
		email: string;
		display_name: string;
		profile_picture: string | null;
	} | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const navigate = useNavigate();

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
			<div className="flex flex-col items-center font-main min-h-screen pt-20">
				<div className="w-30 h-30 bg-white rounded-full overflow-hidden flex items-center justify-center">
					{user?.profile_picture ? (
						<img
							src={`${import.meta.env.VITE_API_URL}/proxy/profile-image?url=${encodeURIComponent(user.profile_picture)}`}
							alt="Profile Picture"
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="flex items-center justify-center bg-black border-4 border-white rounded-full w-28 h-28">
							<UserRound className="text-white w-16 h-16" />
						</div>
					)}
				</div>
				<h1 className="mt-8 text-3xl font-secondary text-center flex items-center gap-2">
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
								className="ml-1 text-lg font-secondary text-gray-300 border rounded px-2 py-1"
							>
								Save
							</button>
							<button
								onClick={() => setEditing(false)}
								className="ml-1 text-lg font-secondary text-gray-300 border rounded px-2 py-1"
							>
								Cancel
							</button>
						</>
					) : (
						<>
							{user?.display_name ?? user?.username}
							<button onClick={handleEdit} className="ml-2" title="Edit display name">
								<Pencil />
							</button>
						</>
					)}
				</h1>
				<h2 className="w-full max-w-4xl mt-12 text-lg font-secondary text-gray-300 border-b-4 border-arcade-gold">
					FAVORITE GAMES
				</h2>
			</div>
		</>
	);
}

export default UserPage;
