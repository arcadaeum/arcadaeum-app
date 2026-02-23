import NavigationBar from "../components/NavigationBar";

function UserPage() {
	return (
		<>
			<NavigationBar />
			<div className="flex flex-col items-center font-main min-h-screen pt-20">
				<div className="w-30 h-30 bg-white rounded-full"></div>
				<h1 className="mt-8 text-3xl font-secondary text-center">username_here</h1>
				<h2 className="w-full max-w-4xl mt-12 text-lg font-secondary text-gray-300 border-b-4 border-arcade-gold">
					FAVORITE GAMES
				</h2>
			</div>
		</>
	);
}

export default UserPage;
