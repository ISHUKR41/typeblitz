import { useGetGames } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Play, Skeleton } from "lucide-react";

export default function Games() {
  const { data: games, isLoading } = useGetGames({
    query: {
      queryKey: ["games"]
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-4">
          <Gamepad2 className="w-10 h-10 text-primary" />
          Game Arena
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Choose your training ground. Each game focuses on a specific aspect of typing mastery.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-card/50 border-border animate-pulse">
              <CardHeader>
                <div className="w-12 h-12 bg-muted rounded-lg mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map((game) => (
            <Card key={game.id} className="bg-card border-border/50 hover:border-primary/50 transition-colors group overflow-hidden relative flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg border border-border">
                    {game.icon || "👾"}
                  </div>
                  {game.difficulty && (
                    <Badge variant="outline" className="bg-background/50 backdrop-blur capitalize">
                      {game.difficulty}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">{game.name}</CardTitle>
                <CardDescription className="line-clamp-2">{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span className="flex items-center gap-1.5"><span className="text-primary font-bold">{game.levels.length}</span> Levels</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-[0_0_0_rgba(var(--primary),0)] group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]" asChild>
                  <Link href={`/games/${game.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Enter Arena
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
