import { useState } from "react";
import { useGetLeaderboard, useGetGames } from "@workspace/api-client-react";
import { Trophy, Medal, Star, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState<string>("all");

  const { data: games } = useGetGames({
    query: { queryKey: ["games"] }
  });

  const { data: leaderboard, isLoading } = useGetLeaderboard(
    { gameId: selectedGame === "all" ? undefined : selectedGame, limit: 50 },
    {
      query: { 
        queryKey: ["leaderboard", selectedGame],
        keepPreviousData: true,
      }
    }
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-4 text-white">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Global Hall of Fame
          </h1>
          <p className="text-xl text-muted-foreground">
            The fastest typists in the world. Compete in games to climb the ranks.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-xl">
          <Filter className="w-5 h-5 text-muted-foreground ml-2" />
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-[200px] border-none bg-transparent focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Global (All Games)</SelectItem>
              {games?.map(game => (
                <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur border-primary/20 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px] text-center font-bold text-muted-foreground">Rank</TableHead>
                <TableHead className="font-bold text-muted-foreground">Pilot</TableHead>
                <TableHead className="text-right font-bold text-muted-foreground">WPM</TableHead>
                <TableHead className="text-right font-bold text-muted-foreground">Accuracy</TableHead>
                {selectedGame === "all" && <TableHead className="text-right font-bold text-muted-foreground">Game</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-border/50">
                    <TableCell className="text-center"><div className="w-6 h-6 rounded bg-muted/50 mx-auto animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted/50 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-12 bg-muted/50 rounded ml-auto animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-16 bg-muted/50 rounded ml-auto animate-pulse" /></TableCell>
                    {selectedGame === "all" && <TableCell className="text-right"><div className="h-4 w-24 bg-muted/50 rounded ml-auto animate-pulse" /></TableCell>}
                  </TableRow>
                ))
              ) : leaderboard?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedGame === "all" ? 5 : 4} className="text-center py-12 text-muted-foreground">
                    No records found for this category.
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard?.map((entry, index) => {
                  const isTop3 = index < 3;
                  const rankColors = [
                    "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
                    "text-gray-300 bg-gray-300/10 border-gray-300/30",
                    "text-amber-600 bg-amber-600/10 border-amber-600/30"
                  ];
                  
                  return (
                    <TableRow 
                      key={`${entry.userId}-${entry.gameId}`} 
                      className="border-border/50 hover:bg-primary/5 transition-colors group"
                    >
                      <TableCell className="text-center">
                        {isTop3 ? (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto border ${rankColors[index]}`}>
                            {index === 0 ? <Trophy className="w-4 h-4" /> : <Medal className="w-4 h-4" />}
                          </div>
                        ) : (
                          <span className="font-mono text-muted-foreground">#{entry.rank}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isTop3 ? 'text-white' : 'text-gray-300'}`}>
                            {entry.username}
                          </span>
                          {index === 0 && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-black font-mono text-lg ${index === 0 ? 'text-primary' : 'text-white'}`}>
                          {Math.round(entry.wpm)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-foreground">{Math.round(entry.accuracy)}%</span>
                      </TableCell>
                      {selectedGame === "all" && (
                        <TableCell className="text-right">
                          <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                            {games?.find(g => g.id === entry.gameId)?.name || 'Unknown'}
                          </span>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
