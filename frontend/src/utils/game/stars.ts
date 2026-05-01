function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string) {
	const normalized = hex.replace("#", "");
	const bigint = Number.parseInt(normalized, 16);
	return {
		r: (bigint >> 16) & 255,
		g: (bigint >> 8) & 255,
		b: bigint & 255,
	};
}

function toHex(value: number) {
	return Math.round(value).toString(16).padStart(2, "0");
}

function lerpColor(start: string, end: string, t: number) {
	const from = hexToRgb(start);
	const to = hexToRgb(end);
	return `#${toHex(from.r + (to.r - from.r) * t)}${toHex(
		from.g + (to.g - from.g) * t,
	)}${toHex(from.b + (to.b - from.b) * t)}`;
}

export function getRatingColor(rating: number) {
	const normalized = clamp(rating / 5, 0, 1);
	if (normalized <= 0.5) {
		return lerpColor("#ece4d5", "#37b0ea", normalized * 2);
	}
	return lerpColor("#37b0ea", "#5647f1", (normalized - 0.5) * 2);
}
