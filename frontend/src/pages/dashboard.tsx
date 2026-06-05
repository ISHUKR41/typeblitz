import { useState, useMemo } from "react";
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
import { Zap, Target, Clock, Flame, BarChart2, Trophy, ArrowRight, Lock, Star, Shield, Code2, Sword, Rocket, CheckCircle2 } from "lucide-react";

const ACHIEVEMENTS = [
  { id: "wpm30",  icon: "⚡", color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/25",  title: "Speed Starter",    desc: "Reach 30 WPM",    check: (s: any) => (s?.bestWpm ?? 0) >= 30   },
  { id: "wpm50",  icon: "🚀", color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/25",  title: "Speedster",        desc: "Reach 50 WPM",    check: (s: any) => (s?.bestWpm ?? 0) >= 50   },
  { id: "wpm80",  icon: "🔥", color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/25",     title: "Elite Typist",     desc: "Reach 80 WPM",    check: (s: any) => (s?.bestWpm ?? 0) >= 80   },
  { id: "wpm100", icon: "💎", color: "text-cyan-300",    bg: "bg-cyan-300/10",    border: "border-cyan-300/25",    title: "Century Club",     desc: "Reach 100 WPM",   check: (s: any) => (s?.bestWpm ?? 0) >= 100  },
  { id: "acc95",  icon: "🎯", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25", title: "Sharpshooter",     desc: "95%+ avg accuracy",check: (s: any) => (s?.averageAccuracy ?? 0) >= 95  },
  { id: "acc99",  icon: "✨", color: "text-violet-300",  bg: "bg-violet-300/10",  border: "border-violet-300/25",  title: "Perfectionist",    desc: "99%+ avg accuracy",check: (s: any) => (s?.averageAccuracy ?? 0) >= 99  },
  { id: "sess10", icon: "🎮", color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/25",    title: "Getting Warmed Up",desc: "10 sessions",      check: (s: any) => (s?.totalSessions ?? 0) >= 10  },
  { id: "sess50", icon: "🏆", color: "text-yellow-300",  bg: "bg-yellow-300/10",  border: "border-yellow-300/25",  title: "Dedicated",        desc: "50 sessions",      check: (s: any) => (s?.totalSessions ?? 0) >= 50  },
  { id: "sess200",icon: "👑", color: "text-amber-300",   bg: "bg-amber-300/10",   border: "border-amber-300/25",   title: "Grandmaster",      desc: "200 sessions",     check: (s: any) => (s?.totalSessions ?? 0) >= 200 },
  { id: "str3",   icon: "📅", color: "text-lime-400",    bg: "bg-lime-400/10",    border: "border-lime-400/25",    title: "Streak Start",     desc: "3-day streak",     check: (s: any) => (s?.currentStreak ?? 0) >= 3   },
  { id: "str7",   icon: "🗓️", color: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/25",   title: "Weekly Warrior",   desc: "7-day streak",     check: (s: any) => (s?.currentStreak ?? 0) >= 7   },
  { id: "str30",  icon: "🌟", color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/25",     title: "Iron Discipline",  desc: "30-day streak",    check: (s: any) => (s?.currentStreak ?? 0) >= 30  },
];

function AchievementsPanel({ stats }: { stats: any }) {
  const unlocked = ACHIEVEMENTS.filter(a => a.check(stats));
  const locked = ACHIEVEMENTS.filter(a => !a.check(stats));
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg mb-0.5">Achievements</h3>
          <p className="text-sm text-muted-foreground">{unlocked.length}/{ACHIEVEMENTS.length} unlocked</p>
        </div>
        <div className="text-2xl font-black font-mono text-yellow-400">{unlocked.length}<span className="text-sm text-muted-foreground font-normal">/{ACHIEVEMENTS.length}</span></div>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-5">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-yellow-400 to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[...unlocked, ...locked].map((a, i) => {
          const isUnlocked = a.check(stats);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`p-3 rounded-xl border transition-all ${isUnlocked ? `${a.bg} ${a.border}` : "bg-muted/20 border-border opacity-50"}`}
            >
              <div className="text-lg mb-1">{isUnlocked ? a.icon : "🔒"}</div>
              <div className={`text-xs font-bold ${isUnlocked ? a.color : "text-muted-foreground"}`}>{a.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

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

const HEATMAP_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"]
];

function LetterHeatmap({ userId }: { userId: string }) {
  const { data: letters } = useGetLetterAccuracy(userId, {
    query: { queryKey: getGetLetterAccuracyQueryKey(userId) }
  });

  const letterMap = useMemo(() => {
    return new Map((letters ?? []).map(l => [l.letter, { accuracy: l.accuracy, attempts: l.attempts, correct: l.correct }]));
  }, [letters]);

  const getKeycapStyles = (letter: string) => {
    const data = letterMap.get(letter);
    if (!data || data.attempts === 0) {
      return "bg-muted/40 text-muted-foreground border-border border-b-muted/70 shadow-[0_3px_0_rgba(255,255,255,0.05)]";
    }
    const acc = data.accuracy;
    if (acc >= 95) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 border-b-emerald-600/70 shadow-[0_3px_0_rgba(16,185,129,0.25)] hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    }
    if (acc >= 85) {
      return "bg-green-500/10 text-green-300 border-green-500/30 border-b-green-600/70 shadow-[0_3px_0_rgba(34,197,94,0.2)] hover:shadow-[0_0_8px_rgba(34,197,94,0.2)]";
    }
    if (acc >= 70) {
      return "bg-amber-500/10 text-amber-300 border-amber-500/30 border-b-amber-600/70 shadow-[0_3px_0_rgba(245,158,11,0.2)] hover:shadow-[0_0_8px_rgba(245,158,11,0.2)]";
    }
    return "bg-red-500/10 text-red-400 border-red-500/40 border-b-red-600/70 shadow-[0_3px_0_rgba(239,68,68,0.25)] hover:shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg mb-1">Mechanical Heatmap</h3>
        <p className="text-sm text-muted-foreground mb-6">Visual layout of your keys. Red indicates accuracy bottleneck.</p>
      </div>

      <div className="space-y-2.5 sm:space-y-3.5 my-auto py-2">
        {HEATMAP_ROWS.map((row, rIdx) => {
          let indentClass = "";
          if (rIdx === 1) indentClass = "pl-4 sm:pl-6";
          if (rIdx === 2) indentClass = "pl-8 sm:pl-12";
          
          return (
            <div key={rIdx} className={`flex gap-1.5 sm:gap-2 ${indentClass}`}>
              {row.map(letter => {
                const data = letterMap.get(letter);
                const tooltipText = data 
                  ? `${letter.toUpperCase()}: ${data.accuracy}% accuracy (${data.correct}/${data.attempts} correct)`
                  : `${letter.toUpperCase()}: No stats logged`;

                return (
                  <div
                    key={letter}
                    title={tooltipText}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex flex-col items-center justify-center font-mono font-black text-sm uppercase border transition-all duration-150 hover:-translate-y-0.5 cursor-help ${getKeycapStyles(letter)}`}
                  >
                    <span className="text-xs sm:text-sm">{letter}</span>
                    {data && data.attempts > 0 && (
                      <span className="text-[8px] opacity-65 font-medium -mt-0.5">{Math.round(data.accuracy)}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-muted-foreground border-t border-border pt-4">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border border-emerald-500/40 bg-emerald-500/10 inline-block" /> 95%+ Excellent</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border border-green-500/30 bg-green-500/10 inline-block" /> 85-95% Good</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border border-amber-500/30 bg-amber-500/10 inline-block" /> 70-85% Warning</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border border-red-500/40 bg-red-500/10 inline-block" /> &lt;70% Focus Needed</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border border-muted bg-muted/40 inline-block" /> No data</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useGetUserStats(user?.id ?? "", {
    query: { enabled: !!user?.id, queryKey: getGetUserStatsQueryKey(user?.id ?? "") }
  });

  const { data: progress } = useGetUserProgress(user?.id ?? "", {
    query: { enabled: !!user?.id, queryKey: getGetUserProgressQueryKey(user?.id ?? "") }
  });

  const { data: sessions } = useGetUserSessions(user?.id ?? "", {
    query: { enabled: !!user?.id, queryKey: getGetUserSessionsQueryKey(user?.id ?? "") }
  });

  const { data: levelProgress } = useGetLevelProgress(user?.id ?? "", {
    query: { enabled: !!user?.id, queryKey: getGetLevelProgressQueryKey(user?.id ?? "") }
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Global Rank" value={stats?.rank ? `#${stats.rank}` : "—"} icon={Trophy} color="bg-yellow-500/20 text-yellow-500" />
        <StatCard label="Best WPM" value={stats?.bestWpm ?? "—"} icon={Zap} color="bg-primary/20 text-primary" />
        <StatCard label="Average WPM" value={stats?.averageWpm ?? "—"} icon={BarChart2} color="bg-chart-2/20 text-chart-2" />
        <StatCard label="Total Sessions" value={stats?.totalSessions ?? "—"} icon={Clock} color="bg-chart-3/20 text-chart-3" />
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

      <AchievementsPanel stats={stats} />
    </div>
  );
}
