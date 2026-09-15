import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import client from "../api/client";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName?: string;
}

function normaliseUser(value: unknown): UserInfo | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const nested = source.data || source.user || source;
  if (!nested || typeof nested !== "object") return null;
  const user = nested as Record<string, unknown>;
  const id = (user.id || user.userId || user.sub) as string | undefined;
  if (!id) return null;
  const role = user.role;
  const roleObject =
    role && typeof role === "object"
      ? (role as Record<string, unknown>)
      : null;
  const roleName =
    (user.roleName as string) ||
    (user.roleNombre as string) ||
    (roleObject?.nombre as string) ||
    (roleObject?.name as string) ||
    (typeof role === "string" ? role : "");
  return {
    id,
    email: (user.email as string) || "",
    name: ((user.name || user.nombre) as string) || "",
    roleId: ((user.roleId || user.role) as string) || "",
    roleName,
  };
}

function saveUser(user: UserInfo | null) {
  if (user) localStorage.setItem("currentUser", JSON.stringify(user));
}

interface AuthContextType {
  token: string | null;
  currentUser: UserInfo | null;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  currentUser: null,
  isAdmin: false,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        return normaliseUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;
    try {
      const decoded: Record<string, unknown> = JSON.parse(
        atob(storedToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      return normaliseUser({
        id: (decoded.userId as string) || (decoded.sub as string) || "",
        email: (decoded.email as string) || "",
        name: (decoded.name as string) || "",
        roleId: (decoded.roleId as string) || (decoded.role as string) || "",
        roleName:
          (decoded.roleName as string) || (decoded.role as string) || "",
      });
    } catch {
      return null;
    }
  });

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const { data } = await client.get("/auth/me");
      const user = normaliseUser(data);
      setCurrentUser(user);
      saveUser(user);
    } catch {
      try {
        const decoded: Record<string, unknown> = JSON.parse(
          atob(newToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
        const user = normaliseUser({
          id: (decoded.userId as string) || (decoded.sub as string) || "",
          email: (decoded.email as string) || "",
          name: (decoded.name as string) || "",
          roleId: (decoded.roleId as string) || (decoded.role as string) || "",
          roleName:
            (decoded.roleName as string) || (decoded.role as string) || "",
        });
        setCurrentUser(user);
        saveUser(user);
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setToken(null);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      client
        .get("/auth/me")
        .then(({ data }) => {
          const user = normaliseUser(data);
          setCurrentUser(user);
          saveUser(user);
        })
        .catch(() => undefined);
    }

    const handleStorage = async (e: StorageEvent) => {
      if (e.key === "token") {
        setToken(e.newValue);
        if (e.newValue) {
          try {
            const { data } = await client.get("/auth/me");
            const user = normaliseUser(data);
            setCurrentUser(user);
            saveUser(user);
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isAdmin =
    currentUser?.roleName === "Administrador" ||
    currentUser?.roleName === "Admin" ||
    currentUser?.roleId === "admin" ||
    false;

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAdmin,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
