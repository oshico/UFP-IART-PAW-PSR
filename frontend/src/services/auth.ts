import type {
	AuthResponse,
	LoginCredentials,
	RegisterCredentials,
	User,
} from "../types/auth";
import { apiDelete, apiGet, apiPost } from "./api";

export async function login(credentials: LoginCredentials) {
	return apiPost<AuthResponse>("/auth/login", credentials);
}

export async function register(credentials: RegisterCredentials) {
	return apiPost<AuthResponse>("/auth/register", credentials);
}

export async function logout() {
	return apiDelete<void>("/auth/logout", { requiresAuth: true });
}

export async function getCurrentUser() {
	return apiGet<User>("/auth/me", { requiresAuth: true });
}

export async function refreshToken() {
	return apiPost<AuthResponse>("/auth/refresh", {});
}
