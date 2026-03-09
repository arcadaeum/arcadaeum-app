interface FeatureSquareProps {
	/** Tailwind background class, e.g. "bg-arcade-red" */
	bgClass: string;
	/** CSS color for the glow, e.g. "#ff2a2a" */
	glowColor: string;
	/** Accessible label */
	label: string;
	/** Click handler */
	onClick: () => void;
}

function FeatureSquare({ bgClass, glowColor, label, onClick }: FeatureSquareProps) {
	return (
		<button
			onClick={onClick}
			className={`w-12 h-12 ${bgClass} cursor-pointer hover:scale-110 transition-transform`}
			style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
			aria-label={label}
		/>
	);
}

export default FeatureSquare;
