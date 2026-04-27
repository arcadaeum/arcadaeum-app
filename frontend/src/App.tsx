import { Routes, Route } from "react-router-dom";
import {
	HomePage,
	SignInPage,
	UserPage,
	CreateAccountPage,
	AuthCallbackPage,
	GameDetailPage,
	BrowsePage,
	ForgotPasswordPage,
	PasswordResetPage,
	ProfilePage,
} from "@/pages";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/signin" element={<SignInPage />} />
			<Route path="/user" element={<UserPage />} />
			<Route path="/createaccount" element={<CreateAccountPage />} />
			<Route path="/auth/callback" element={<AuthCallbackPage />} />
			<Route path="/games/:id" element={<GameDetailPage />} />
			<Route path="/browse" element={<BrowsePage />} />
			<Route path="/forgot-password" element={<ForgotPasswordPage />} />
			<Route path="/reset-password" element={<PasswordResetPage />} />
			<Route path="/users/:userId" element={<ProfilePage />} />
		</Routes>
	);
}
