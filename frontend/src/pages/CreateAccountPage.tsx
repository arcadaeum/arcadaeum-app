import { useState } from "react";
import NavigationBar from "../components/NavigationBar";

export default function CreateAccountPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const backend = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8000";

    const validate = () => {
        if (!email || !username || !password || !confirm) return "All fields are required.";
        if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email address.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        if (password !== confirm) return "Passwords do not match.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${backend}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password }),
            });
            if (res.ok) {
                setSuccess("Account created successfully. You can now log in.");
                setEmail("");
                setUsername("");
                setPassword("");
                setConfirm("");
            } else {
                const data = await res.json().catch(() => ({}));
                setError((data && data.detail) || data.message || "Failed to create account.");
            }
        } catch (err) {
            setError("Network error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavigationBar />
            <div className="flex flex-col items-center font-main min-h-screen pt-50 px-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md bg-arcade-black/80 p-8 rounded-lg border border-arcade-gold"
                >
                    <h1 className="text-2xl font-secondary text-center mb-6">Create Account</h1>

                    <label className="block mb-3">
                        <span className="text-sm text-gray-300">Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded bg-white text-black"
                            autoComplete="email"
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="text-sm text-gray-300">Username</span>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded bg-white text-black"
                            autoComplete="username"
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="text-sm text-gray-300">Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded bg-white text-black"
                            autoComplete="new-password"
                        />
                    </label>

                    <label className="block mb-4">
                        <span className="text-sm text-gray-300">Confirm Password</span>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded bg-white text-black"
                            autoComplete="new-password"
                        />
                    </label>

                    {error && <div className="text-red-400 mb-3">{error}</div>}
                    {success && <div className="text-green-400 mb-3">{success}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded bg-arcade-gold text-black font-semibold hover:opacity-90"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>
            </div>
        </>
    );
}