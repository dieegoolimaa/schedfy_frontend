import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import { AuthState, User, LoginCredentials, RegisterData } from "../types/auth";
import { authApi } from "../lib/api/auth.api";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  oauthLogin: (provider: string) => Promise<void>;
  // Development helper function
  switchRole: (role: string) => void;
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
          // Verify token with backend
          const response = await authApi.getProfile();

          if (response.data) {
            dispatch({ type: "AUTH_SUCCESS", payload: response.data as User });
          } else {
            localStorage.removeItem("schedfy-access-token");
            localStorage.removeItem("schedfy-refresh-token");
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
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

      const response = await authApi.login(credentials);

      console.log("Login response:", response);
      console.log("Response data:", response.data);

      if (!response.data) {
        throw new Error("Login failed - no data received");
      }

      const { user } = response.data;

      console.log("User from response:", user);

      if (!user) {
        throw new Error("Login failed - no user in response");
      }

      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed";
      dispatch({
        type: "AUTH_ERROR",
        payload: errorMessage,
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: "AUTH_LOADING" });

      const regionMap: Record<string, "PT" | "BR" | "US"> = {
        PT: "PT",
        BR: "BR",
        US: "US",
        Portugal: "PT",
        Brazil: "BR",
        USA: "US",
      };

      const region = regionMap[data.region || data.country || "PT"] || "PT";

      const response = await authApi.register({
        name: data.name || data.firstName || "",
        email: data.email,
        password: data.password,
        plan: data.plan || "simple",
        role: "owner", // Default role for registration
        region,
      });

      if (!response.data) {
        throw new Error("Registration failed - no data received");
      }

      const { user } = response.data;

      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      dispatch({
        type: "AUTH_ERROR",
        payload: errorMessage,
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

      const response = await authApi.refreshToken(refreshTokenValue);

      if (!response.data) {
        throw new Error("Token refresh failed");
      }

      const { access_token, refresh_token } = response.data;

      if (access_token) {
        localStorage.setItem("schedfy-access-token", access_token);
        localStorage.setItem("schedfy-token", access_token);
      }
      if (refresh_token) {
        localStorage.setItem("schedfy-refresh-token", refresh_token);
      }
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

  // Development helper to switch between roles for testing
  const switchRole = (role: string) => {
    if (process.env.NODE_ENV === "development") {
      const mockUsers = {
        platform_admin: {
          id: "1",
          email: "admin@schedfy.com",
          name: "Platform Administrator",
          role: "platform_admin" as const,
          plan: "business" as const,
          businessId: undefined,
          country: "PT" as const,
          timezone: "Europe/Lisbon",
          locale: "en",
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: undefined,
        },
        owner: {
          id: "2",
          email: "business@schedfy.com",
          name: "Business Owner",
          role: "owner" as const,
          plan: "business" as const,
          businessId: "business-1",
          country: "PT" as const,
          timezone: "Europe/Lisbon",
          locale: "en",
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: undefined,
        },
        professional: {
          id: "3",
          email: "pro@schedfy.com",
          name: "Professional User",
          role: "professional" as const,
          plan: "individual" as const,
          businessId: "business-1",
          country: "PT" as const,
          timezone: "Europe/Lisbon",
          locale: "en",
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: undefined,
        },
        client: {
          id: "4",
          email: "user@schedfy.com",
          name: "Simple User",
          role: "owner" as const, // Simple users are still owners but with simple plan
          plan: "simple" as const,
          businessId: undefined,
          country: "PT" as const,
          timezone: "Europe/Lisbon",
          locale: "en",
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: undefined,
        },
      };

      const mockUser = mockUsers[role as keyof typeof mockUsers];
      if (mockUser) {
        dispatch({ type: "AUTH_SUCCESS", payload: mockUser as User });
        localStorage.setItem("schedfy-dev-role", role);
      }
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
      switchRole,
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
