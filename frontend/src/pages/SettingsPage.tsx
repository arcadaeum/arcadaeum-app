import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import {
	User,
	Type,
	KeyRound,
	Trash2,
	Bug,
	Gamepad2,
	ChevronRight,
	ChevronLeft,
	Check,
	AlertTriangle,
	X,
} from "lucide-react";
import { unlinkSteamAccount, getSteamAccount } from "@/utils/user/api";
import { startSteamVerification } from "@/utils/user/steam";
import {
	type UserProfile,
	changeUsername,
	changeDisplayName,
	changePassword,
	deleteAccount,
	submitBugReport,
} from "@/utils/user/settings";

// ─── Types ───────────────────────────────────────────────────────────────────

type SettingSection = "username" | "displayname" | "password" | "steam" | "bug" | "delete" | null;

type AlertVariant = "success" | "error";

interface StatusAlertProps {
	message: string;
	variant: AlertVariant;
	onDismiss: () => void;
}

// FIX: typed user as UserProfile instead of any
interface PanelProps {
	token: string;
	user: UserProfile;
	onStatusChange: (message: string, variant: AlertVariant) => void;
	onUserUpdate?: (user: UserProfile | null) => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusAlert({ message, variant, onDismiss }: StatusAlertProps) {
	if (!message) return null;
	const isError = variant === "error";
	return (
		<div
			className={`flex items-start gap-3 px-4 py-3 rounded-lg border mb-5 text-sm font-default ${
				isError
					? "bg-black border-red-500/40 text-red-300"
					: "bg-black border-green-500/40 text-green-300"
			}`}
		>
			{isError ? (
				<AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
			) : (
				<Check className="w-4 h-4 mt-0.5 shrink-0" />
			)}
			<span className="flex-1">{message}</span>
			<button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
				<X className="w-4 h-4" />
			</button>
		</div>
	);
}

interface SectionRowProps {
	icon: React.ReactNode;
	label: string;
	description: string;
	active: boolean;
	danger?: boolean;
	onClick: () => void;
}

function SectionRow({
	icon,
	label,
	description,
	active,
	danger = false,
	onClick,
}: SectionRowProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center gap-3 px-4 py-3 md:gap-4 md:px-5 md:py-4 rounded-xl border transition-all duration-200 text-left group ${
				active
					? danger
						? "bg-arcade-black border-red-500/50"
						: "bg-arcade-black border-arcade-white/30"
					: "bg-arcade-black border-arcade-white/10 hover:border-arcade-white/30 hover:bg-arcade-black"
			}`}
		>
			<span
				className={`p-2 rounded-lg transition-colors ${
					active
						? danger
							? "bg-red-500/20 text-red-400"
							: "bg-arcade-blue/20 text-arcade-blue"
						: "bg-arcade-white/5 text-arcade-white/50 group-hover:text-arcade-white/80"
				}`}
			>
				{icon}
			</span>
			<div className="flex-1 min-w-0">
				<div
					className={`font-title text-sm tracking-tight ${danger ? "text-red-400" : "text-arcade-white"}`}
				>
					{label}
				</div>
				<div className="hidden sm:block text-xs font-default text-arcade-white/40 mt-0.5">
					{description}
				</div>
			</div>
			<ChevronRight
				className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
					active
						? "rotate-90 text-arcade-white/60"
						: "text-arcade-white/20 group-hover:text-arcade-white/40"
				}`}
			/>
		</button>
	);
}

// ─── Section panels ───────────────────────────────────────────────────────────

function ChangeUsernamePanel({ token, user, onStatusChange, onUserUpdate }: PanelProps) {
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

function ChangeDisplayNamePanel({ token, onStatusChange, onUserUpdate }: PanelProps) {
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

function ChangePasswordPanel({ token, user, onStatusChange }: PanelProps) {
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
		if (newPassword.length < 6) {
			onStatusChange("New password must be at least 6 characters.", "error");
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

function SteamAccountPanel({ token, onStatusChange }: PanelProps) {
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
			// Redirect happens, so we don't set status here
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
			<p className="text-sm font-default text-arcade-white/40 mb-2">
				Your Steam library needs to be public for this feature to work
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

function DeleteAccountPanel({ token, user, onStatusChange, onUserUpdate }: PanelProps) {
	const [confirmation, setConfirmation] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const CONFIRM_PHRASE = "DELETE MY ACCOUNT";
	const isOAuth = user.oauth_provider != null;

	const canSubmit = confirmation === CONFIRM_PHRASE && (isOAuth || password.trim().length > 0);

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
					Type <span className="font-title text-red-300">{CONFIRM_PHRASE}</span> below to
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
						placeholder={CONFIRM_PHRASE}
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

function ReportBugPanel({ token, onStatusChange }: PanelProps) {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
	const [activeSection, setActiveSection] = useState<SettingSection>(null);
	const [status, setStatus] = useState<{ message: string; variant: AlertVariant } | null>(null);
	const [user, setUser] = useState<UserProfile | null>(null);
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;
	const token = localStorage.getItem("access_token");

	// Check for Steam verification status in URL query params
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has("steam_success")) {
			setStatus({
				message: "Steam account linked successfully!",
				variant: "success",
			});
			window.history.replaceState({}, document.title, window.location.pathname);
		} else if (searchParams.has("steam_error")) {
			const errorCode = searchParams.get("steam_error");
			const errorMessages: Record<string, string> = {
				invalid_token: "Invalid or expired verification token",
				token_expired: "Verification token expired. Please try again.",
				verification_failed: "Steam verification failed. Please try again.",
				already_linked: "This Steam account is already linked to another user",
				link_failed: "Failed to link Steam account. Please try again.",
			};
			setStatus({
				message: errorMessages[errorCode ?? ""] || "Steam verification failed",
				variant: "error",
			});
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	// Fetch current user info
	useEffect(() => {
		if (!token) {
			navigate("/signin");
			return;
		}
		fetch(`${apiUrl}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error("Unauthorized");
				return res.json();
			})
			.then((data: UserProfile) => setUser(data))
			.catch(() => {
				localStorage.removeItem("access_token");
				navigate("/signin");
			});
	}, [token, apiUrl, navigate]);

	const toggleSection = (section: SettingSection) => {
		setActiveSection((prev) => (prev === section ? null : section));
	};

	const clearStatus = () => setStatus(null);

	const renderPanel = () => {
		if (!token || !user) return null;
		const commonProps: PanelProps = {
			token,
			user,
			onStatusChange: (message: string, variant: AlertVariant) =>
				setStatus({ message, variant }),
			onUserUpdate: (updated) => setUser(updated),
		};
		switch (activeSection) {
			case "username":
				return <ChangeUsernamePanel {...commonProps} />;
			case "displayname":
				return <ChangeDisplayNamePanel {...commonProps} />;
			case "password":
				return <ChangePasswordPanel {...commonProps} />;
			case "steam":
				return <SteamAccountPanel {...commonProps} />;
			case "bug":
				return <ReportBugPanel {...commonProps} />;
			case "delete":
				return <DeleteAccountPanel {...commonProps} />;
			default:
				return null;
		}
	};

	const sections = [
		{
			key: "username" as SettingSection,
			icon: <User className="w-4 h-4" />,
			label: "Change Username",
			description: "Update the handle others use to find you",
			danger: false,
		},
		{
			key: "displayname" as SettingSection,
			icon: <Type className="w-4 h-4" />,
			label: "Change Display Name",
			description: "Edit the name shown on your profile",
			danger: false,
		},
		{
			key: "password" as SettingSection,
			icon: <KeyRound className="w-4 h-4" />,
			label: "Change Password",
			description: "Update your login password",
			danger: false,
		},
		{
			key: "steam" as SettingSection,
			icon: <Gamepad2 className="w-4 h-4" />,
			label: "Steam Account",
			description: "Link or unlink your Steam profile",
			danger: false,
		},
		{
			key: "bug" as SettingSection,
			icon: <Bug className="w-4 h-4" />,
			label: "Report a Bug",
			description: "Something broken? Let us know",
			danger: false,
		},
		{
			key: "delete" as SettingSection,
			icon: <Trash2 className="w-4 h-4" />,
			label: "Delete Account",
			description: "Permanently remove your account and all data",
			danger: true,
		},
	];

	if (!user) return <div>Loading...</div>;

	return (
		<>
			<NavigationBar />
			<ColorBends
				className="fixed inset-0 -z-10 pointer-events-none opacity-100"
				rotation={32}
				colors={["#8122c0", "#5647f1", "#37b0ea"]}
				speed={0.2}
				scale={2}
				frequency={1}
				warpStrength={1}
				mouseInfluence={1}
				parallax={0.5}
				noise={0.1}
				transparent
				autoRotate={0}
			/>

			<div className="flex flex-col items-start font-title min-h-screen pt-20 sm:pt-24 md:pt-36 px-4 sm:px-6 md:px-16 pb-16 md:pb-20">
				<h1 className="w-full text-2xl sm:text-3xl md:text-4xl font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter mb-1 pb-2">
					Settings
				</h1>
				<p className="mt-2 mb-6 md:mb-10 text-sm font-default text-gray-400">
					Manage your account preferences and report issues.
				</p>

				{status && (
					<StatusAlert
						message={status.message}
						variant={status.variant}
						onDismiss={clearStatus}
					/>
				)}

				<div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 md:gap-6 items-start">
					<div
						className={`w-full md:w-72 shrink-0 flex-col gap-2 ${activeSection ? "hidden md:flex" : "flex"}`}
					>
						{sections.map((s) => (
							<SectionRow
								key={s.key}
								icon={s.icon}
								label={s.label}
								description={s.description}
								active={activeSection === s.key}
								danger={s.danger}
								onClick={() => toggleSection(s.key)}
							/>
						))}
					</div>

					<div
						className={`w-full flex-1 min-w-0 ${activeSection ? "block" : "hidden md:block"}`}
					>
						{activeSection ? (
							<div className="settings-panel-gradient border border-arcade-white/10 rounded-xl p-4 sm:p-5 md:p-6">
								<button
									onClick={() => setActiveSection(null)}
									className="md:hidden flex items-center gap-2 text-arcade-white/60 hover:text-arcade-white mb-6 text-sm font-title transition-colors"
								>
									<ChevronLeft className="w-4 h-4" />
									Back to Settings
								</button>
								{renderPanel()}
							</div>
						) : (
							<div className="hidden md:flex flex-col items-center justify-center h-48 border border-dashed border-arcade-white/10 rounded-xl text-arcade-white/20 settings-panel-gradient">
								<p className="font-default text-sm">
									Select a setting to get started
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out both;
        }
      `}</style>
		</>
	);
}
