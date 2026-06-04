import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Keyboard, LayoutDashboard, Trophy, Gamepad2, GraduationCap, LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row dark">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center gap-2 text-primary font-mono text-2xl font-bold cursor-pointer">
              <Keyboard className="w-8 h-8" />
              <span>TypeBlitz</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          <Link href="/games" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-muted ${location.startsWith('/games') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
            <Gamepad2 className="w-5 h-5" />
            <span className="font-semibold">Games</span>
          </Link>
          <Link href="/practice" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-muted ${location.startsWith('/practice') || location.startsWith('/lesson') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
            <GraduationCap className="w-5 h-5" />
            <span className="font-semibold">Practice</span>
          </Link>
          <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-muted ${location === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-semibold">Dashboard</span>
          </Link>
          <Link href="/leaderboard" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-muted ${location === '/leaderboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Leaderboard</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{user.username}</span>
                  <span className="text-xs text-muted-foreground">WPM: {user.bestWpm || 0}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login" className="w-full block">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Login / Register
              </Button>
            </Link>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
