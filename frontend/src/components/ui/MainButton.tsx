import { Link } from "react-router-dom";

type MainButtonProps = {
	text: string;
	onClick?: () => void;
	className?: string;
	navigateTo?: string;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
};

const buttonClassName =
	"bg-arcade-black hover:bg-arcade-blue text-arcade-white font-title py-2 px-6 border-2 border-arcade-white rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer";

export default function MainButton({
	text,
	onClick,
	className = "",
	navigateTo = "",
	disabled = false,
	type = "button",
}: MainButtonProps) {
	const disabledClassName = disabled ? "opacity-50 cursor-not-allowed hover:bg-arcade-black" : "";
	const combinedClassName = `${buttonClassName} ${disabledClassName} ${className}`.trim();

	if (!navigateTo) {
		return (
			<button
				type={type}
				className={combinedClassName}
				onClick={onClick}
				disabled={disabled}
			>
				{text}
			</button>
		);
	}

	if (disabled) {
		return (
			<span className={combinedClassName} aria-disabled="true">
				{text}
			</span>
		);
	}

	return (
		<Link to={navigateTo} className={combinedClassName} onClick={onClick}>
			{text}
		</Link>
	);
}
