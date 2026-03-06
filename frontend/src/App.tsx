import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import UserPage from "./pages/UserPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/signin" element={<SignInPage />} />
			<Route path="/user" element={<UserPage />} />
			<Route path="/createaccount" element={<CreateAccountPage />} />
			<Route path="/auth/callback" element={<AuthCallbackPage />} />
		</Routes>
	);
}
