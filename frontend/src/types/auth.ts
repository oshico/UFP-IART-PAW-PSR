export interface User {
	id: string;
	email: string;
	name: string;
	createdAt: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	email: string;
	password: string;
	name: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresAt: string;
}

export interface AuthResponse {
	user: User;
	tokens: AuthTokens;
}

export interface AuthState {
	user: User | null;
	tokens: AuthTokens | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}
