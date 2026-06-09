import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, access: string, refresh: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, access, refresh) => {
        set({ user, accessToken: access, refreshToken: refresh });
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);
        }
      },
      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      },
    }),
    { name: "auth-store" }
  )
);

interface UIState {
  locale: "ar" | "en";
  setLocale: (l: "ar" | "en") => void;
}

export const useUIStore = create<UIState>()((set) => ({
  locale: "ar",
  setLocale: (locale) => set({ locale }),
}));
