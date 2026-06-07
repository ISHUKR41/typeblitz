import { useAuth } from "@/context/AuthContext";
import { useGetUserStats, useGetLetterAccuracy, useGetUserSessions, useGetUserProgress, useGetLevelProgress } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Trophy, Zap, Clock, Keyboard, Target, Flame } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useGetUserStats(user?.id || "", {
    query: { enabled: !!user?.id }
  });
  
  const { data: progress, isLoading: progressLoading } = useGetUserProgress(user?.id || "", {
    query: { enabled: !!user?.id }
  });

  const { data: sessions, isLoading: sessionsLoading } = useGetUserSessions(user?.id || "", {
    query: { enabled: !!user?.id }
  });

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Please log in to view your dashboard.</div>;
  }

  if (statsLoading || progressLoading || sessionsLoading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Pilot Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}. Here is your training telemetry.</p>
        </div>
        {stats && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg border border-border">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Global Rank</div>
                <div className="font-bold">#{stats.rank || "---"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg border border-border">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Streak</div>
                <div className="font-bold">{stats.currentStreak} Days</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">AVG WPM</span>
              </div>
              <div className="text-4xl font-black text-white">{Math.round(stats.averageWpm)}</div>
              <p className="text-sm text-muted-foreground mt-2">Overall speed average</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center text-green-500">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">ACCURACY</span>
              </div>
              <div className="text-4xl font-black text-white">{Math.round(stats.averageAccuracy)}%</div>
              <p className="text-sm text-muted-foreground mt-2">Overall precision</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">BEST WPM</span>
              </div>
              <div className="text-4xl font-black text-white">{Math.round(stats.bestWpm)}</div>
              <p className="text-sm text-muted-foreground mt-2">Peak performance</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center text-purple-500">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">TIME</span>
              </div>
              <div className="text-4xl font-black text-white">{Math.round(stats.totalTimeMinutes / 60)}h {Math.round(stats.totalTimeMinutes % 60)}m</div>
              <p className="text-sm text-muted-foreground mt-2">Total training time</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Performance History
            </CardTitle>
            <CardDescription>WPM progression over your last sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {progress && progress.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progress} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      labelFormatter={(val) => format(new Date(val), 'MMM dd, yyyy')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wpm" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Not enough data for chart. Complete more sessions!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              Recent Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions && sessions.length > 0 ? (
                sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded bg-secondary/30 border border-border/50">
                    <div>
                      <div className="font-medium text-sm capitalize">{session.gameMode.replace('-', ' ')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(session.completedAt), 'MMM dd, HH:mm')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{Math.round(session.wpm)} WPM</div>
                      <div className="text-xs text-muted-foreground">{Math.round(session.accuracy)}% ACC</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recent sessions.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
