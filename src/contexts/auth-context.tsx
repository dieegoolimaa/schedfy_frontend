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
  Entity,
  LoginCredentials,
  RegisterData,
} from "../types/auth";
import { authService } from "../services/auth.service";

// Transform backend user response to frontend User type
function transformBackendUser(backendUser: any): User {
  // Normalize plan names from backend
  const normalizePlan = (
    plan: string
  ): "simple" | "individual" | "business" => {
    const planLower = (plan || "simple").toLowerCase();

    // Map various plan names to our three types
    if (
      planLower === "simple" ||
      planLower === "free" ||
      planLower === "basic"
    ) {
      return "simple";
    }
    if (
      planLower === "individual" ||
      planLower === "pro" ||
      planLower === "professional"
    ) {
      return "individual";
    }
    if (
      planLower === "business" ||
      planLower === "entity" ||
      planLower === "enterprise" ||
      planLower === "team"
    ) {
      return "business";
    }

    console.warn(
      `[AuthContext] Unknown plan type "${plan}", defaulting to "simple"`
    );
    return "simple";
  };

  const normalizedPlan = normalizePlan(backendUser.plan);

  console.log(
    `[AuthContext] Transforming user - Original plan: "${backendUser.plan}", Normalized: "${normalizedPlan}"`
  );
  console.log("[AuthContext] Full backend user object:", backendUser);

  return {
    id: backendUser.id,
    email: backendUser.email,
    name:
      backendUser.name || `${backendUser.firstName} ${backendUser.lastName}`,
    avatar: backendUser.avatar,
    plan: normalizedPlan,
    role: backendUser.role,
    entityId: backendUser.entityId,
    country: backendUser.country || "PT",
    timezone: backendUser.timezone || "Europe/Lisbon",
    locale: backendUser.locale || "en",
    isEmailVerified: backendUser.isEmailVerified || false,
    createdAt: backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updatedAt || new Date().toISOString(),
  };
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  oauthLogin: (provider: string) => Promise<void>;
}

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; entity: Entity | null } }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  entity: null,
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
        user: action.payload.user,
        entity: action.payload.entity,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        entity: null,
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
      console.log("[AuthProvider] Token on reload:", token);
      if (token) {
        try {
          dispatch({ type: "AUTH_LOADING" });
          // Verify token with backend
          const response = await authService.getProfile();
          console.log("[AuthProvider] Profile response:", response);
          if (response.data) {
            // Check if response.data has user and entity properties
            const userData = (response.data as any).user || response.data;
            const entityData = (response.data as any).entity || null;

            // Transform backend user to frontend User type
            const transformedUser = transformBackendUser(userData);
            console.log(
              "[AuthProvider] Transformed user on reload:",
              transformedUser
            );
            console.log("[AuthProvider] Entity on reload:", entityData);
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: transformedUser, entity: entityData },
            });
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

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      dispatch({ type: "AUTH_LOADING" });

      const response = await authService.login(credentials);

      console.log("Login response:", response);
      console.log("Response data:", response.data);

      if (!response.data) {
        throw new Error("Login failed - no data received");
      }

      const { user, entity } = response.data;

      console.log("User from response:", user);
      console.log("Entity from response:", entity);

      if (!user) {
        throw new Error("Login failed - no user in response");
      }

      // Transform backend user to frontend User type
      const transformedUser = transformBackendUser(user);
      console.log("Transformed user:", transformedUser);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: transformedUser, entity: entity || null },
      });
      return transformedUser;
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

      // Map data correctly to backend expectations
      const response = await authService.register({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email,
        password: data.password,
        role: "professional", // Default role
      });

      if (!response.data) {
        throw new Error("Registration failed - no data received");
      }

      const { user, entity } = response.data;

      // Transform backend user to frontend User type
      const transformedUser = transformBackendUser(user);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: transformedUser, entity: entity || null },
      });
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

      const response = await authService.refreshToken(refreshTokenValue);

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
