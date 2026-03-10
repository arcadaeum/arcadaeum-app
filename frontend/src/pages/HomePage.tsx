import NavigationBar from "../components/NavigationBar";
import ColorBends from "../components/ColorBends";
import RotatingText from "../components/RotatingText";
import FeatureSquare from "../components/FeatureSquare";
import FeaturePanel, { type FeatureItem } from "../components/FeaturePanel";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const features: (FeatureItem & { bgClass: string; glowColor: string })[] = [
	{
		key: "red",
		title: "TRACK YOUR BACKLOG",
		borderClass: "border-arcade-red",
		bgClass: "bg-arcade-red",
		glowColor: "#ff2a2a",
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
		borderClass: "border-arcade-orange",
		bgClass: "bg-arcade-orange",
		glowColor: "#ff7a00",
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
		key: "yellow",
		title: "REVIEW YOUR FAVOURITES",
		borderClass: "border-arcade-yellow",
		bgClass: "bg-arcade-yellow",
		glowColor: "#ffe826",
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
		borderClass: "border-arcade-green",
		bgClass: "bg-arcade-green",
		glowColor: "#00c951",
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
				colors={["#ff2a2a", "#ff7a00", "#00c951"]}
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
			<div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4 relative">
				{/* Title row */}
				<div className="flex flex-row items-center gap-3 flex-wrap justify-center">
					<span
						className="font-main text-arcade-white text-3xl sm:text-4xl md:text-5xl whitespace-nowrap
                  drop-shadow-[0_0_3px_#fefddc]"
					>
						WELCOME TO
					</span>
					<RotatingText
						texts={["ARCADAEUM", "YOUR LIBRARY", "YOUR REVIEWS"]}
						mainClassName="px-3 py-1 bg-arcade-white text-arcade-black overflow-hidden justify-center rounded-sm font-main font-bold text-3xl sm:text-4xl md:text-5xl drop-shadow-[0_0_3px_#fefddc] [text-shadow:0_0_6px_#fefddc,0_0_14px_#fefddc]"
						staggerFrom="last"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "-120%" }}
						staggerDuration={0.025}
						splitLevelClassName="overflow-hidden pb-0.5"
						transition={{ type: "spring", damping: 30, stiffness: 400 }}
						rotationInterval={2000}
					/>
				</div>

				{/* Feature squares */}
				<div className="flex flex-row gap-5 justify-center z-20">
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

				<p className="font-main font-bold text-arcade-white text-lg sm:text-base text-center max-w-md drop-shadow-[0_0_0.5px_#fefddc]">
					LOG, REVIEW AND DISCOVER GAMES
				</p>

				{/* Sign in button */}
				<button
					onClick={() => navigate("/signin")}
					className="px-8 py-3 bg-grey text-arcade-white font-main text-lg rounded-sm bg-green-500 hover:bg-arcade-white hover:text-black"
				>
					SIGN IN
				</button>
			</div>
		</>
	);
}

export default HomePage;
