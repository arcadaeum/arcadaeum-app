import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar, ColorBends } from "@/components/ui";
import { User, Type, Trash2, Bug, ChevronRight, ChevronLeft, Check, AlertTriangle, X, Gamepad2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SettingSection = "username" | "displayname" | "steam" | "delete" | "bug" | null;

type AlertVariant = "success" | "error";

interface StatusAlertProps {
    message: string;
    variant: AlertVariant;
    onDismiss: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusAlert({ message, variant, onDismiss }: StatusAlertProps) {
    if (!message) return null;
    const isError = variant === "error";
    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border mb-5 text-sm font-default ${
                isError
                    ? "bg-red-500/10 border-red-500/40 text-red-300"
                    : "bg-green-500/10 border-green-500/40 text-green-300"
            }`}
        >
            {isError ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <Check className="w-4 h-4 mt-0.5 shrink-0" />}
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

function SectionRow({ icon, label, description, active, danger = false, onClick }: SectionRowProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 text-left group ${
                active
                    ? danger
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-arcade-blue/10 border-arcade-blue/50"
                    : "bg-arcade-black/40 border-arcade-white/10 hover:border-arcade-white/30 hover:bg-arcade-white/5"
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
                <div className={`font-title text-sm tracking-tight ${danger ? "text-red-400" : "text-arcade-white"}`}>
                    {label}
                </div>
                <div className="text-xs font-default text-arcade-white/40 mt-0.5">{description}</div>
            </div>
            <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    active ? "rotate-90 text-arcade-white/60" : "text-arcade-white/20 group-hover:text-arcade-white/40"
                }`}
            />
        </button>
    );
}

// ─── Section panels ──────────────────────────────────────────────────────────

function ChangeUsernamePanel() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; variant: AlertVariant } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || !currentPassword.trim()) {
            setStatus({ message: "Please fill in all fields.", variant: "error" });
            return;
        }
        setLoading(true);
        // TODO: wire up to backend
        setTimeout(() => {
            setLoading(false);
            setStatus({ message: "Username updated successfully.", variant: "success" });
            setNewUsername("");
            setCurrentPassword("");
        }, 800);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">Change Username</h2>
            <p className="text-xs font-default text-arcade-white/40 mb-6">
                Your username is how others find you. It must be unique.
            </p>

            {status && (
                <StatusAlert
                    message={status.message}
                    variant={status.variant}
                    onDismiss={() => setStatus(null)}
                />
            )}

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
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-arcade-blue text-arcade-black font-title tracking-tight rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
                >
                    {loading ? "Saving..." : "Save Username"}
                </button>
            </form>
        </div>
    );
}

function ChangeDisplayNamePanel() {
    const [newDisplayName, setNewDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; variant: AlertVariant } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDisplayName.trim()) {
            setStatus({ message: "Display name cannot be empty.", variant: "error" });
            return;
        }
        setLoading(true);
        // TODO: wire up to PATCH /me
        setTimeout(() => {
            setLoading(false);
            setStatus({ message: "Display name updated successfully.", variant: "success" });
            setNewDisplayName("");
        }, 800);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">Change Display Name</h2>
            <p className="text-xs font-default text-arcade-white/40 mb-6">
                Your display name is shown on your profile and can be anything you like.
            </p>

            {status && (
                <StatusAlert
                    message={status.message}
                    variant={status.variant}
                    onDismiss={() => setStatus(null)}
                />
            )}

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
                    className="w-full py-2.5 bg-arcade-blue text-arcade-black font-title tracking-tight rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
                >
                    {loading ? "Saving..." : "Save Display Name"}
                </button>
            </form>
        </div>
    );
}

function SteamAccountPanel() {
    const [isLinked, setIsLinked] = useState(false);
    const [steamUsername, setSteamUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; variant: AlertVariant } | null>(null);

    const handleToggleLink = async () => {
        setLoading(true);
        // TODO: wire up to Steam OAuth / link/unlink endpoint
        setTimeout(() => {
            setLoading(false);
            if (isLinked) {
                setIsLinked(false);
                setSteamUsername("");
                setStatus({ message: "Steam account unlinked successfully.", variant: "success" });
            } else {
                setIsLinked(true);
                setSteamUsername("PlayerOne_Steam");
                setStatus({ message: "Steam account linked successfully.", variant: "success" });
            }
        }, 800);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">Steam Connection</h2>
            <p className="text-xs font-default text-arcade-white/40 mb-6">
                Link your Steam account to automatically sync your game library, achievements, and playtime.
            </p>

            {status && (
                <StatusAlert
                    message={status.message}
                    variant={status.variant}
                    onDismiss={() => setStatus(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between p-4 bg-arcade-black border border-arcade-white/20 rounded-lg">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg transition-colors ${isLinked ? 'bg-[#171a21]/80 text-[#66c0f4]' : 'bg-arcade-white/5 text-arcade-white/40'}`}>
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-title text-arcade-white">Steam Network</div>
                        <div className="text-xs font-default text-arcade-white/50 mt-0.5">
                            {isLinked ? `Connected as ${steamUsername}` : "Not connected"}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleToggleLink}
                    disabled={loading}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-title tracking-tight text-sm transition-all disabled:opacity-50 border ${
                        isLinked
                            ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                            : "bg-arcade-blue text-arcade-black border-transparent hover:opacity-90"
                    }`}
                >
                    {loading ? "Processing..." : isLinked ? "Unlink" : "Link Account"}
                </button>
            </div>
        </div>
    );
}

function DeleteAccountPanel() {
    const [confirmation, setConfirmation] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; variant: AlertVariant } | null>(null);
    const navigate = useNavigate();
    const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

    const canSubmit = confirmation === CONFIRM_PHRASE && password.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        // TODO: wire up to DELETE /me
        setTimeout(() => {
            setLoading(false);
            localStorage.removeItem("access_token");
            navigate("/signin");
        }, 1000);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-1">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-title tracking-tighter text-red-400">Delete Account</h2>
            </div>
            <p className="text-xs font-default text-arcade-white/40 mb-6">
                This action is permanent and cannot be undone. All your data, library, reviews and collections will be erased.
            </p>

            {status && (
                <StatusAlert
                    message={status.message}
                    variant={status.variant}
                    onDismiss={() => setStatus(null)}
                />
            )}

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
                <p className="text-xs font-default text-red-300/80">
                    Type <span className="font-title text-red-300">{CONFIRM_PHRASE}</span> below to confirm deletion.
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
                <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="w-full py-2.5 bg-red-600 text-arcade-white font-title tracking-tight rounded-lg hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                >
                    {loading ? "Deleting account..." : "Permanently Delete Account"}
                </button>
            </form>
        </div>
    );
}

function ReportBugPanel() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; variant: AlertVariant } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setStatus({ message: "Please fill in both fields.", variant: "error" });
            return;
        }
        setLoading(true);
        // TODO: wire up to bug reporting endpoint
        setTimeout(() => {
            setLoading(false);
            setStatus({ message: "Bug report submitted. Thank you!", variant: "success" });
            setTitle("");
            setDescription("");
        }, 800);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-title tracking-tighter text-arcade-white mb-1">Report a Bug</h2>
            <p className="text-xs font-default text-arcade-white/40 mb-6">
                Found something broken? Let us know and we'll get it fixed.
            </p>

            {status && (
                <StatusAlert
                    message={status.message}
                    variant={status.variant}
                    onDismiss={() => setStatus(null)}
                />
            )}

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
                    className="w-full py-2.5 bg-arcade-blue text-arcade-black font-title tracking-tight rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
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

    const toggleSection = (section: SettingSection) => {
        setActiveSection((prev) => (prev === section ? null : section));
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

    const renderPanel = () => {
        switch (activeSection) {
            case "username":
                return <ChangeUsernamePanel />;
            case "displayname":
                return <ChangeDisplayNamePanel />;
            case "steam":
                return <SteamAccountPanel />;
            case "bug":
                return <ReportBugPanel />;
            case "delete":
                return <DeleteAccountPanel />;
            default:
                return null;
        }
    };

    return (
        <>
            <NavigationBar />
            <ColorBends
                className="fixed inset-0 -z-10 pointer-events-none opacity-90 blur-3xl"
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

            <div className="flex flex-col items-start font-title min-h-screen pt-28 md:pt-36 px-4 md:px-16 pb-20">
                {/* Header */}
                <h1 className="w-full text-3xl md:text-4xl font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter mb-1 pb-2">
                    Settings
                </h1>
                <p className="mt-3 mb-8 md:mb-10 text-sm font-default text-gray-400">
                    Manage your account preferences and report issues.
                </p>

                {/* Responsive Layout */}
                <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-start">
                    
                    {/* Left: Nav list (Hides on mobile when a section is active) */}
                    <div className={`w-full md:w-72 shrink-0 flex-col gap-2 ${activeSection ? 'hidden md:flex' : 'flex'}`}>
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

                    {/* Right: Panel (Always visible on desktop, only visible on mobile if active) */}
                    <div className={`w-full flex-1 min-w-0 ${activeSection ? 'block' : 'hidden md:block'}`}>
                        {activeSection ? (
                            <div className="bg-arcade-black/60 border border-arcade-white/10 rounded-xl p-5 md:p-6 backdrop-blur-sm">
                                
                                {/* Mobile Back Button */}
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
                            <div className="hidden md:flex flex-col items-center justify-center h-48 border border-dashed border-arcade-white/10 rounded-xl text-arcade-white/20">
                                <p className="font-default text-sm">Select a setting to get started</p>
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
