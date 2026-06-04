import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetLeaderboard,
  useGetGames,
  getGetLeaderboardQueryKey,
  getGetGamesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Crown, Medal, Zap } from "lucide-react";

const GAME_FILTERS = [{ id: "", name: "All Games" }];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="font-mono text-sm text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState("");

  const { data: games } = useGetGames({ query: { queryKey: getGetGamesQueryKey() } });
  const { data: entries, isLoading } = useGetLeaderboard(
    selectedGame ? { gameId: selectedGame } : {},
    { query: { queryKey: getGetLeaderboardQueryKey(selectedGame ? { gameId: selectedGame } : {}) } }
  );

  const gameFilters = [
    ...GAME_FILTERS,
    ...(games ?? []).map(g => ({ id: g.id, name: g.name }))
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-extrabold tracking-tight">Global Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">The fastest typists on TypeBlitz. Are you on the list?</p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {gameFilters.map(g => (
          <button
            key={g.id}
            data-testid={`filter-game-${g.id || "all"}`}
            onClick={() => setSelectedGame(g.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              selectedGame === g.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Rank</span>
          <span>Player</span>
          <span>Game</span>
          <span className="text-right">WPM</span>
          <span className="text-right">Accuracy</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading leaderboard...</div>
        ) : (entries ?? []).length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No entries yet. Be the first to claim the top spot!</p>
          </div>
        ) : (
          <div>
            {(entries ?? []).map((entry, i) => {
              const isCurrentUser = user?.id === entry.userId;
              return (
                <motion.div
                  key={`${entry.userId}-${entry.gameId}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center transition-colors ${
                    isCurrentUser ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30"
                  }`}
                  data-testid={`leaderboard-row-${entry.rank}`}
                >
                  <div className="flex items-center justify-center w-6">
                    <RankBadge rank={entry.rank} />
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-semibold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                        {entry.username}
                        {isCurrentUser && <span className="text-xs ml-2 text-primary/70">(you)</span>}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {entry.gameId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </span>

                  <div className="flex items-center gap-1 font-mono font-bold text-primary text-lg text-right">
                    <Zap className="w-4 h-4" />
                    {entry.wpm}
                  </div>

                  <div className="text-right font-mono text-muted-foreground text-sm">
                    {Math.round(entry.accuracy)}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
