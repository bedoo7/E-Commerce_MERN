import { useRef, useCallback } from "react";

export function usePaginationScroll<T extends Element = HTMLDivElement>() {
	const firstItemRef = useRef<T>(null);

	const scrollToFirstItem = useCallback(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				firstItemRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	}, []);

	return { firstItemRef, scrollToFirstItem };
}