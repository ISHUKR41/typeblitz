import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Keyboard } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ data: { username, password } });
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        await register({ data: { username, password } });
        toast({ title: "Account created!", description: "Welcome to TypeBlitz." });
      }
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-card/90 backdrop-blur border border-primary/15 p-8 rounded-2xl shadow-2xl shadow-primary/5 relative"
        style={{ boxShadow: "0 0 0 1px rgba(0,245,255,0.06), 0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(0,245,255,0.04)" }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary mb-4"
            style={{ boxShadow: "0 0 24px rgba(0,245,255,0.2)" }}>
            <Keyboard className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold font-mono tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm text-center">
            {isLogin ? "Sign in to track your WPM progress and compete globally" : "Join TypeBlitz — track speed, accuracy, and unlock achievements"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background font-mono"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background font-mono"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
          
          <Button type="submit" className="w-full h-12 text-lg font-bold mt-6">
            {isLogin ? "ACCESS_GRANTED" : "REGISTER_USER"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
