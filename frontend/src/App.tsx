import { useState } from "react";
import discordLogo from "./assets/images/Discord-Symbol-White.svg";
import Header from "./components/Header";
import SubmissionForm from "./components/SubmissionForm";

export default function App() {
	const [submissionStatus, setSubmissionStatus] = useState("");

	return (
		<main className="bg-arcade-black text-white min-h-screen flex flex-col items-center justify-center m-0 font-main relative">
			<a
				href="https://discord.gg/qdRumMNB"
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
			<Header />
			<h3 className="text-3xl mt-1 z-10 drop-shadow-[0_0_2.5px_#ffffff] mt-2">
				Coming soon.
			</h3>
			<SubmissionForm setSubmissionStatus={setSubmissionStatus} />

			{/* Submission status */}
			{submissionStatus && <p className="mt-4 z-10">{submissionStatus}</p>}
		</main>
	);
}
