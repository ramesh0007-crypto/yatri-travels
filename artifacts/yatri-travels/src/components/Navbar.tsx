import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-serif text-xl font-bold text-primary">Yatri Travels</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                <span
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive(l.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {l.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" data-testid="link-admin">Admin</Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" data-testid="link-dashboard">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="link-login">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground" data-testid="link-register">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} data-testid="button-menu-toggle">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              <span className={`block px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                isActive(l.href) ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}>{l.label}</span>
            </Link>
          ))}
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setOpen(false)}>
                  <span className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted cursor-pointer">Admin Panel</span>
                </Link>
              )}
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <span className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted cursor-pointer">Dashboard</span>
              </Link>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-muted text-destructive"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                <span className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted cursor-pointer">Login</span>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <span className="block px-3 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary cursor-pointer">Register</span>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
