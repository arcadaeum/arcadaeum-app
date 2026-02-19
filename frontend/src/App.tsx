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
		<main
			style={{
				backgroundColor: "black",
				color: "white",
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				margin: 0,
				fontFamily: "system-ui",
			}}
		>
			<img
				src={landingImage}
				alt="Arcadaeum Landing Page"
				style={{ maxWidth: "80%", height: "auto", marginBottom: "2rem" }}
			/>
			<h1>Arcadaeum - Coming Soon</h1>
			<p>Backend status: {msg}</p>
		</main>
	);
}
