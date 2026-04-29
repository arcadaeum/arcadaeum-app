type UserStatsBarProps = {
	followersCount?: number;
	followingCount?: number;
	gamesCount?: number;
	reviewsCount?: number;
};

export default function UserStatsBar({
	followersCount = 0,
	followingCount = 0,
	gamesCount = 0,
	reviewsCount = 0,
}: UserStatsBarProps) {
	return (
		<div
			className="flex gap-6 -mt-11 font-default text-xs text-gray-400 tracking-wider items-center"
			style={{ marginLeft: "28.5rem" }}
		>
			<span>
				<span className="text-arcade-white font-bold">{followersCount}</span> Followers
			</span>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<span>
				<span className="text-arcade-white font-bold">{followingCount}</span> Following
			</span>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<span>
				<span className="text-arcade-white font-bold">{gamesCount}</span> Games
			</span>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<span>
				<span className="text-arcade-white font-bold">{reviewsCount}</span> Reviews
			</span>
		</div>
	);
}
