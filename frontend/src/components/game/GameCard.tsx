import { useNavigate } from "react-router-dom";

type GameCardProps = {
	id: string | number;
	title: string;
	image?: string | null;
	onClick?: (id: string | number) => void;
};

export default function GameCard({ id, title, image, onClick }: GameCardProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		if (onClick) onClick(id);
		else navigate(`/games/${id}`);
	};

	return (
		<div
			onClick={handleClick}
			role="button"
			className="group min-w-40 cursor-pointer select-none rounded-sm overflow-hidden bg-arcade-black duration-200 drop-shadow-lg"
		>
			<div className="w-full h-full bg-gray-800 relative">
				<img
					src={
						image ??
						`https://via.placeholder.com/320x180?text=${encodeURIComponent(title)}`
					}
					alt={title}
					className="w-full h-full object-cover relative z-0 block"
				/>
				<div className="pointer-events-none absolute inset-0 z-10 rounded-sm transition-all duration-200 border-4 border-transparent group-hover:border-arcade-white box-border" />
			</div>
			<div className="px-3 py-2">
				<div className="text-sm font-default text-arcade-white truncate">{title}</div>
			</div>
		</div>
	);
}
