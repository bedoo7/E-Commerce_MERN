import { useRef, useCallback } from "react";

export function usePaginationScroll() {
	const containerRef = useRef<HTMLDivElement>(null);

	const scrollToTop = useCallback(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				containerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	}, []);

	return { containerRef, scrollToTop };
}