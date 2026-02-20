import React from "react";
import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function SubmissionForm({
	setSubmissionStatus,
}: {
	setSubmissionStatus: (status: string) => void;
}) {
	const [game, setGame] = useState("");

	// Handle form submission
	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		setSubmissionStatus("Submitting...");
		// Use the axios library for HTTP requests
		axios
			.post(`${API_URL}/submissions`, { title: game })
			.then(() => {
				setSubmissionStatus("Game submitted successfully!");
				setGame("");
			})
			.catch(() => setSubmissionStatus("Failed to submit the game."));
	};
	return (
		<form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center z-10">
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
	);
}

export default SubmissionForm;
