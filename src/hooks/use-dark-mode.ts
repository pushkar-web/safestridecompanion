import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "safestride_dark_mode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(STORAGE_KEY, String(isDark));
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((v) => !v), []);

  return { isDark, setIsDark, toggle };
}
