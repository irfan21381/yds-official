import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 rounded-md border text-sm
                 bg-white dark:bg-slate-900
                 border-slate-300 dark:border-slate-700"
    >
      {dark ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}
