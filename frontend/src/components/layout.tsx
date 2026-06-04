import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Keyboard, LayoutDashboard, Trophy, Gamepad2,
  GraduationCap, LogOut, Menu, X, Shield, ChevronRight, CalendarDays
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  match: (path: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/games",     label: "Games",      icon: Gamepad2,       match: p => p.startsWith("/games") || p.startsWith("/play") },
  { href: "/challenge", label: "Daily Challenge", icon: CalendarDays, match: p => p === "/challenge" },
  { href: "/practice",  label: "Practice",   icon: GraduationCap,  match: p => p.startsWith("/practice") || p.startsWith("/lessons") },
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard, match: p => p === "/dashboard" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy,       match: p => p === "/leaderboard" },
];

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group relative
          ${active
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
      >
        {active && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
          />
        )}
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-semibold text-sm">{item.label}</span>
        {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
      </motion.div>
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between">
        <Link href="/" onClick={onClose}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2.5 text-primary font-mono text-xl font-bold cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center border border-primary/20">
              <Keyboard className="w-4.5 h-4.5" />
            </div>
            <span>TypeBlitz</span>
          </motion.div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest px-4 pb-2 pt-1">Menu</p>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.href}
            item={item}
            active={item.match(location)}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* User panel */}
      <div className="p-4 border-t border-border mt-auto space-y-3">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground">Best: {user.bestWpm ?? 0} WPM</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => { logout(); onClose?.(); }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <Link href="/login" className="block" onClick={onClose}>
            <Button className="w-full gap-2">
              <Shield className="w-4 h-4" />
              Login / Register
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex dark">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur flex-shrink-0 sticky top-0 h-screen overflow-hidden">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 md:hidden flex flex-col shadow-2xl"
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-card/90 backdrop-blur border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/">
            <div className="flex items-center gap-2 text-primary font-mono font-bold">
              <Keyboard className="w-5 h-5" />
              <span>TypeBlitz</span>
            </div>
          </Link>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
