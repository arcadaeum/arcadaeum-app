import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Gamepad2 } from "lucide-react";
import type { SettingsPanelProps } from "@/types/settings";
import { unlinkSteamAccount, getSteamAccount } from "@/utils/user/api";
import { startSteamVerification } from "@/utils/user/steam";
import {
	changeDisplayName,
	changePassword,
	changeUsername,
	deleteAccount,
	submitBugReport,
} from "@/utils/user/settings";

export function ChangeUsernamePanel({
	token,
	user,
	onStatusChange,
	onUserUpdate,
}: SettingsPanelProps) {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newUsername, setNewUsername] = useState("");
	const [loading, setLoading] = useState(false);

	const isOAuth = user.oauth_provider != null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newUsername.trim()) {
			onStatusChange("Please enter a new username.", "error");
			return;
		}
		if (!isOAuth && !currentPassword.trim()) {
			onStatusChange("Please enter your password.", "error");
			return;
		}
		setLoading(true);
		try {
			const updatedUser = await changeUsername(
				token,
				newUsername.trim(),
				isOAuth ? null : currentPassword.trim(),
			);
			onStatusChange(
				"Username updated successfully. Please sign in again for the change to take full effect.",
				"success",
			);
			if (onUserUpdate) onUserUpdate(updatedUser);
			setNewUsername("");
			setCurrentPassword("");
		} catch (err: any) {
			onStatusChange(err.message, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="animate-fade-in">
			<h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">
				Change Username
			</h2>
			<p className="text-xs font-default text-arcade-white/40 mb-6">
				Your username is how others find you. It must be unique.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						New Username
					</label>
					<input
						type="text"
						value={newUsername}
						onChange={(e) => setNewUsername(e.target.value)}
						placeholder="e.g. arcade_legend"
						autoComplete="username"
						className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm"
					/>
				</div>
				{!isOAuth && (
					<div>
						<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
							Current Password
						</label>
						<input
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder="Confirm your identity"
							autoComplete="current-password"
							className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm"
						/>
					</div>
				)}
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2.5 bg-black text-arcade-white font-title tracking-tight rounded-lg border border-arcade-white/20 hover:border-arcade-white/40 disabled:opacity-50 transition-colors text-sm"
				>
					{loading ? "Saving..." : "Save Username"}
				</button>
			</form>
		</div>
	);
}

export function ChangeDisplayNamePanel({
	token,
	onStatusChange,
	onUserUpdate,
}: SettingsPanelProps) {
	const [newDisplayName, setNewDisplayName] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = newDisplayName.trim();
		if (!trimmed) {
			onStatusChange("Display name cannot be empty.", "error");
			return;
		}
		setLoading(true);
		try {
			const updatedUser = await changeDisplayName(token, trimmed);
			onStatusChange("Display name updated successfully.", "success");
			if (onUserUpdate) onUserUpdate(updatedUser);
			setNewDisplayName("");
		} catch (err: any) {
			onStatusChange(err.message, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="animate-fade-in">
			<h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">
				Change Display Name
			</h2>
			<p className="text-xs font-default text-arcade-white/40 mb-6">
				Your display name is shown on your profile and can be anything you like.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						New Display Name
					</label>
					<input
						type="text"
						value={newDisplayName}
						onChange={(e) => setNewDisplayName(e.target.value)}
						placeholder="e.g. The Legend"
						autoComplete="nickname"
						className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2.5 bg-black text-arcade-white font-title tracking-tight rounded-lg border border-arcade-white/20 hover:border-arcade-white/40 disabled:opacity-50 transition-colors text-sm"
				>
					{loading ? "Saving..." : "Save Display Name"}
				</button>
			</form>
		</div>
	);
}

export function ChangePasswordPanel({ token, user, onStatusChange }: SettingsPanelProps) {
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const isOAuth = user.oauth_provider != null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
			onStatusChange("Please fill in all fields.", "error");
			return;
		}
		if (newPassword !== confirmPassword) {
			onStatusChange("New passwords do not match.", "error");
			return;
		}
		if (newPassword.length < 8) {
			onStatusChange("New password must be at least 8 characters.", "error");
			return;
		}
		setLoading(true);
		try {
			await changePassword(token, oldPassword, newPassword);
			onStatusChange("Password changed successfully.", "success");
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err: any) {
			onStatusChange(err.message, "error");
		} finally {
			setLoading(false);
		}
	};

	if (isOAuth) {
		return (
			<div className="animate-fade-in">
				<h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">
					Change Password
				</h2>
				<div className="bg-black border border-arcade-white/20 rounded-lg p-4 text-center text-arcade-white/60 font-default text-sm">
					You signed in with Google, so you don't have a password. If you need to create
					one, use the "Forgot password?" option on the sign-in page.
				</div>
			</div>
		);
	}

	return (
		<div className="animate-fade-in">
			<h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">
				Change Password
			</h2>
			<p className="text-xs font-default text-arcade-white/40 mb-6">
				Update your login password. Keep it secure.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						Current Password
					</label>
					<input
						type="password"
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						placeholder="Enter current password"
						autoComplete="current-password"
						className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm"
					/>
				</div>
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						New Password
					</label>
					<input
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder="At least 8 characters"
						autoComplete="new-password"
						className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm"
					/>
				</div>
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						Confirm New Password
					</label>
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm new password"
						autoComplete="off"
						className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2.5 bg-black text-arcade-white font-title tracking-tight rounded-lg border border-arcade-white/20 hover:border-arcade-white/40 disabled:opacity-50 transition-colors text-sm"
				>
					{loading ? "Changing..." : "Change Password"}
				</button>
			</form>
		</div>
	);
}

export function SteamAccountPanel({ token, onStatusChange }: SettingsPanelProps) {
	const [isLinked, setIsLinked] = useState(false);
	const [steamUsername, setSteamUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const apiUrl = import.meta.env.VITE_API_URL as string;

	useEffect(() => {
		if (!token) return;
		getSteamAccount(token, apiUrl)
			.then((account) => {
				if (account.steam_id) {
					setIsLinked(true);
					setSteamUsername(account.steam_username || account.steam_id);
				}
			})
			.catch(() => setIsLinked(false));
	}, [token, apiUrl]);

	const handleVerifyWithSteam = async () => {
		setLoading(true);
		try {
			await startSteamVerification(token);
		} catch (error: any) {
			onStatusChange(error.message || "Failed to start Steam verification", "error");
			setLoading(false);
		}
	};

	const handleUnlink = async () => {
		setLoading(true);
		try {
			await unlinkSteamAccount(token, apiUrl);
			setIsLinked(false);
			setSteamUsername("");
			onStatusChange("Steam account unlinked successfully.", "success");
		} catch (error: any) {
			onStatusChange(error.message || "Failed to unlink", "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="animate-fade-in">
			<h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">
				Steam Connection
			</h2>
			<p className="text-xs font-default text-arcade-white/40 mb-0">
				Link your Steam account to automatically sync your game library.
			</p>
			<p className="text-xs font-default text-arcade-white/40 mb-2">
				(It may take several minutes for your library to appear after linking.)
			</p>
			<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between p-4 bg-black border border-arcade-white/20 rounded-lg">
				<div className="flex items-center gap-4">
					<div
						className={`p-2.5 rounded-lg transition-colors ${
							isLinked
								? "bg-[#171a21]/80 text-[#66c0f4]"
								: "bg-arcade-white/5 text-arcade-white/40"
						}`}
					>
						<Gamepad2 className="w-5 h-5" />
					</div>
					<div>
						<div className="text-sm font-title text-arcade-white">Steam Network</div>
						<div className="text-xs font-default text-arcade-white/50 mt-0.5">
							{isLinked ? `Connected as ${steamUsername}` : "Not connected"}
						</div>
					</div>
				</div>
				<div className="flex gap-2 w-full sm:w-auto">
					{isLinked ? (
						<button
							onClick={handleUnlink}
							disabled={loading}
							className="flex-1 sm:flex-none px-4 py-2 rounded-lg font-title tracking-tight text-sm transition-all disabled:opacity-50 border bg-black text-red-300 border-red-500/20 hover:border-red-500/40"
						>
							{loading ? "Processing..." : "Unlink"}
						</button>
					) : (
						<button
							onClick={handleVerifyWithSteam}
							disabled={loading}
							className="flex-1 sm:flex-none px-4 py-2 rounded-lg font-title tracking-tight text-sm transition-all disabled:opacity-50 border bg-black text-arcade-white border-arcade-white/20 hover:border-arcade-white/40"
						>
							{loading ? "Verifying..." : "Verify with Steam"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export function DeleteAccountPanel({
	token,
	user,
	onStatusChange,
	onUserUpdate,
}: SettingsPanelProps) {
	const [confirmation, setConfirmation] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const confirmPhrase = "DELETE MY ACCOUNT";
	const isOAuth = user.oauth_provider != null;

	const canSubmit = confirmation === confirmPhrase && (isOAuth || password.trim().length > 0);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;
		setLoading(true);
		try {
			await deleteAccount(token, isOAuth ? null : password);
			localStorage.removeItem("access_token");
			if (onUserUpdate) onUserUpdate(null);
			navigate("/signin");
		} catch (err: any) {
			onStatusChange(err.message, "error");
			setLoading(false);
		}
	};

	return (
		<div className="animate-fade-in">
			<div className="flex items-center gap-3 mb-1">
				<AlertTriangle className="w-5 h-5 text-red-400" />
				<h2 className="text-xl font-title tracking-tighter text-red-400">Delete Account</h2>
			</div>
			<p className="text-xs font-default text-arcade-white/40 mb-6">
				This action is permanent and cannot be undone. All your data, library, reviews and
				collections will be erased.
			</p>
			<div className="bg-black border border-red-500/20 rounded-lg px-4 py-3 mb-6">
				<p className="text-xs font-default text-red-300/80">
					Type <span className="font-title text-red-300">{confirmPhrase}</span> below to
					confirm deletion.
				</p>
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						Confirmation
					</label>
					<input
						type="text"
						value={confirmation}
						onChange={(e) => setConfirmation(e.target.value)}
						placeholder={confirmPhrase}
						className="w-full px-4 py-2.5 bg-arcade-black border border-red-500/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-red-500 focus:outline-none transition-colors text-sm"
					/>
				</div>
				{!isOAuth && (
					<div>
						<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Confirm your identity"
							autoComplete="current-password"
							className="w-full px-4 py-2.5 bg-arcade-black border border-red-500/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-red-500 focus:outline-none transition-colors text-sm"
						/>
					</div>
				)}
				<button
					type="submit"
					disabled={!canSubmit || loading}
					className="w-full py-2.5 bg-black text-arcade-white font-title tracking-tight rounded-lg border border-red-500/40 hover:border-red-500/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
				>
					{loading ? "Deleting account..." : "Permanently Delete Account"}
				</button>
			</form>
		</div>
	);
}

export function ReportBugPanel({ token, onStatusChange }: SettingsPanelProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedTitle = title.trim();
		const trimmedDesc = description.trim();
		if (!trimmedTitle || !trimmedDesc) {
			onStatusChange("Please fill in both fields.", "error");
			return;
		}
		setLoading(true);
		try {
			await submitBugReport(token, trimmedTitle, trimmedDesc);
			onStatusChange("Bug report submitted. Thank you!", "success");
			setTitle("");
			setDescription("");
		} catch (err: any) {
			onStatusChange(err.message, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="animate-fade-in">
			<h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">
				Report a Bug
			</h2>
			<p className="text-xs font-default text-arcade-white/40 mb-6">
				Found something broken? Let us know and we'll get it fixed.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						Bug Title
					</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Short description of the issue"
						className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm"
					/>
				</div>
				<div>
					<label className="block text-xs font-title text-arcade-white/60 mb-2 tracking-widest uppercase">
						Description
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Steps to reproduce, what you expected, what happened instead..."
						rows={5}
						className="w-full px-4 py-2.5 bg-arcade-black border border-arcade-white/20 rounded-lg text-arcade-white font-default placeholder:text-arcade-white/20 focus:border-arcade-blue focus:outline-none transition-colors text-sm resize-none"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2.5 bg-black text-arcade-white font-title tracking-tight rounded-lg border border-arcade-white/20 hover:border-arcade-white/40 disabled:opacity-50 transition-colors text-sm"
				>
					{loading ? "Submitting..." : "Submit Bug Report"}
				</button>
			</form>
		</div>
	);
}
