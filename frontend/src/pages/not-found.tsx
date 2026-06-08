import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, Gamepad2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-chart-2/5 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 neon-grid opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 text-center max-w-md w-full space-y-6"
      >
        <div className="relative">
          <div
            className="text-[140px] font-black font-mono leading-none select-none"
            style={{ color: "rgba(0,245,255,0.08)", letterSpacing: "-0.06em" }}
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-7xl font-black font-mono"
              style={{
                color: "#00F5FF",
                textShadow: "0 0 40px rgba(0,245,255,0.6), 0 0 80px rgba(0,245,255,0.2)",
                letterSpacing: "-0.04em",
              }}
            >
              404
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Page not found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This route doesn't exist. Maybe you were looking for a game level or a practice session?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto shadow-lg shadow-primary/20">
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <Link href="/games">
            <Button variant="outline" className="gap-2 w-full sm:w-auto border-primary/30 hover:border-primary/60">
              <Gamepad2 className="w-4 h-4" /> Play a Game
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/50 font-mono">
          TYPEBLITZ · ERROR_CODE 404 · ROUTE_UNKNOWN
        </p>
      </motion.div>
    </div>
  );
}
