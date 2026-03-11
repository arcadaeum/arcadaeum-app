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
			className="w-56 min-w-[14rem] cursor-pointer select-none rounded-lg overflow-hidden bg-arcade-black drop-shadow-lg"
		>
			<div className="w-full h-36 bg-gray-800">
				<img
					src={
						image ??
						`https://via.placeholder.com/320x180?text=${encodeURIComponent(title)}`
					}
					alt={title}
					className="w-full h-full object-cover"
				/>
			</div>
			<div className="px-3 py-2">
				<div className="text-sm font-secondary text-arcade-white truncate">{title}</div>
			</div>
		</div>
	);
}
