import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Keyboard, LogOut, User, Trophy, Gamepad2, GraduationCap, Activity, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/speed-test", label: "Speed Test", icon: Activity },
    { href: "/lessons", label: "Lessons", icon: GraduationCap },
    { href: "/practice", label: "Practice", icon: Keyboard },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  if (user) {
    navLinks.push({ href: "/dashboard", label: "Dashboard", icon: User });
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans dark selection:bg-primary/30">
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
          isScrolled ? "bg-background/80 backdrop-blur-md border-border shadow-sm" : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Keyboard className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Type<span className="text-primary">Blitz</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location === link.href || location.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {user.username}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Nav */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border flex flex-col">
              <div className="flex items-center gap-2 mb-8 mt-4">
                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <Keyboard className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">
                  Type<span className="text-primary">Blitz</span>
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                      location === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto pt-8 border-t border-border flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Logged in as <span className="text-foreground font-medium">{user.username}</span>
                    </div>
                    <Button variant="outline" className="w-full justify-start" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="w-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-0">
        {children}
      </main>

      <footer className="border-t border-border bg-background py-8 md:py-12 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">TypeBlitz</span>
          </div>
          <div className="text-sm text-muted-foreground flex gap-4">
            <span>&copy; {new Date().getFullYear()} TypeBlitz. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
