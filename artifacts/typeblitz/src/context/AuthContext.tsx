import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react/src/custom-fetch";

type User = {
  id: string;
  username: string;
  createdAt: string;
  totalSessions?: number | null;
  bestWpm?: number | null;
  currentLevel?: number | null;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("typeblitz_token"));
  const [user, setUser] = useState<User | null>(null);

  // Set the token getter for Orval's custom fetch
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const { data: meData, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
    if (isError) {
      logout();
    }
  }, [meData, isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("typeblitz_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("typeblitz_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading: isLoading && !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
