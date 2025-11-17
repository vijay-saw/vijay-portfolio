import { useContext, useState } from "react";
import { ThemeContext } from "../theme";
import { Sun, Moon, Menu, X } from "lucide-react";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileOpen(false); // close menu after clicking
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 dark:bg-slate-100/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
       
     
   <button
  onClick={() => handleScroll("home")}
  className="text-sm font-semibold tracking-widest text-slate-200 dark:text-slate-800 hover:text-indigo-400 transition"
>
  VIJAY<span className="text-indigo-400">.DEV</span>
</button>


        {/* Desktop menu */}
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

        {/* Right side controls */}
        <div className="flex items-center gap-3">

          {/* Theme toggle button */}
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

          {/* Desktop Let's talk button */}
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

          {/* Mobile Menu Button (Hamburger) */}
          <button
            className="sm:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-slate-200" />
            ) : (
              <Menu className="h-6 w-6 text-slate-200" />
            )}
          </button>
        </div>
      </nav>

      {/* ----------------------------
          Mobile Slide-down Menu
         ---------------------------- */}
      {mobileOpen && (
        <div className="sm:hidden bg-slate-900/95 dark:bg-slate-100/95 border-b border-slate-800/60 backdrop-blur-md px-4 pb-4 pt-2">
          <ul className="flex flex-col gap-3 text-slate-300 dark:text-slate-700 text-sm">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleScroll(item.id)}
                  className="block w-full text-left py-2 px-2 rounded hover:bg-slate-800/50 dark:hover:bg-slate-200/50 transition"
                >
                  {item.label}
                </button>
              </li>
            ))}

            {/* Mobile Let's talk button */}
            <button
              onClick={() => handleScroll("contact")}
              className="mt-3 rounded-full border border-indigo-500/70
                         bg-indigo-500/10 dark:bg-indigo-600/10
                         px-4 py-2 text-xs font-medium
                         text-indigo-200 dark:text-indigo-600
                         shadow-sm transition hover:bg-indigo-500/20
                         dark:hover:bg-indigo-600/20"
            >
              Let&apos;s talk
            </button>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;

