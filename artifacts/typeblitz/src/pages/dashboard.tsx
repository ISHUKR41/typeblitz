import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  useGetUserStats,
  useGetUserProgress,
  useGetLetterAccuracy,
  useGetUserSessions,
  useGetLevelProgress,
  getGetUserStatsQueryKey,
  getGetUserProgressQueryKey,
  getGetLetterAccuracyQueryKey,
  getGetUserSessionsQueryKey,
  getGetLevelProgressQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Zap, Target, Clock, Flame, BarChart2, Trophy, ArrowRight, Lock } from "lucide-react";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-2xl p-6 flex items-center gap-5"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function LetterHeatmap({ userId }: { userId: number }) {
  const { data: letters } = useGetLetterAccuracy(userId, {
    query: { queryKey: getGetLetterAccuracyQueryKey(userId) }
  });

  const letterMap = new Map((letters ?? []).map(l => [l.letter, l.accuracy]));

  const getColor = (acc?: number) => {
    if (acc === undefined) return "bg-muted text-muted-foreground";
    if (acc >= 95) return "bg-primary/30 text-primary border border-primary/40";
    if (acc >= 85) return "bg-chart-3/30 text-chart-3 border border-chart-3/40";
    if (acc >= 70) return "bg-chart-4/30 text-chart-4 border border-chart-4/40";
    return "bg-destructive/30 text-destructive border border-destructive/40";
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-1">Letter Accuracy Heatmap</h3>
      <p className="text-sm text-muted-foreground mb-5">Problem keys highlighted in red</p>
      <div className="flex flex-wrap gap-2">
        {ALPHABET.map(letter => {
          const acc = letterMap.get(letter);
          return (
            <div
              key={letter}
              title={acc !== undefined ? `${letter}: ${acc}%` : `${letter}: no data`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all cursor-default ${getColor(acc)}`}
            >
              {letter}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/30 inline-block" /> 95%+</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-chart-3/30 inline-block" /> 85-95%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-chart-4/30 inline-block" /> 70-85%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/30 inline-block" /> &lt;70%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted inline-block" /> no data</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useGetUserStats(user?.id ?? 0, {
    query: { enabled: !!user, queryKey: getGetUserStatsQueryKey(user?.id ?? 0) }
  });

  const { data: progress } = useGetUserProgress(user?.id ?? 0, {
    query: { enabled: !!user, queryKey: getGetUserProgressQueryKey(user?.id ?? 0) }
  });

  const { data: sessions } = useGetUserSessions(user?.id ?? 0, {
    query: { enabled: !!user, queryKey: getGetUserSessionsQueryKey(user?.id ?? 0) }
  });

  const { data: levelProgress } = useGetLevelProgress(user?.id ?? 0, {
    query: { enabled: !!user, queryKey: getGetLevelProgressQueryKey(user?.id ?? 0) }
  });

  if (!user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center gap-6">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Sign in to view your dashboard</h2>
        <p className="text-muted-foreground max-w-sm">Track your WPM progress, accuracy heatmaps, and game level unlocks.</p>
        <Link href="/login"><Button size="lg">Login / Register</Button></Link>
      </div>
    );
  }

  const recentSessions = sessions?.slice(0, 8) ?? [];
  const chartData = progress ?? [];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your complete performance overview, {user.username}.</p>
        </div>
        <Link href="/games">
          <Button className="gap-2">Play Now <ArrowRight className="w-4 h-4" /></Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Average WPM" value={stats?.averageWpm ?? "—"} icon={Zap} color="bg-primary/20 text-primary" />
        <StatCard label="Best WPM" value={stats?.bestWpm ?? "—"} icon={Trophy} color="bg-chart-2/20 text-chart-2" />
        <StatCard label="Total Sessions" value={stats?.totalSessions ?? "—"} icon={BarChart2} color="bg-chart-3/20 text-chart-3" />
        <StatCard label="Day Streak" value={stats?.currentStreak ?? "—"} icon={Flame} color="bg-chart-4/20 text-chart-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-1">WPM Progress</h3>
          <p className="text-sm text-muted-foreground mb-5">Your speed over time</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              Play some games to see your progress chart
            </div>
          )}
        </div>

        <LetterHeatmap userId={user.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Game Level Progress</h3>
          <div className="space-y-3">
            {(levelProgress ?? []).map(gp => (
              <div key={gp.gameId} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{gp.gameName}</span>
                    <span className="text-muted-foreground text-xs ml-2 flex-shrink-0">
                      {gp.currentLevel}/{gp.totalLevels}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(gp.currentLevel / gp.totalLevels) * 100}%` }}
                    />
                  </div>
                </div>
                {gp.bestWpm && <span className="text-xs text-muted-foreground font-mono w-16 text-right">{gp.bestWpm} WPM</span>}
              </div>
            ))}
            {!levelProgress?.length && (
              <p className="text-sm text-muted-foreground">Start playing to track your level progress.</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Recent Sessions</h3>
          <div className="space-y-2">
            {recentSessions.length > 0 ? recentSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-sm font-medium">{s.gameMode.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                  <span className="text-xs text-muted-foreground ml-2">Lvl {s.level}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-mono">
                  <span className="text-primary font-bold">{s.wpm} WPM</span>
                  <span className="text-muted-foreground">{Math.round(s.accuracy)}%</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No sessions yet. Start playing!</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-card-border rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold font-mono text-chart-2">{stats?.averageAccuracy?.toFixed(1) ?? "—"}%</div>
          <div className="text-sm text-muted-foreground mt-1">Avg Accuracy</div>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold font-mono text-chart-3">{stats?.wordsTyped?.toLocaleString() ?? "—"}</div>
          <div className="text-sm text-muted-foreground mt-1">Words Typed</div>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold font-mono text-chart-4">{stats?.totalTimeMinutes?.toFixed(0) ?? "—"}m</div>
          <div className="text-sm text-muted-foreground mt-1">Time Practiced</div>
        </div>
      </div>
    </div>
  );
}
