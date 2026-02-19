import { useEffect, useState } from "react";

// import logo image
import landingImage from "./assets/logo.png";

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
		<main className="bg-black text-white min-h-screen flex flex-col items-center justify-center m-0 font-sans">
			<img
				src={landingImage}
				alt="Arcadaeum Landing Page"
				className="max-w-[80%] h-auto mb-8"
			/>
			<h1>Arcadaeum - Coming Soon</h1>
			<p>Backend status: {msg}</p>

			{/* Form for submitting favorite game */}
			<form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center">
				<label htmlFor="game" className="mb-2">
					Enter your favorite game:
				</label>
				<input
					id="game"
					type="text"
					value={game}
					onChange={(e) => setGame(e.target.value)}
					className="p-2 text-black rounded mb-4"
					placeholder="Type your favorite game"
					required
				/>
				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
				>
					Submit
				</button>
			</form>

			{/* Submission status */}
			{submissionStatus && <p className="mt-4">{submissionStatus}</p>}
		</main>
	);
}
