// src/components/Navbar.jsx

import { useContext } from "react";
import { ThemeContext } from "../theme";
import { Sun, Moon } from "lucide-react";

const navItems = [
  { id: "home", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b 
                       border-slate-800/60 bg-slate-950/80 
                       dark:bg-slate-100/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="text-sm font-semibold tracking-widest text-slate-200 dark:text-slate-800">
          VIJAY<span className="text-indigo-400">.DEV</span>
        </div>

        {/* Nav links */}
        <ul className="hidden gap-6 text-sm text-slate-300 dark:text-slate-700 sm:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleScroll(item.id)}
                className="transition-colors hover:text-indigo-400 dark:hover:text-indigo-600"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Toggle Dark/Light Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-700 
                       dark:border-slate-400 
                       hover:border-indigo-500 transition"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>

          {/* Let's Talk button */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleScroll("contact");
            }}
            className="hidden rounded-full border border-indigo-500/70 
                       bg-indigo-500/10 dark:bg-indigo-600/10 
                       px-4 py-1.5 text-xs font-medium 
                       text-indigo-200 dark:text-indigo-600 
                       shadow-sm transition hover:bg-indigo-500/20 
                       dark:hover:bg-indigo-600/20 sm:inline-block"
          >
            Let&apos;s talk
          </a>
        </div>

      </nav>
    </header>
  );
};

export default Navbar;

