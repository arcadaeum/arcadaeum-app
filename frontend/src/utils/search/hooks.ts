import { useEffect, useRef, useCallback } from "react";

export interface UseDebouncedSearchOptions {
	delay?: number;
	loadingDelay?: number;
	onLoadingStart?: () => void;
}

export function useDebouncedSearch(
	hasQuery: boolean,
	callback: () => void | Promise<void>,
	options: UseDebouncedSearchOptions = {},
) {
	const { delay = 500, loadingDelay = 1000, onLoadingStart } = options;
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimers = useCallback(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}
		if (loadingTimerRef.current) {
			clearTimeout(loadingTimerRef.current);
			loadingTimerRef.current = null;
		}
	}, []);

	useEffect(() => {
		clearTimers();

		if (!hasQuery) {
			return;
		}

		// Set loading to true only after loadingDelay
		loadingTimerRef.current = setTimeout(() => {
			onLoadingStart?.();
		}, loadingDelay);

		// Debounce the actual search
		debounceTimerRef.current = setTimeout(async () => {
			try {
				await callback();
			} finally {
				if (loadingTimerRef.current) {
					clearTimeout(loadingTimerRef.current);
					loadingTimerRef.current = null;
				}
			}
		}, delay);

		return clearTimers;
	}, [hasQuery, callback, delay, loadingDelay, onLoadingStart, clearTimers]);
}

export function useClickOutside(
	ref: React.RefObject<HTMLElement | null>,
	callback: () => void,
) {
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				callback();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [ref, callback]);
}