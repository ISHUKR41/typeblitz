import { useGetGames } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Terminal, Target, Flag } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "word-sprint": <Zap className="w-6 h-6 text-primary" />,
  "sentence-rush": <Gamepad2 className="w-6 h-6 text-chart-2" />,
  "code-type": <Terminal className="w-6 h-6 text-chart-3" />,
  "letter-blaster": <Target className="w-6 h-6 text-chart-4" />,
  "typing-race": <Flag className="w-6 h-6 text-chart-5" />,
};

export default function Games() {
  const { data: games, isLoading } = useGetGames();

  if (isLoading) {
    return <div className="p-8 text-center">Loading games...</div>;
  }

  const gameList = games || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-mono tracking-tight mb-2">Game Modes</h1>
        <p className="text-muted-foreground">Select a game mode to start training.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameList.filter(g => g.category === 'game').map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full hover:border-primary/50 transition-colors border-border bg-card overflow-hidden group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                    {iconMap[game.id] || <Gamepad2 className="w-6 h-6 text-primary" />}
                  </div>
                  <Badge variant={game.difficulty === 'beginner' ? 'default' : game.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                    {game.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">LEVELS</p>
                  <div className="grid grid-cols-5 gap-2">
                    {game.levels?.map((level) => (
                      <Link key={level.id} href={`/play/${game.id}/${level.number}`}>
                        <div className="aspect-square flex items-center justify-center rounded-md bg-muted hover:bg-primary hover:text-primary-foreground font-mono font-bold cursor-pointer transition-colors text-sm border border-border">
                          {level.number}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
