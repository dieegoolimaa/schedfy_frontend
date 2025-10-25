import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterData,
  AuthTokens,
} from "../types/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  oauthLogin: (provider: string) => Promise<void>;
}

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_LOADING":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...initialState,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("schedfy-access-token");
      if (token) {
        try {
          dispatch({ type: "AUTH_LOADING" });
          // TODO: Verify token with backend
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
            dispatch({ type: "AUTH_SUCCESS", payload: user });
          } else {
            localStorage.removeItem("schedfy-access-token");
            localStorage.removeItem("schedfy-refresh-token");
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } catch (error) {
          localStorage.removeItem("schedfy-access-token");
          localStorage.removeItem("schedfy-refresh-token");
          dispatch({ type: "AUTH_LOGOUT" });
        }
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "AUTH_LOADING" });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data: { user: User; tokens: AuthTokens } = await response.json();

      localStorage.setItem("schedfy-access-token", data.tokens.accessToken);
      localStorage.setItem("schedfy-refresh-token", data.tokens.refreshToken);

      dispatch({ type: "AUTH_SUCCESS", payload: data.user });
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: "AUTH_LOADING" });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result: { user: User; tokens: AuthTokens } = await response.json();

      localStorage.setItem("schedfy-access-token", result.tokens.accessToken);
      localStorage.setItem("schedfy-refresh-token", result.tokens.refreshToken);

      dispatch({ type: "AUTH_SUCCESS", payload: result.user });
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error instanceof Error ? error.message : "Registration failed",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("schedfy-access-token");
    localStorage.removeItem("schedfy-refresh-token");
    dispatch({ type: "AUTH_LOGOUT" });
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("schedfy-refresh-token");
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data: { tokens: AuthTokens } = await response.json();

      localStorage.setItem("schedfy-access-token", data.tokens.accessToken);
      localStorage.setItem("schedfy-refresh-token", data.tokens.refreshToken);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const oauthLogin = async (provider: string) => {
    try {
      // Redirect to OAuth provider
      globalThis.location.href = `/api/auth/oauth/${provider}`;
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error instanceof Error ? error.message : "OAuth login failed",
      });
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshToken,
      oauthLogin,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
