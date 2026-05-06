import { useEffect, useState } from "react";
import { getUserDisplayName } from "@/utils/user";

export default function HomeAuthenticatedContent() {
	const [displayName, setDisplayName] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (!token) return;
		const apiUrl = import.meta.env.VITE_API_URL as string;

		fetch(`${apiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } })
			.then((res) => {
				if (!res.ok) return null;
				return res.json();
			})
			.then((data) => {
				if (!data) return;
				setDisplayName(getUserDisplayName(data, "Player"));
			})
			.catch(() => {
				/* ignore */
			});
	}, []);

	const nameToShow = displayName ?? localStorage.getItem("username") ?? "Player";

	return (
		<div className="relative w-full min-h-screen px-4 pb-16">
			<section className="w-full max-w-6xl mx-auto pt-28">
				<div className="relative overflow-hidden rounded-3xl border border-arcade-white/10 bg-arcade-black/60 shadow-[0_0_40px_rgba(86,71,241,0.25)]">
					<div className="absolute inset-0">
						<div
							className="h-full w-full bg-center bg-cover opacity-80"
							style={{
								backgroundImage:
									"url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1800&q=80')",
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-arcade-black/40 to-arcade-black" />
						<div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-arcade-violet/40 via-arcade-blue/20 to-transparent" />
					</div>
					<div className="relative z-10 px-6 py-16 sm:px-10 md:px-14 md:py-24">
						<p className="font-title text-arcade-white/90 text-lg sm:text-xl">
							Welcome back, {nameToShow}!
						</p>
						<h1 className="mt-3 font-title tracking-tighter text-arcade-white text-4xl sm:text-5xl md:text-6xl drop-shadow-[0_0_6px_rgba(254,253,220,0.35)]">
							Discover your next adventure
						</h1>
						<p className="mt-4 max-w-2xl text-arcade-white/70 text-base sm:text-lg">
							Curated picks, fresh updates, and a spotlight on what you love most.
						</p>
					</div>
				</div>
			</section>

			<section className="w-full max-w-6xl mx-auto mt-10 grid gap-6 md:grid-cols-3">
				<div className="min-h-48 rounded-2xl border border-arcade-white/10 bg-arcade-black/80 p-6">
					<h2 className="font-title text-arcade-white text-2xl">News Feed</h2>
					<p className="mt-2 text-arcade-white/60">
						Latest headlines and updates go here.
					</p>
				</div>
				<div className="min-h-48 rounded-2xl border border-arcade-white/10 bg-arcade-black/80 p-6">
					<h2 className="font-title text-arcade-white text-2xl">Social Spotlight</h2>
					<p className="mt-2 text-arcade-white/60">
						Friend activity and community highlights.
					</p>
				</div>
				<div className="min-h-48 rounded-2xl border border-arcade-white/10 bg-arcade-black/80 p-6">
					<h2 className="font-title text-arcade-white text-2xl">Game of the Day</h2>
					<p className="mt-2 text-arcade-white/60">A rotating pick with quick details.</p>
				</div>
			</section>
		</div>
	);
}
