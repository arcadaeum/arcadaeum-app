import { Link } from "react-router-dom";

type MainButtonProps = {
	text: string;
	onClick?: () => void;
	className?: string;
	navigateTo?: string;
};

const buttonClassName =
	"font-secondary inline-flex items-center justify-center rounded-2xl border-4 border-arcade-white px-8 py-2 bg-transparent font-bold tracking-tighter text-sm leading-none relative cursor-pointer hover:scale-110 transition-transform";

export default function MainButton({
	text,
	onClick,
	className = "",
	navigateTo = "",
}: MainButtonProps) {
	const combinedClassName = `${buttonClassName} ${className}`.trim();

	if (!navigateTo) {
		return (
			<button type="button" className={combinedClassName} onClick={onClick}>
				{text}
			</button>
		);
	}

	return (
		<Link to={navigateTo} className={combinedClassName} onClick={onClick}>
			{text}
		</Link>
	);
}
