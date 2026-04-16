function Header() {
	return (
		<header className="min-w-screen text-center">
			<h1 className="text-8xl font-title tracking-[-0.1em] mb-0 z-10 drop-shadow-[0_0_5px_#ffffff]">
				Arcadaeum
			</h1>
			<div className="bg-arcade-white h-4 w-full mb-1.5 z-10 drop-shadow-[0_0_20px_#ff2a2a]"></div>
			<div className="bg-arcade-blue h-4 w-full mb-1.5 z-10 drop-shadow-[0_0_20px_#ffb300]"></div>
			<div className="bg-arcade-violet h-4 w-full mb-1.5 z-10 drop-shadow-[0_0_20px_#ffd000]"></div>
		</header>
	);
}

export default Header;
