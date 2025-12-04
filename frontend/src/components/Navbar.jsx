// frontend/src/components/Navbar.jsx
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../theme";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getMe } from "../api";

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

  const { user, isAuthenticated, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { username: publicUsername } = useParams();

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileOpen(false); // close menu after clicking
    }
  };

  // If we have a token but no user object, try to fetch profile once
  useEffect(() => {
    let mounted = true;
    if (!user && localStorage.getItem("accessToken")) {
      getMe()
        .then((res) => {
          const data = res?.data || res;
          if (mounted && data) setUser(data);
        })
        .catch(() => {
          // ignore — not critical
        });
    }
    return () => {
      mounted = false;
    };
  }, [user, setUser]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    setMobileOpen(false);
  };

  // Figure out which portfolio we're currently viewing
  const defaultOwner =
    (import.meta &&
      import.meta.env &&
      import.meta.env.VITE_DEFAULT_OWNER_USERNAME) ||
    "vijay";

  let viewingUsername = defaultOwner;
  if (location.pathname.startsWith("/public/") && publicUsername) {
    viewingUsername = publicUsername;
  }

  const isOwner =
    isAuthenticated &&
    user &&
    user.username &&
    user.username === viewingUsername;

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 dark:bg-slate-100/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleScroll("home")}
            className="text-sm font-semibold tracking-widest text-slate-200 dark:text-slate-800 hover:text-indigo-400 transition"
          >
            VIJAY<span className="text-indigo-400">.DEV</span>
          </button>
        </div>

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
            className="p-2 rounded-full border border-slate-700 dark:border-slate-400 hover:border-indigo-500 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>

          {/* Auth / CTA controls - desktop */}
          <div className="hidden sm:flex items-center gap-3">
            {!isAuthenticated ? (
              // Visitor: show Login + Create buttons
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="rounded-full border border-indigo-500/70 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-200 shadow-sm transition hover:bg-indigo-500/20"
                >
                  Create your portfolio
                </button>
              </>
            ) : (
              // Logged in: (owner) username pill + Dashboard + Logout
              <>
                {isOwner && user && (
                  <span className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200">
                    {user.username || user.name}
                  </span>
                )}

                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full border border-indigo-500/70 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-200 shadow-sm transition hover:bg-indigo-500/20"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <button
            className="sm:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
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

            {/* Mobile actions */}
            {!isAuthenticated ? (
              // Visitor: Login + Create
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileOpen(false);
                  }}
                  className="mt-3 w-full rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/50 transition"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    navigate("/register");
                    setMobileOpen(false);
                  }}
                  className="mt-2 w-full rounded-full border border-indigo-500/70 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 shadow-sm transition hover:bg-indigo-500/20"
                >
                  Create your portfolio
                </button>
              </>
            ) : (
              // Logged in: (owner) username pill + Dashboard + Logout
              <>
                {isOwner && user && (
                  <div className="mt-3 w-full rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200 text-center">
                    {user.username || user.name}
                  </div>
                )}

                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileOpen(false);
                  }}
                  className="mt-2 w-full rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/50 transition"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="mt-2 w-full rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/50 transition"
                >
                  Logout
                </button>
              </>
            )}

            {/* Mobile Let's talk button */}
            <button
              onClick={() => {
                handleScroll("contact");
                setMobileOpen(false);
              }}
              className="mt-3 rounded-full border border-indigo-500/70 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-200 shadow-sm transition hover:bg-indigo-500/20"
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

