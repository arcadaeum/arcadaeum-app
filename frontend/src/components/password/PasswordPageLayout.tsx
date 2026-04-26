import type { ReactNode } from "react";

import pngLogo from "../../assets/images/LOGO_PURPLE.png";
import { ColorBends, NavigationBar } from "@/components/ui";

type PasswordPageLayoutProps = {
	title?: string;
	description?: string;
	children: ReactNode;
};

export default function PasswordPageLayout({
	title,
	description,
	children,
}: PasswordPageLayoutProps) {
	return (
		<>
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

			<NavigationBar isSignInPage={true} />
			<div className="flex flex-col items-center justify-center font-title min-h-1/2 pt-20 px-4">
				<div className="w-full max-w-md bg-arcade-black p-8 shadow-lg">
					<div className="flex justify-center">
						<img
							src={pngLogo}
							alt="Arcadaeum logo"
							className="w-20 h-20 mb-6 mx-auto object-contain rounded-xl p-1"
						/>
					</div>
					{title && (
						<h1 className="text-4xl font-title tracking-tighter text-arcade-white bg-arcade-black mb-2 text-center">
							{title}
						</h1>
					)}
					{description && (
						<p className="text-arcade-white/70 text-center mb-6 text-sm font-secondary">
							{description}
						</p>
					)}
					{children}
				</div>
			</div>
		</>
	);
}
