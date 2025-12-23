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
  AuthEntity,
  LoginCredentials,
} from "../types/dto/auth";
import { authService } from "../services/auth.service";
import { storage } from "../lib/storage";
import { EntityPlan, Region, UserRole } from "../types/enums";

// Use AuthEntity as Entity for this context
type Entity = AuthEntity;

// Transform backend user response to frontend User type
export function transformBackendUser(backendUser: any, entity?: any): User {
  // Normalize plan names from backend
  const normalizePlan = (
    plan: string
  ): EntityPlan => {
    const planLower = (plan || "simple").toLowerCase();

    // Map various plan names to our three types
    if (
      planLower === "simple" ||
      planLower === "free" ||
      planLower === "basic"
    ) {
      return EntityPlan.SIMPLE;
    }
    if (
      planLower === "individual" ||
      planLower === "pro" ||
      planLower === "professional"
    ) {
      return EntityPlan.INDIVIDUAL;
    }
    if (
      planLower === "business" ||
      planLower === "entity" ||
      planLower === "enterprise" ||
      planLower === "team"
    ) {
      return EntityPlan.BUSINESS;
    }

    console.warn(
      `[AuthContext] Unknown plan type "${plan}", defaulting to "simple"`
    );
    return EntityPlan.SIMPLE;
  };

  // Prioritize entity plan if available, otherwise fallback to user plan
  const effectivePlan = entity?.plan || backendUser.plan;
  const normalizedPlan = normalizePlan(effectivePlan);

  console.log(
    `[AuthContext] Transforming user - Original user plan: "${backendUser.plan}", Entity plan: "${entity?.plan}", Effective Normalized: "${normalizedPlan}"`
  );
  console.log("[AuthContext] Full backend user object:", backendUser);

  return {
    id: backendUser.id,
    email: backendUser.email,
    name:
      backendUser.name || `${backendUser.firstName} ${backendUser.lastName}`,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    avatar: backendUser.avatar,
    plan: normalizedPlan,
    role: backendUser.role as UserRole,
    platform: backendUser.platform || "client", // Default to client platform
    entityId: backendUser.entityId,
    country: backendUser.country || Region.PORTUGAL,
    timezone: backendUser.timezone || "Europe/Lisbon",
    locale: backendUser.locale || "en",
    isEmailVerified: backendUser.isEmailVerified || false,
    phone: backendUser.phone,
    isProfessional: backendUser.isProfessional,
    professionalInfo: backendUser.professionalInfo,
    createdAt: backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updatedAt || new Date().toISOString(),
    permissions: backendUser.permissions || [],
    deniedPermissions: backendUser.deniedPermissions || [],
    mustChangePassword: backendUser.mustChangePassword, // Mapped property
  };
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  requires2FA?: boolean;
  tempToken?: string | null;
  verify2FA: (code: string) => Promise<User>;
  updateUser: (user: User) => void;
  updateEntity: (entity: Entity) => void;
}

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; entity: Entity | null } }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "UPDATE_ENTITY"; payload: Entity };

const initialState: AuthState & {
  requires2FA?: boolean;
  tempToken?: string | null;
} = {
  user: null,
  entity: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requires2FA: false,
  tempToken: null,
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
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "UPDATE_ENTITY":
      return {
        ...state,
        entity: action.payload,
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
  const [requires2FA, setRequires2FA] = React.useState(false);
  const [tempToken, setTempToken] = React.useState<string | null>(null);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = storage.getToken();
      console.log("[AuthProvider] Token on reload:", token);
      if (token) {
        try {
          dispatch({ type: "AUTH_LOADING" });
          // Verify token with backend
          const response = await authService.getProfile();
          if (response.data) {
            // Check if response.data has user and entity properties
            const userData = (response.data as any).user || response.data;
            const entityData = (response.data as any).entity || null;

            // Transform backend user to frontend User type, passing entity data to resolve plan
            const transformedUser = transformBackendUser(userData, entityData);
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: transformedUser, entity: entityData },
            });
          } else {
            storage.clearAuth();
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          storage.clearAuth();
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

      if (!response.data) {
        throw new Error("Login failed - no data received");
      }

      // Check if 2FA is required
      if (response.data.requires2FA && response.data.tempToken) {
        console.log("[AuthContext] 2FA required, storing temp token");
        setTempToken(response.data.tempToken);
        setRequires2FA(true);
        dispatch({ type: "AUTH_LOADING" }); // Keep loading state
        throw new Error("2FA_REQUIRED"); // Special error to trigger 2FA UI
      }

      const { user, entity } = response.data;

      if (!user) {
        throw new Error("Login failed - no user in response");
      }

      // Transform backend user to frontend User type, passing entity to resolve plan
      const transformedUser = transformBackendUser(user, entity);

      // Clear 2FA state on successful login
      setRequires2FA(false);
      setTempToken(null);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: transformedUser, entity: entity || null },
      });
      return transformedUser;
    } catch (error: any) {
      // Don't show error for 2FA requirement
      if (error.message === "2FA_REQUIRED") {
        throw error; // Re-throw to let UI handle it
      }
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed";
      dispatch({
        type: "AUTH_ERROR",
        payload: errorMessage,
      });
      throw error;
    }
  };

  const verify2FA = async (code: string): Promise<User> => {
    if (!tempToken) {
      throw new Error("No temporary token available");
    }

    try {
      dispatch({ type: "AUTH_LOADING" });

      // Call 2FA verification endpoint
      const response = await authService.verify2FA(tempToken, code);

      if (!response.data) {
        throw new Error("2FA verification failed - no data received");
      }

      const { user, entity } = response.data;

      if (!user) {
        throw new Error("2FA verification failed - no user in response");
      }

      // Transform backend user to frontend User type, passing entity to resolve plan
      const transformedUser = transformBackendUser(user, entity);

      // Clear 2FA state
      setRequires2FA(false);
      setTempToken(null);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: transformedUser, entity: entity || null },
      });
      return transformedUser;
    } catch (error: any) {
      console.error("2FA verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invalid verification code";
      dispatch({
        type: "AUTH_ERROR",
        payload: errorMessage,
      });
      throw error;
    }
  };

  const logout = () => {
    storage.clearAuth();
    setRequires2FA(false);
    setTempToken(null);
    dispatch({ type: "AUTH_LOGOUT" });
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = storage.getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await authService.refreshToken(refreshTokenValue);

      if (!response.data) {
        throw new Error("Token refresh failed");
      }

      const { access_token, refresh_token } = response.data;

      if (access_token) {
        storage.setToken(access_token);
      }
      if (refresh_token) {
        storage.setRefreshToken(refresh_token);
      }
    } catch (error) {
      logout();
      throw error;
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: "UPDATE_USER", payload: user });
  };

  const updateEntity = (entity: Entity) => {
    dispatch({ type: "UPDATE_ENTITY", payload: entity });
  };

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      refreshToken,
      verify2FA,
      requires2FA,
      tempToken,
      updateUser,
      updateEntity,
    }),
    [state, requires2FA, tempToken]
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
