import { Link } from "react-router-dom";

type MainButtonProps = {
	text: string;
	onClick?: () => void;
	className?: string;
	navigateTo?: string;
	disabled?: boolean;
};

const buttonClassName =
	"font-secondary inline-flex items-center justify-center rounded-2xl border-4 border-arcade-white px-8 py-2 bg-transparent font-bold tracking-tighter text-sm leading-none relative cursor-pointer hover:scale-110 transition-transform";

export default function MainButton({
	text,
	onClick,
	className = "",
	navigateTo = "",
	disabled = false,
}: MainButtonProps) {
	const disabledClassName = disabled ? "opacity-50 cursor-not-allowed hover:scale-100" : "";
	const combinedClassName = `${buttonClassName} ${disabledClassName} ${className}`.trim();

	if (!navigateTo) {
		return (
			<button
				type="button"
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
