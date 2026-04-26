import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { NavigationBar, ColorBends } from "@/components/ui";
import { HomeAuthenticatedContent, HomeGuestContent } from "@/components/home";
import { HOME_FEATURES } from "@/utils/home";

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
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-90"
				rotation={32}
				colors={["#8122c0", "#5647f1", "#37b0ea"]}
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

			{!isAuthenticated ? (
				<HomeGuestContent
					features={HOME_FEATURES}
					activePanel={activePanel}
					isPanelVisible={isPanelVisible}
					onSquareClick={handleSquareClick}
					onClosePanel={closePanel}
					onSignIn={() => navigate("/signin")}
				/>
			) : (
				<HomeAuthenticatedContent />
			)}
		</>
	);
}

export default HomePage;
