import type { HomeFeatureItem } from "@/types/home";

interface FeaturePanelProps {
	items: HomeFeatureItem[];
	activeKey: string | null;
	isVisible: boolean;
	onClose: () => void;
}

function FeaturePanel({ items, activeKey, isVisible, onClose }: FeaturePanelProps) {
	const activeItem = items.find((item) => item.key === activeKey);

	return (
		<div className="w-1/2 overflow-hidden">
			<div
				className={`transition-[max-height,transform,opacity] duration-500 ease-out origin-top rounded-xl bg-arcade-white backdrop-blur-sm overflow-hidden
					${isVisible ? "max-h-80 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-3"}`}
			>
				{activeItem && (
					<div className="flex flex-col h-full">
						<div className="flex items-center justify-between px-4 py-3 pb-1">
							<h2 className="font-title font-bold text-arcade-black text-base sm:text-lg">
								{activeItem.title}
							</h2>
							<button
								onClick={onClose}
								className="text-arcade-black/60 hover:text-arcade-black text-xs sm:text-sm font-title"
							>
								CLOSE
							</button>
						</div>
						<div className="px-4 pb-4 text-arcade-black font-secondary tracking-tight text-xs sm:text-lg space-y-3">
							<div className={`border-t-4 ${activeItem.borderClass} pt-2`}>
								{activeItem.body}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default FeaturePanel;
