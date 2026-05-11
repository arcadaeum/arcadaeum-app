import { Link } from "react-router-dom";

type UserStatsBarProps = {
	followersCount?: number;
	followingCount?: number;
	gamesCount?: number;
	collectionsCount?: number;
	collectionsLink?: string;
	reviewsCount?: number;
};

export default function UserStatsBar({
	followersCount = 0,
	followingCount = 0,
	gamesCount = 0,
	collectionsCount = 0,
	collectionsLink = "/collections",
	reviewsCount = 0,
}: UserStatsBarProps) {
	return (
		<div
			className="flex gap-6 -mt-11 font-default text-xs text-gray-400 tracking-wider items-center relative z-10"
			style={{ marginLeft: "28.5rem" }}
		>
			<Link
				to="/social"
				className="hover:text-arcade-white transition-colors inline-flex items-center cursor-pointer pointer-events-auto"
			>
				<span>
					<span className="text-arcade-white font-bold">{followersCount}</span> Followers
				</span>
			</Link>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<Link
				to="/social"
				className="hover:text-arcade-white transition-colors inline-flex items-center cursor-pointer pointer-events-auto"
			>
				<span>
					<span className="text-arcade-white font-bold">{followingCount}</span> Following
				</span>
			</Link>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<Link
				to="/library"
				className="hover:text-arcade-white transition-colors inline-flex items-center cursor-pointer pointer-events-auto"
			>
				<span>
					<span className="text-arcade-white font-bold">{gamesCount}</span> Games
				</span>
			</Link>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<Link
				to={collectionsLink}
				className="hover:text-arcade-white transition-colors inline-flex items-center cursor-pointer pointer-events-auto"
			>
				<span>
					<span className="text-arcade-white font-bold">{collectionsCount}</span>{" "}
					Collections
				</span>
			</Link>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<span>
				<span className="text-arcade-white font-bold">{reviewsCount}</span> Reviews
			</span>
		</div>
	);
}
