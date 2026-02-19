import { useEffect, useState } from "react";

// import logo image
import landingImage from "./assets/logo.png";

export default function App() {
	const [msg, setMsg] = useState("Loading...");

	// Backend health check
	useEffect(() => {
		fetch("http://localhost:8000/health")
			.then((r) => r.json())
			.then((d) => setMsg(d.status))
			.catch(() => setMsg("Backend not reachable"));
	}, []);

	return (
		// Landing Page Style
		<main className="bg-black text-white min-h-screen flex flex-col items-center justify-center m-0 font-sans">
			<img
				src={landingImage}
				alt="Arcadaeum Landing Page"
				className="max-w-[80%] h-auto mb-8"
			/>
			<h1>Arcadaeum - Coming Soon</h1>
			<p>Backend status: {msg}</p>
		</main>
	);
}
