import type { HomeFeatureItem } from "@/types/home";
import { FeaturePanel, FeatureSquare } from "@/components/home";

type HomeGuestContentProps = {
	features: HomeFeatureItem[];
	activePanel: string | null;
	isPanelVisible: boolean;
	onSquareClick: (key: string) => void;
	onClosePanel: () => void;
	onSignIn: () => void;
};

export default function HomeGuestContent({
	features,
	activePanel,
	isPanelVisible,
	onSquareClick,
	onClosePanel,
	onSignIn,
}: HomeGuestContentProps) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 relative">
			<div className="flex flex-col items-center gap-3">
				<span
					className="font-title tracking-tighter text-arcade-white text-3xl sm:text-4xl md:text-5xl whitespace-nowrap
                  drop-shadow-[0_0_1px_#fefddc]"
				>
					Welcome to Arcadaeum.
				</span>
			</div>

			<div className="flex flex-row gap-2 justify-center z-2">
				{features.map((feature) => (
					<FeatureSquare
						key={feature.key}
						bgClass={feature.bgClass}
						glowColor={feature.glowColor}
						label={`Open ${feature.key} info panel`}
						onClick={() => onSquareClick(feature.key)}
					/>
				))}
			</div>

			<FeaturePanel
				items={features}
				activeKey={activePanel}
				isVisible={isPanelVisible}
				onClose={onClosePanel}
			/>

			<p className="font-title tracking-tighter drop-shadow-[0_0_2px_#fefddc] text-arcade-white text-lg sm:text-xl md:text-2xl text-center max-w-md">
				Log, review and discover games.
			</p>

			<button
				onClick={onSignIn}
				className="mt-1 px-8 py-3 bg-grey text-arcade-white font-title tracking-tighter drop-shadow-[0_0_1px_#fefddc] text-xl rounded-sm bg-arcade-blue hover:bg-arcade-white hover:text-arcade-black"
			>
				SIGN IN
			</button>
		</div>
	);
}
