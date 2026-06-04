import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/layout";

// Lazy loaded page components
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Games = lazy(() => import("@/pages/games"));
const Play = lazy(() => import("@/pages/play"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const Practice = lazy(() => import("@/pages/practice"));
const LessonPage = lazy(() => import("@/pages/lesson"));
const ChallengePage = lazy(() => import("@/pages/challenge"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh] p-8">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground font-mono text-xs">Loading Arena Page...</p>
            </div>
          </div>
        }
      >
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/games" component={Games} />
          <Route path="/play/:gameId/:level" component={Play} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/challenge" component={ChallengePage} />
          <Route path="/practice" component={Practice} />
          <Route path="/lessons/:lessonId" component={LessonPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
