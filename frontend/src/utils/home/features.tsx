import type { HomeFeatureItem } from "@/types/home";

export const HOME_FEATURES: HomeFeatureItem[] = [
	{
		key: "white",
		title: "TRACK YOUR BACKLOG",
		borderClass: "border-arcade-white",
		bgClass: "bg-arcade-white",
		glowColor: "#ece4d5",
		body: (
			<>
				<p>
					Log every game in your backlog, track what you have finished, what you are playing,
					and what is still waiting.
				</p>
				<p className="text-arcade-black/70">
					Use custom statuses and filters to keep your library under control.
				</p>
			</>
		),
	},
	{
		key: "blue",
		title: "SEE WHAT FRIENDS PLAY",
		borderClass: "border-arcade-blue",
		bgClass: "bg-arcade-blue",
		glowColor: "#37b0ea",
		body: (
			<>
				<p>See what your friends are playing, finishing and recommending in real time.</p>
				<p className="text-arcade-black/70">
					Follow their libraries, compare tastes and steal their next must-play.
				</p>
			</>
		),
	},
	{
		key: "violet",
		title: "REVIEW YOUR FAVOURITES",
		borderClass: "border-arcade-violet",
		bgClass: "bg-arcade-violet",
		glowColor: "#5647f1",
		body: (
			<>
				<p>
					Rate and review every game you play, from the biggest disappointments to your all-time
					favourites.
				</p>
				<p className="text-arcade-black/70">
					Build a permanent record of what you loved (and hated) over time.
				</p>
			</>
		),
	},
	{
		key: "purple",
		title: "DISCOVER NEW TITLES",
		borderClass: "border-arcade-purple",
		bgClass: "bg-arcade-purple",
		glowColor: "#8122c0",
		body: (
			<>
				<p>Discover new titles based on what you actually play, not just what's trending.</p>
				<p className="text-arcade-black/70">
					Smart recommendations and curated lists help you find your next obsession faster.
				</p>
			</>
		),
	},
];
