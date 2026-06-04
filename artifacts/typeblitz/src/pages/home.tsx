import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Gamepad2, Zap, Trophy, ArrowRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-chart-2/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-8 z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-sm mb-4">
          <Zap className="w-4 h-4" />
          <span>Next-gen typing platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Type faster. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-2">
            Dominate the board.
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Every keystroke has weight. Train like an athlete. Compete like a gamer.
          TypeBlitz turns your mechanical keyboard into a weapon.
        </p>

        <div className="flex items-center justify-center gap-4 pt-8">
          <Link href="/games">
            <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2">
              <Gamepad2 className="w-6 h-6" />
              Play Now
            </Button>
          </Link>
          {!user && (
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold gap-2">
                Create Account <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24 z-10"
      >
        <div className="p-6 rounded-2xl bg-card border border-card-border flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Kinetic Feedback</h3>
          <p className="text-muted-foreground">Satisfying visuals and real-time WPM metrics that make typing addictive.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-card-border flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center text-chart-2">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">5 Game Modes</h3>
          <p className="text-muted-foreground">From Word Sprints to Code Snippets. Train different aspects of your muscle memory.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-card-border flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-chart-4/20 flex items-center justify-center text-chart-4">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Global Leaderboards</h3>
          <p className="text-muted-foreground">Compete against the best typists in the world and climb the ranks.</p>
        </div>
      </motion.div>
    </div>
  );
}
