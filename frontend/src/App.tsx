import { useEffect, useState } from "react";

export default function App() {
	const [msg, setMsg] = useState("Loading...");

	// This just pings the backend for a response
	useEffect(() => {
		fetch("http://localhost:8000/health")
			.then((r) => r.json())
			.then((d) => setMsg(d.status))
			.catch(() => setMsg("Backend not reachable"));
	}, []);

	// This is what the App() function returns to index.html
	return (
		<main className="min-h-screen bg-linear-to-br from-black to-yellow-900 flex items-center justify-center p-6">
			<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
				<h1 className="text-4xl font-bold text-white mb-4">Arcadaeum</h1>
				<p className="text-green-200">Backend status: {msg}</p>
			</div>
		</main>
	);
}
