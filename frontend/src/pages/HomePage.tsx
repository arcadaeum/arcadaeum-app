import NavigationBar from "../components/NavigationBar";
import ColorBends from "../components/ColorBends";

import FeatureSquare from "../components/FeatureSquare";
import FeaturePanel, { type FeatureItem } from "../components/FeaturePanel";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const features: (FeatureItem & { bgClass: string; glowColor: string })[] = [
	{
		key: "red",
		title: "TRACK YOUR BACKLOG",
		borderClass: "border-arcade-white",
		bgClass: "bg-arcade-white",
		glowColor: "#ece4d5",
		body: (
			<>
				<p>
					Log every game in your backlog, track what you have finished, what you are
					playing, and what is still waiting.
				</p>
				<p className="text-arcade-black/70">
					Use custom statuses and filters to keep your library under control.
				</p>
			</>
		),
	},
	{
		key: "orange",
		title: "SEE WHAT FRIENDS PLAY",
		borderClass: "border-arcade-blue",
		bgClass: "bg-arcade-blue",
		glowColor: "#37b0ea",
		body: (
			<>
				<p>See what your friends are playing, finishing and recommending in real time.</p>
				<p className="text-arcade-black/70">
					Follow their libraries, compare tastes and steal their next must‑play.
				</p>
			</>
		),
	},
	{
		key: "violet",
		title: "REVIEW YOUR FAVOURITES",
		borderClass: "border-arcade-violet",
		bgClass: "bg-arcade-violet",
		glowColor: "#5647f1",
		body: (
			<>
				<p>
					Rate and review every game you play, from the biggest disappointments to your
					all‑time favourites.
				</p>
				<p className="text-arcade-black/70">
					Build a permanent record of what you loved (and hated) over time.
				</p>
			</>
		),
	},
	{
		key: "green",
		title: "DISCOVER NEW TITLES",
		borderClass: "border-arcade-purple",
		bgClass: "bg-arcade-purple",
		glowColor: "#8122c0",
		body: (
			<>
				<p>
					Discover new titles based on what you actually play, not just what's trending.
				</p>
				<p className="text-arcade-black/70">
					Smart recommendations and curated lists help you find your next obsession
					faster.
				</p>
			</>
		),
	},
];

function HomePage() {
	const navigate = useNavigate();
	const [activePanel, setActivePanel] = useState<string | null>(null);
	const [isAnimatingClosed, setIsAnimatingClosed] = useState(false);
	const token = localStorage.getItem("access_token");
	const isAuthenticated = token ? true : false;

	const handleSquareClick = (key: string) => {
		if (activePanel === key) {
			setIsAnimatingClosed(true);
			setTimeout(() => {
				setActivePanel(null);
				setIsAnimatingClosed(false);
			}, 500);
			return;
		}
		setIsAnimatingClosed(false);
		setActivePanel(key);
	};

	const closePanel = () => {
		setIsAnimatingClosed(true);
		setTimeout(() => {
			setActivePanel(null);
			setIsAnimatingClosed(false);
		}, 500);
	};

	const isPanelVisible = !!activePanel && !isAnimatingClosed;

	return (
		<>
			<NavigationBar />

			{/* Full screen background */}
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90"
				rotation={32}
				colors={["#8622c2", "#5647f1", "#37b0ea"]}
				speed={0.2}
				scale={2}
				frequency={1}
				warpStrength={1}
				mouseInfluence={1}
				parallax={0.5}
				noise={0.1}
				transparent
				autoRotate={0}
			/>

			{/* Centered content */}
			<div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 relative">
				{/* Title row */}
				<div className="flex flex-col items-center gap-3">
					<span
						className="font-title tracking-tighter text-arcade-white text-3xl sm:text-4xl md:text-5xl whitespace-nowrap
                  drop-shadow-[0_0_1px_#fefddc]"
					>
						Welcome to Arcadaeum.
					</span>
				</div>

				{/* Feature squares */}
				<div className="flex flex-row gap-2 justify-center z-2">
					{features.map((feature) => (
						<FeatureSquare
							key={feature.key}
							bgClass={feature.bgClass}
							glowColor={feature.glowColor}
							label={`Open ${feature.key} info panel`}
							onClick={() => handleSquareClick(feature.key)}
						/>
					))}
				</div>

				{/* Expanding feature panel */}
				<FeaturePanel
					items={features}
					activeKey={activePanel}
					isVisible={isPanelVisible}
					onClose={closePanel}
				/>

				<p className="font-title tracking-tighter drop-shadow-[0_0_2px_#fefddc] text-arcade-white text-lg sm:text-xl md:text-2xl text-center max-w-md">
					Log, review and discover games.
				</p>

				{/* Sign in button */}
				{!isAuthenticated && (
					<button
						onClick={() => navigate("/signin")}
						className="mt-1 px-8 py-3 bg-grey text-arcade-white font-title tracking-tighter drop-shadow-[0_0_1px_#fefddc] text-xl rounded-sm bg-green-500 hover:bg-arcade-white hover:text-black"
					>
						SIGN IN
					</button>
				)}
			</div>
		</>
	);
}

export default HomePage;
