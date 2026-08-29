import { useEffect } from "react";
import { experienceState } from "../state/experienceState";

/**
 * Reads window scroll into normalized 0..1 progress on the shared state object.
 * No React state is used so scrolling never triggers re-renders.
 */
export function useScrollProgress() {
  useEffect(() => {
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      experienceState.target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onMove = (e: PointerEvent) => {
      experienceState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      experienceState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
}
