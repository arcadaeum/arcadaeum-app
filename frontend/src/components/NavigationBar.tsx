import { Link } from "react-router-dom";

export default function NavigationBar() {
	return (
		<nav className="absolute top-4 right-4 z-20 space-x-4">
			<Link to="/">Home</Link>
			<Link to="/signin">Sign In</Link>
			<Link to="/user">User Page</Link>
		</nav>
	);
}
