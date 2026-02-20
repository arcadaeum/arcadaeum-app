import NavigationBar from "../components/NavigationBar";

function SignInPage() {
	return (
		<>
			<h1>Sign In Page</h1>
			<NavigationBar />
			<form>
				<label>Username:</label>
				<input type="text" name="username" />
				<br />
				<label>Password:</label>
				<input type="password" name="password" />
				<br />
				<button type="submit">Sign In</button>
				<button type="button">Sign Up</button>
			</form>
		</>
	);
}

export default SignInPage;
