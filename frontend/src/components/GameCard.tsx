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
			className="min-w-[10rem] cursor-pointer select-none overflow-hidden bg-arcade-black drop-shadow-lg duration-200 rounded-sm relative group"
		>
			<div className="w-full h-full bg-gray-800">
				<img
					src={
						image ??
						`https://via.placeholder.com/320x180?text=${encodeURIComponent(title)}`
					}
					alt={title}
					className="w-full h-full object-cover"
				/>
			</div>
			{/* absolute overlay border that doesn't affect layout */}
			<div className="pointer-events-none absolute inset-0 rounded-sm border-0 transition-all duration-100 group-hover:border-4 group-hover:border-arcade-white" />
		</div>
	);
}
