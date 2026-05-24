import { createContext, type ReactNode, useCallback, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
	login as apiLogin,
	register as apiRegister,
} from "../../services/auth";
import type { User } from "../../types/auth";

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<boolean>;
	register: (name: string, email: string, password: string) => Promise<boolean>;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useLocalStorage<User | null>("auth_user", null);
	const [tokens, setTokens] = useLocalStorage<{
		accessToken: string;
		refreshToken: string;
		expiresAt: string;
	} | null>("auth_tokens", null);
	const [isLoading, setIsLoading] = useState(false);

	const login = useCallback(
		async (email: string, password: string): Promise<boolean> => {
			setIsLoading(true);
			try {
				const result = await apiLogin({ email, password });
				if (result.success && result.data.user && result.data.tokens) {
					setUser(result.data.user);
					setTokens(result.data.tokens);
					return true;
				}
				return false;
			} catch {
				return false;
			} finally {
				setIsLoading(false);
			}
		},
		[setUser, setTokens],
	);

	const register = useCallback(
		async (name: string, email: string, password: string): Promise<boolean> => {
			setIsLoading(true);
			try {
				const result = await apiRegister({ name, email, password });
				if (result.success && result.data.user && result.data.tokens) {
					setUser(result.data.user);
					setTokens(result.data.tokens);
					return true;
				}
				return false;
			} catch {
				return false;
			} finally {
				setIsLoading(false);
			}
		},
		[setUser, setTokens],
	);

	const logout = useCallback(() => {
		setUser(null);
		setTokens(null);
	}, [setUser, setTokens]);

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user && !!tokens,
				isLoading,
				login,
				register,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
