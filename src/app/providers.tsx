"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SessionUser {
  id: number;
  name: string;
  username: string;
  role: string;
}

interface SessionCtx {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionCtx>({ user: null, loading: true, refresh: () => {}, logout: async () => {} });

export function useSession() {
  return useContext(SessionContext);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => { setUser(null); setLoading(false); });
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
