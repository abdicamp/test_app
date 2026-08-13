"use client";

import { useEffect, useState } from "react";
import { siteContent } from "@/content/site";

const STORAGE_KEY = "lumen.theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: Theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "light" ? siteContent.themeToggleDark : siteContent.themeToggleLight}
      title={theme === "light" ? siteContent.themeToggleDark : siteContent.themeToggleLight}
    >
      {theme === "light" ? siteContent.themeToggleDark : siteContent.themeToggleLight}
      <style jsx>{`
        .theme-toggle {
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink);
          border-radius: 10px;
          padding: 8px 12px;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .theme-toggle:hover {
          border-color: var(--teal);
          color: var(--teal);
        }
      `}</style>
    </button>
  );
}
