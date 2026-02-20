import { useEffect, useState } from "react";
import discordLogo from "./assets/images/Discord-Symbol-White.svg";

export default function App() {
	const [msg, setMsg] = useState("Loading...");
	const [game, setGame] = useState("");
	const [submissionStatus, setSubmissionStatus] = useState("");

	// Backend health check
	useEffect(() => {
		fetch("http://localhost:8000/health")
			.then((r) => r.json())
			.then((d) => setMsg(d.status))
			.catch(() => setMsg("Backend not reachable"));
	}, []);

	// Handle form submission
	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		setSubmissionStatus("Submitting...");

		fetch("http://localhost:8000/submissions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ title: game }),
		})
			.then((r) => r.json())
			.then(() => {
				setSubmissionStatus("Game submitted successfully!");
				setGame("");
			})
			.catch(() => setSubmissionStatus("Failed to submit the game."));
	};

	return (
		<main className="bg-arcade-black text-white min-h-screen flex flex-col items-center justify-center m-0 font-main relative">
			<a
				href="https://discord.gg/c3hfwj7Tq9"
				className="absolute top-4 right-4 z-20"
				aria-label="Join our Discord"
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					src={discordLogo}
					alt="Discord"
					className="w-8 h-8 drop-shadow-[0_0_1.5px_#ffffff]"
				/>
			</a>
			<video
				className="absolute inset-0 w-full h-full object-cover z-30 mix-blend-screen pointer-events-none"
				autoPlay
				loop
				muted
			>
				<source src="/src/assets/video/EZCO-CRT-Lighten.mp4" type="video/mp4" />
			</video>
			<h1 className="text-8xl font-main tracking-[-0.1em] mb-0 z-10 drop-shadow-[0_0_5px_#ffffff]">
				Arcadaeum
			</h1>
			<div className="bg-arcade-red h-4 w-full mb-1.5 z-10 drop-shadow-[0_0_20px_#ff2a2a]"></div>
			<div className="bg-arcade-gold h-4 w-full mb-1.5 z-10 drop-shadow-[0_0_20px_#ffb300]"></div>
			<div className="bg-arcade-yellow h-4 w-full mb-1.5 z-10 drop-shadow-[0_0_20px_#ffd000]"></div>
			<h3 className="text-2xl mt-1 z-10 drop-shadow-[0_0_2.5px_#ffffff]">Coming soon.</h3>
			<p className="absolute bottom-3 left-4 font-secondary text-gray-400 z-10">
				Backend status: {msg}
			</p>

			{/* Form for submitting favorite game */}
			<form onSubmit={handleSubmit} className="mt-3 flex flex-col items-center z-10">
				<label htmlFor="game" className="mb-2 drop-shadow-[0_0_2.5px_#ffffff]">
					What's your favorite game?
				</label>
				<input
					id="game"
					type="text"
					value={game}
					onChange={(e) => setGame(e.target.value)}
					className="bg-white p-2 text-black rounded mb-4 drop-shadow-[0_0_5px_#ffffff]"
					placeholder="e.g. Elden Ring"
					required
				/>
				<button
					type="submit"
					className="bg-arcade-red text-white px-4 py-2 rounded hover:bg-white hover:text-arcade-red transition-colors duration-100 drop-shadow-[0_0_5px_#ff2a2a]"
				>
					Submit
				</button>
			</form>

			{/* Submission status */}
			{submissionStatus && <p className="mt-4 z-10">{submissionStatus}</p>}
		</main>
	);
}
