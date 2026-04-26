export default function UserStatsBar() {
	return (
		<div
			className="flex gap-6 -mt-11 font-default text-xs text-gray-400 tracking-wider items-center"
			style={{ marginLeft: "28.5rem" }}
		>
			<span>
				<span className="text-arcade-white font-bold">128</span> Followers
			</span>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<span>
				<span className="text-arcade-white font-bold">64</span> Following
			</span>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<span>
				<span className="text-arcade-white font-bold">42</span> Games
			</span>
			<span className="w-1 h-1 rounded-full bg-gray-500" />
			<span>
				<span className="text-arcade-white font-bold">17</span> Reviews
			</span>
		</div>
	);
}
