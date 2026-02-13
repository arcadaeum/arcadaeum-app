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
		<main style={{ fontFamily: "system-ui", padding: 24 }}>
			<h1>Arcadaeum</h1>
			<p>Backend status: {msg}</p>
		</main>
	);
}
