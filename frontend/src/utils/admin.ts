import type { UserProfile } from "@/types/user";

export const ADMIN_EMAIL = "arcadaeum@gmail.com";

export const isAdminUser = (
	user: Pick<UserProfile, "username" | "email"> | null | undefined,
) => user?.username.toLowerCase() === ADMIN_EMAIL || user?.email.toLowerCase() === ADMIN_EMAIL;
