import { Link } from "react-router-dom";

type UserStatsBarProps = {
	followersCount?: number;
	followingCount?: number;
	gamesCount?: number;
	collectionsCount?: number;
	collectionsLink?: string;
	reviewsCount?: number;
	reviewsLink?: string;
	disableFollowerLinks?: boolean;
	className?: string;
};

export default function UserStatsBar({
	followersCount = 0,
	followingCount = 0,
	gamesCount = 0,
	collectionsCount = 0,
	collectionsLink = "/collections",
	reviewsCount = 0,
	reviewsLink = "/reviews",
	disableFollowerLinks = false,
	className,
}: UserStatsBarProps) {
	return (
		<div
			className={`relative z-10 flex items-center gap-6 -mt-11 ml-[28.5rem] font-default text-xs tracking-wider text-gray-400 max-sm:mt-4 max-sm:ml-0 max-sm:w-full max-sm:flex-wrap max-sm:justify-center max-sm:gap-x-4 max-sm:gap-y-2 ${className ?? ""}`}
		>
			{disableFollowerLinks ? (
				<span className="inline-flex items-center">
					<span>
						<span className="text-arcade-white font-bold">{followersCount}</span>{" "}
						Followers
					</span>
				</span>
			) : (
				<Link
					to="/social"
					className="hover:text-arcade-white transition-colors inline-flex items-center cursor-pointer pointer-events-auto"
				>
					<span>
						<span className="text-arcade-white font-bold">{followersCount}</span>{" "}
						Followers
					</span>
				</Link>
			)}
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			{disableFollowerLinks ? (
				<span className="inline-flex items-center">
					<span>
						<span className="text-arcade-white font-bold">{followingCount}</span>{" "}
						Following
					</span>
				</span>
			) : (
				<Link
					to="/social"
					className="hover:text-arcade-white transition-colors inline-flex items-center cursor-pointer pointer-events-auto"
				>
					<span>
						<span className="text-arcade-white font-bold">{followingCount}</span>{" "}
						Following
					</span>
				</Link>
			)}
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
			<Link
				to={reviewsLink}
				className="hover:text-arcade-white transition-colors inline-flex items-center cursor-pointer pointer-events-auto"
			>
				<span>
					<span className="text-arcade-white font-bold">{reviewsCount}</span> Reviews
				</span>
			</Link>
		</div>
	);
}
