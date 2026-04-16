interface FeatureSquareProps {
	bgClass: string;
	glowColor: string;
	label: string;
	onClick: () => void;
}

function FeatureSquare({ bgClass, glowColor, label, onClick }: FeatureSquareProps) {
	return (
		<button
			onClick={onClick}
			className={`w-12 h-12 ${bgClass} cursor-pointer rounded hover:scale-110 transition-transform`}
			style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
			aria-label={label}
		/>
	);
}

export default FeatureSquare;
