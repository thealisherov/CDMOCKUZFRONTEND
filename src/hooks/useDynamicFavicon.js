import { useEffect } from "react";

/**
 * Forcefully swaps the browser tab favicon while the component is mounted.
 * Removes ALL existing <link rel="icon"> elements, injects a fresh one,
 * and restores the originals on unmount.
 */
export function useDynamicFavicon(iconHref) {
  useEffect(() => {
    if (typeof document === "undefined" || !iconHref) return;

    // 1. Collect all existing favicon link elements
    const existing = Array.from(
      document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
    );

    // 2. Remove them from head temporarily
    existing.forEach((el) => el.remove());

    // 3. Inject our test favicon (cache-busted)
    const link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.setAttribute("type", "image/png");
    link.setAttribute("href", `${iconHref}?v=${Date.now()}`);
    document.head.appendChild(link);

    return () => {
      // 4. On cleanup: remove ours and restore originals
      link.remove();
      existing.forEach((el) => document.head.appendChild(el));
    };
  }, [iconHref]);
}
