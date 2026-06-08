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

function TopPodium({ entries }: { entries: Array<{ rank: number; username: string; wpm: number; accuracy: number; gameId: string }> }) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 1) return null;

  const order = [1, 0, 2]; // silver, gold, bronze display order
  const podiumHeights = ["h-20", "h-28", "h-14"];
  const colors = [
    { bg: "bg-yellow-500/20 border-yellow-500/50", text: "text-yellow-400", label: "🥇 Champion" },
    { bg: "bg-slate-400/20 border-slate-400/50", text: "text-slate-300", label: "🥈 2nd Place" },
    { bg: "bg-amber-600/20 border-amber-600/50", text: "text-amber-500", label: "🥉 3rd Place" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-end justify-center gap-4 mb-8 pt-4"
    >
      {order.map((idx) => {
        const entry = top3[idx];
        if (!entry) return <div key={idx} className="flex-1 max-w-[140px]" />;
        const c = colors[idx];
        return (
          <div key={idx} className="flex flex-col items-center flex-1 max-w-[160px]">
            <div className={`w-14 h-14 rounded-full ${c.bg} border-2 flex items-center justify-center text-xl font-black mb-2 shadow-lg`}>
              {entry.username.charAt(0).toUpperCase()}
            </div>
            <div className={`font-bold text-sm ${c.text} truncate max-w-full px-1 text-center`}>{entry.username}</div>
            <div className="font-mono font-extrabold text-white text-lg">{entry.wpm} <span className="text-xs text-muted-foreground font-normal">WPM</span></div>
            <div className={`w-full ${podiumHeights[idx]} ${c.bg} border rounded-t-xl mt-2 flex items-center justify-center`}>
              <span className={`text-xs font-bold ${c.text}`}>{c.label}</span>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
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
    ...(games ?? []).map((g: any) => ({ id: g.id, name: g.name }))
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(255,184,0,0.2)]">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Global Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">The fastest typists on TypeBlitz. Are you on the list?</p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {gameFilters.map((g: any) => (
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

      {!isLoading && (entries ?? []).length >= 3 && (
        <TopPodium entries={entries ?? []} />
      )}

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
            {(entries ?? []).map((entry: any, i: number) => {
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
                    {entry.gameId.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>

                  <div
                    className="flex items-center gap-1 font-mono font-bold text-lg text-right"
                    style={{ color: "#00F5FF", textShadow: "0 0 6px rgba(0,245,255,0.5)" }}
                  >
                    <Zap className="w-4 h-4" style={{ color: "#00F5FF" }} />
                    {entry.wpm}
                  </div>

                  <div className={`text-right font-mono text-sm font-semibold ${
                    Math.round(entry.accuracy) >= 95 ? "text-emerald-400" :
                    Math.round(entry.accuracy) >= 80 ? "text-yellow-400" : "text-red-400"
                  }`}>
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
