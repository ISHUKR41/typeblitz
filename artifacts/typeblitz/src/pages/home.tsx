import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, BarChart3, Trophy, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32">
        <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-50 blur-3xl" />
        
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Next-Gen Typing Arena</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white">
              Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Keyboard.</span><br />
              Dominate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Arena.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              TypeBlitz is the ultimate training ground for fast typists. Gamified drills, professional analytics, and high-stakes games to push your WPM to the limit.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(var(--primary),0.4)]" asChild>
                <Link href="/register">
                  Start Training Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-border hover:bg-secondary" asChild>
                <Link href="/games">
                  Explore Games
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-[600px] relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-[100px] z-[-1]" />
            <div className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="h-10 bg-secondary flex items-center px-4 border-b border-border gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 text-xs font-mono text-muted-foreground flex-1 text-center pr-12">typeblitz-terminal</div>
              </div>
              <div className="p-6 font-mono text-sm md:text-base leading-relaxed bg-black/50 backdrop-blur-sm">
                <div className="flex text-muted-foreground mb-4">
                  <span className="text-primary mr-2">❯</span> 
                  <span className="text-white">init speed-test --mode=pro</span>
                </div>
                <p className="text-gray-300">
                  <span className="text-green-400">The quick brown fox</span> jumps over the lazy dog. Programming <span className="bg-red-500/30 text-red-200 px-1 rounded">rquires</span> <span className="text-primary animate-pulse">|</span>
                </p>
                <div className="mt-8 flex justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                  <div className="flex gap-4">
                    <span>WPM: <span className="text-white font-bold">114</span></span>
                    <span>ACC: <span className="text-white font-bold">98%</span></span>
                  </div>
                  <span>TIME: 0:42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Serious Typists</h2>
            <p className="text-muted-foreground">Everything you need to break through your WPM plateaus and eliminate bad habits.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Precision Metrics", desc: "Detailed breakdown of every keystroke. Real accuracy tracking where backspaces don't hide your mistakes." },
              { icon: Flame, title: "Intense Game Modes", desc: "From Word Blitz to Zombie Siege, train your muscle memory under pressure with our gamified arena." },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Identify your slowest fingers and most common typos with our heatmaps and progression charts." }
            ].map((f, i) => (
              <div key={i} className="bg-card border border-border p-8 rounded-xl hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
