import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import type { UserSearchResult } from "@/types/search";
import { useDebouncedSearch, useClickOutside } from "@/utils/search/hooks";
import { searchUsers } from "@/utils/search/api";

export default function UserSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<UserSearchResult[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const navigate = useNavigate();
	const searchRef = useRef<HTMLDivElement>(null);
	const trimmedQuery = searchQuery.trim();
	const hasQuery = trimmedQuery.length > 0;

	// Get current user ID on mount
	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const token = localStorage.getItem("access_token");
				const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (response.ok) {
					const user = await response.json();
					setCurrentUserId(user.id);
				}
			} catch (error) {
				console.error("Error fetching current user:", error);
			}
		};

		fetchCurrentUser();
	}, []);

	// Debounced search
	useDebouncedSearch(
		hasQuery && currentUserId !== null,
		async () => {
			const query = trimmedQuery.toLowerCase();
			try {
				const searchResults = await searchUsers(query, currentUserId);
				setResults(searchResults);
				setIsOpen(true);
			} catch (error) {
				console.error("Search failed:", error);
				setResults([]);
			}
		},
		{
			delay: 200,
			loadingDelay: 1000,
			onLoadingStart: () => setIsLoading(true),
		},
	);

	const handleSelectUser = (userId: number) => {
		navigate(`/users/${userId}`);
		setSearchQuery("");
		setIsOpen(false);
	};

	// Close dropdown when clicking outside
	useClickOutside(searchRef, () => setIsOpen(false));

	return (
		<div ref={searchRef} className="relative w-full max-w-md">
			{/* Search Input */}
			<div className="relative flex items-center">
				<Search className="absolute left-3 w-5 h-5 text-arcade-white/60 pointer-events-none" />
				<input
					type="text"
					placeholder="Search users by username..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => hasQuery && setIsOpen(true)}
					className="w-full pl-10 pr-10 py-2 bg-arcade-black border-2 border-arcade-white/30 rounded-lg text-arcade-white placeholder-arcade-white/50 focus:border-arcade-blue focus:outline-none transition-colors"
				/>
				{searchQuery && (
					<button
						onClick={() => {
							setSearchQuery("");
							setResults([]);
							setIsOpen(false);
							setIsLoading(false);
						}}
						className="absolute right-3 text-arcade-white/60 hover:text-arcade-white"
					>
						<X className="w-5 h-5" />
					</button>
				)}
			</div>

			{/* Search Results Dropdown */}
			{isOpen && hasQuery && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-arcade-black border-2 border-arcade-white/30 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
					{isLoading ? (
						<div className="px-4 py-3 text-arcade-white/60 text-center">Loading...</div>
					) : results.length > 0 ? (
						<div className="py-2">
							{results.map((user) => (
								<button
									key={user.id}
									onClick={() => handleSelectUser(user.id)}
									className="w-full px-4 py-3 text-left hover:bg-arcade-blue/20 transition-colors flex items-center gap-3 border-b border-arcade-white/10 last:border-b-0"
								>
									{user.profile_picture && (
										<img
											src={user.profile_picture}
											alt={user.display_name}
											className="w-10 h-10 object-cover rounded-full"
										/>
									)}
									<div className="flex-1">
										<span className="text-arcade-white font-secondary block">
											{user.display_name}
										</span>
										<span className="text-xs text-arcade-white/50">
											{user.display_name}
										</span>
									</div>
								</button>
							))}
						</div>
					) : hasQuery ? (
						<div className="px-4 py-3 text-arcade-white/60 text-center">
							No users found
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
