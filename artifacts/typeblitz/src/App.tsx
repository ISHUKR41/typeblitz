import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Games from "@/pages/games";
import Dashboard from "@/pages/dashboard";
import Leaderboard from "@/pages/leaderboard";
import SpeedTest from "@/pages/speed-test";
import Practice from "@/pages/practice";
import Lessons from "@/pages/lessons";
import Lesson from "@/pages/lesson";
import Play from "@/pages/play";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Layout>
              <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div></div>}>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Register} />
                  <Route path="/games" component={Games} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/leaderboard" component={Leaderboard} />
                  <Route path="/speed-test" component={SpeedTest} />
                  <Route path="/practice" component={Practice} />
                  <Route path="/lessons" component={Lessons} />
                  <Route path="/lessons/:id" component={Lesson} />
                  <Route path="/games/:id" component={Play} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </Layout>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
