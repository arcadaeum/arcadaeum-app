import type { ReactNode } from "react";

export type HomeFeatureItem = {
	key: string;
	title: string;
	borderClass: string;
	bgClass: string;
	glowColor: string;
	body: ReactNode;
};
