import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import {
  getCurrentAuthUser,
  type AppRole,
  type AuthUser,
} from "../lib/auth";

import { supabase } from "../lib/supabase";

interface AuthContextValue {
  session: Session | null;
  authUser: AuthUser | null;
  roles: AppRole[];
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAuthUser(
    currentSession: Session | null
  ) {
    if (!currentSession) {
      setAuthUser(null);
      return;
    }

    try {
      const currentAuthUser = await getCurrentAuthUser();

      setAuthUser(currentAuthUser);
    } catch {
      setAuthUser(null);
    }
  }

  async function refreshAuth() {
    setLoading(true);

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);

      await loadAuthUser(currentSession);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setSession(currentSession);

        await loadAuthUser(currentSession);
      } catch {
        if (mounted) {
          setSession(null);
          setAuthUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) {
          return;
        }

        setSession(currentSession);

        if (!currentSession) {
          setAuthUser(null);
          return;
        }

        /*
         * Let the React state update complete before loading
         * profile and role information.
         */
        setTimeout(() => {
          if (mounted) {
            void loadAuthUser(currentSession);
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      authUser,
      roles: authUser?.roles ?? [],
      loading,
      refreshAuth,
    }),
    [session, authUser, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}