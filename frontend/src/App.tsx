import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import UserPage from "./pages/UserPage";
import CreateAccountPage from "./pages/CreateAccountPage";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/signin" element={<SignInPage />} />
			<Route path="/user" element={<UserPage />} />
			<Route path="/CreateAccount" element={<CreateAccountPage />} />
		</Routes>
	);
}
