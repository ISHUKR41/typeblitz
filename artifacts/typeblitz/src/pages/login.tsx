import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Keyboard, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({
          title: "Access Granted",
          description: "Welcome back to the arena.",
        });
        setLocation("/games");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: error?.message || "Invalid credentials.",
        });
      }
    });
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none z-[-1]" />
      
      <div className="mb-8 flex items-center justify-center">
        <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]">
          <Keyboard className="w-6 h-6" />
        </div>
      </div>

      <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <CardHeader className="space-y-1 pb-8 text-center">
          <CardTitle className="text-3xl font-black tracking-tight">System Login</CardTitle>
          <CardDescription className="text-muted-foreground">Authenticate to resume your training</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pilot designation" {...field} className="bg-black/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-black/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary h-12 font-mono tracking-widest text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all group" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Initialize Connection
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground">
            No active profile? <Link href="/register" className="text-primary hover:text-primary/80 font-bold hover:underline">Register here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
