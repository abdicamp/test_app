"use client";

import { siteContent } from "@/content/site";
import { useEffect, useState } from "react";

const STORAGE_KEY = "lumen.theme";

type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute(
    "data-theme",
    theme === "dark" ? "dark" : "light",
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const next = getPreferredTheme();
    setTheme(next);
    applyTheme(next);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setTheme(next);
  }

  const label =
    theme === "dark"
      ? siteContent.themeToggleLight
      : siteContent.themeToggleDark;

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <span className="icon" aria-hidden="true">
        {theme === "dark" ? "☀" : "☾"}
      </span>
      <span className="label">{label}</span>
      <style jsx>{`
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--line);
          background: var(--surface-solid);
          color: var(--ink);
          border-radius: 12px;
          padding: 8px 12px;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }
        .theme-toggle:hover {
          border-color: var(--teal);
          color: var(--teal);
        }
        .icon {
          font-size: 16px;
          line-height: 1;
        }
        @media (max-width: 640px) {
          .label {
            display: none;
          }
          .theme-toggle {
            padding: 8px 10px;
          }
        }
      `}</style>
    </button>
  );
}
