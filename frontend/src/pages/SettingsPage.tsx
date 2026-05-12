import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
	Bug,
	ChevronLeft,
	Gamepad2,
	KeyRound,
	Trash2,
	Type,
	User,
} from "lucide-react";
import { NavigationBar, ColorBends } from "@/components/ui";
import {
	ChangeDisplayNamePanel,
	ChangePasswordPanel,
	ChangeUsernamePanel,
	DeleteAccountPanel,
	ReportBugPanel,
	SectionRow,
	StatusAlert,
	SteamAccountPanel,
} from "@/components/settings";
import type {
	AlertVariant,
	SettingSection,
	SettingsIconKey,
	SettingsPanelProps,
} from "@/types/settings";
import type { UserProfileWithId } from "@/types/user";
import { getSteamStatusFromSearchParams, settingsSections } from "@/utils/settings";

const sectionIcons: Record<SettingsIconKey, ReactNode> = {
	user: <User className="w-4 h-4" />,
	type: <Type className="w-4 h-4" />,
	key: <KeyRound className="w-4 h-4" />,
	trash: <Trash2 className="w-4 h-4" />,
	bug: <Bug className="w-4 h-4" />,
	gamepad: <Gamepad2 className="w-4 h-4" />,
};

export default function SettingsPage() {
	const [activeSection, setActiveSection] = useState<SettingSection>(null);
	const [status, setStatus] = useState<{ message: string; variant: AlertVariant } | null>(null);
	const [user, setUser] = useState<UserProfileWithId | null>(null);
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL as string;
	const token = localStorage.getItem("access_token");

	useEffect(() => {
		const nextStatus = getSteamStatusFromSearchParams(
			new URLSearchParams(window.location.search),
		);
		if (!nextStatus) return;

		setStatus(nextStatus);
		window.history.replaceState({}, document.title, window.location.pathname);
	}, []);

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
			.then((data: UserProfileWithId) => setUser(data))
			.catch(() => {
				localStorage.removeItem("access_token");
				navigate("/signin");
			});
	}, [token, apiUrl, navigate]);

	const toggleSection = (section: SettingSection) => {
		setActiveSection((prev) => (prev === section ? null : section));
	};

	const renderPanel = () => {
		if (!token || !user) return null;

		const commonProps: SettingsPanelProps = {
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
						onDismiss={() => setStatus(null)}
					/>
				)}

				<div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 md:gap-6 items-start">
					<div
						className={`w-full md:w-72 shrink-0 flex-col gap-2 ${activeSection ? "hidden md:flex" : "flex"}`}
					>
						{settingsSections.map((section) => (
							<SectionRow
								key={section.key}
								icon={sectionIcons[section.icon]}
								label={section.label}
								description={section.description}
								active={activeSection === section.key}
								danger={section.danger}
								onClick={() => toggleSection(section.key)}
							/>
						))}
					</div>

					<div
						className={`w-full flex-1 min-w-0 ${activeSection ? "block" : "hidden md:block"}`}
					>
						{activeSection ? (
							<div className="rounded-xl border border-arcade-white/10 bg-arcade-black p-4 sm:p-5 md:p-6">
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
							<div className="hidden md:flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-arcade-white/10 bg-arcade-black text-arcade-white/20">
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
