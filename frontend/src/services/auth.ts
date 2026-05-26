import type {
	AuthResponse,
	AuthTokens,
	LoginCredentials,
	RegisterCredentials,
	User,
} from "../types/auth";
import type { ApiResponse } from "../types/api";
import { apiGet, apiPost } from "./api";

interface BackendAuthResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

interface BackendUserResponse {
	id: number;
	email: string;
	name: string;
}

function tokensFromBackend(bt: BackendAuthResponse): AuthTokens {
	return {
		accessToken: bt.access_token,
		refreshToken: bt.refresh_token,
		expiresAt: new Date(Date.now() + bt.expires_in * 1000).toISOString(),
	};
}

function userFromBackend(bu: BackendUserResponse): User {
	return {
		id: bu.id,
		email: bu.email,
		name: bu.name,
	};
}

function getRefreshToken(): string | null {
	try {
		const raw = localStorage.getItem("auth_tokens");
		if (!raw) return null;
		const tokens = JSON.parse(raw);
		return tokens.refreshToken ?? null;
	} catch {
		return null;
	}
}

export async function login(
	credentials: LoginCredentials,
): Promise<ApiResponse<AuthResponse>> {
	const result = await apiPost<BackendAuthResponse>(
		"/auth/login",
		credentials,
	);
	if (!result.success) {
		return { success: false, data: null as unknown as AuthResponse, error: result.error };
	}

	const tokens = tokensFromBackend(result.data);

	localStorage.setItem("auth_tokens", JSON.stringify(tokens));

	const userResult = await apiGet<BackendUserResponse>("/auth/me", {
		requiresAuth: true,
	});
	if (!userResult.success) {
		localStorage.removeItem("auth_tokens");
		return { success: false, data: null as unknown as AuthResponse, error: userResult.error };
	}

	const user = userFromBackend(userResult.data);
	return { success: true, data: { user, tokens } };
}

export async function register(
	credentials: RegisterCredentials,
): Promise<ApiResponse<AuthResponse>> {
	const result = await apiPost<BackendAuthResponse>(
		"/auth/register",
		credentials,
	);
	if (!result.success) {
		return { success: false, data: null as unknown as AuthResponse, error: result.error };
	}

	const tokens = tokensFromBackend(result.data);

	localStorage.setItem("auth_tokens", JSON.stringify(tokens));

	const userResult = await apiGet<BackendUserResponse>("/auth/me", {
		requiresAuth: true,
	});
	if (!userResult.success) {
		localStorage.removeItem("auth_tokens");
		return { success: false, data: null as unknown as AuthResponse, error: userResult.error };
	}

	const user = userFromBackend(userResult.data);
	return { success: true, data: { user, tokens } };
}

export async function logout(): Promise<ApiResponse<void>> {
	const refreshToken = getRefreshToken();
	return apiPost<void>("/auth/logout", {
		refresh_token: refreshToken,
	});
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
	const result = await apiGet<BackendUserResponse>("/auth/me", {
		requiresAuth: true,
	});
	if (!result.success) {
		return { success: false, data: null as unknown as User, error: result.error };
	}
	return { success: true, data: userFromBackend(result.data) };
}

export async function refreshToken(): Promise<ApiResponse<AuthResponse>> {
	const refreshToken = getRefreshToken();
	const result = await apiPost<BackendAuthResponse>("/auth/refresh", {
		refresh_token: refreshToken,
	});
	if (!result.success) {
		return { success: false, data: null as unknown as AuthResponse, error: result.error };
	}

	const tokens = tokensFromBackend(result.data);

	localStorage.setItem("auth_tokens", JSON.stringify(tokens));

	const userResult = await apiGet<BackendUserResponse>("/auth/me", {
		requiresAuth: true,
	});
	if (!userResult.success) {
		localStorage.removeItem("auth_tokens");
		return { success: false, data: null as unknown as AuthResponse, error: userResult.error };
	}

	const user = userFromBackend(userResult.data);
	return { success: true, data: { user, tokens } };
}
