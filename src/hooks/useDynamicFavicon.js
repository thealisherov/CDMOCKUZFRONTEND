import { useEffect } from "react";

/**
 * Safely updates the browser tab favicon without removing DOM nodes.
 * React 19 hoists head tags, so calling .remove() on <link> tags breaks
 * React's internal fiber tree and causes "Cannot read properties of null (reading 'removeChild')"
 * during unmounting or page navigation.
 */
export function useDynamicFavicon(iconHref) {
  useEffect(() => {
    if (typeof document === "undefined" || !iconHref) return;

    // Find any existing favicon link element
    let link = document.querySelector("link[rel~='icon'], link[rel='shortcut icon']");
    const createdByUs = !link;
    const originalHref = link ? link.getAttribute("href") : null;

    if (link) {
      // Safely update the existing link href without detaching the node from the DOM
      link.setAttribute("href", `${iconHref}?v=${Date.now()}`);
    } else {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      link.setAttribute("type", "image/png");
      link.setAttribute("href", `${iconHref}?v=${Date.now()}`);
      document.head.appendChild(link);
    }

    return () => {
      if (link) {
        if (createdByUs) {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        } else if (originalHref) {
          link.setAttribute("href", originalHref);
        }
      }
    };
  }, [iconHref]);
}

