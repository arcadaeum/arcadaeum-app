export default function HomeAuthenticatedContent() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 relative">
			<div className="flex flex-col items-center gap-3">
				<span
					className="font-title tracking-tighter text-arcade-white text-3xl sm:text-4xl md:text-5xl whitespace-nowrap
				  drop-shadow-[0_0_1px_#fefddc]"
				>
					This is the authenticated homepage section.
				</span>
			</div>
		</div>
	);
}
