import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLogin, useRegister, useLogout, useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutateAsync"];
  register: ReturnType<typeof useRegister>["mutateAsync"];
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("token"));
  }, []);

  const { data: me, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (me) setUser(me);
  }, [me]);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const handleLogin: typeof loginMutation.mutateAsync = async (vars, options) => {
    const res = await loginMutation.mutateAsync(vars, options);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const handleRegister: typeof registerMutation.mutateAsync = async (vars, options) => {
    const res = await registerMutation.mutateAsync(vars, options);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const handleLogout = () => {
    logoutMutation.mutate({});
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
