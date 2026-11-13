"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Indikator navigasi tipis di atas layar. Muncul saat tautan internal diklik
 * dan menyelesaikan sapuan singkat setelah rute baru terpasang. Ini juga
 * memberi umpan balik untuk perpindahan level dan tombol back/forward.
 */
export function RouteProgress() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 520);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href^="/"]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href || href === pathname || href.startsWith("#")) return;

      setVisible(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return <div className="route-progress" data-visible={visible} aria-hidden="true" />;
}
