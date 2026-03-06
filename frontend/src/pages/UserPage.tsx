import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";

function UserPage() {
	const [user, setUser] = useState<{ username: string; email: string } | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
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

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	return (
		<>
			<NavigationBar />
			<div className="flex flex-col items-center font-main min-h-screen pt-20">
				<div className="w-30 h-30 bg-white rounded-full"></div>
				<h1 className="mt-8 text-3xl font-secondary text-center">{user?.username}</h1>
				<h2 className="w-full max-w-4xl mt-12 text-lg font-secondary text-gray-300 border-b-4 border-arcade-gold">
					FAVORITE GAMES
				</h2>
			</div>
		</>
	);
}

export default UserPage;
