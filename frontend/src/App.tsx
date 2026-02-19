import { useEffect, useState } from "react";

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
		<main className="bg-arcade-black text-white min-h-screen flex flex-col items-center justify-center m-0 font-main">
			<h1 className="text-8xl font-main tracking-[-0.1em] mb-0">Arcadaeum</h1>
			<div className="bg-arcade-red h-4 w-full mb-1.5"></div>
			<div className="bg-arcade-gold h-4 w-full mb-1.5"></div>
			<div className="bg-arcade-yellow h-4 w-full mb-1.5"></div>
			<h3>Arcadaeum - Coming Soon</h3>
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
					className="p-2 text-white rounded mb-4"
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
