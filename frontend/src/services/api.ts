import type { ApiResponse } from "../types/api";
import { API_BASE_URL } from "../utils/constants";

interface FetchOptions extends RequestInit {
	requiresAuth?: boolean;
}

async function getAccessToken(): Promise<string | null> {
	try {
		const tokens = localStorage.getItem("auth_tokens");
		if (!tokens) return null;
		const parsed = JSON.parse(tokens);
		return parsed.accessToken || null;
	} catch {
		return null;
	}
}

export async function apiFetch<T>(
	endpoint: string,
	options: FetchOptions = {},
): Promise<ApiResponse<T>> {
	const { requiresAuth = false, ...fetchOptions } = options;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((fetchOptions.headers as Record<string, string>) || {}),
	};

	if (requiresAuth) {
		const token = await getAccessToken();
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...fetchOptions,
		headers,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		return {
			success: false,
			data: null as unknown as T,
			error:
				errorData?.error || errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
		};
	}

	const data = await response.json();
	return {
		success: true,
		data: data.data ?? data,
	};
}

export async function apiGet<T>(
	endpoint: string,
	options?: FetchOptions,
): Promise<ApiResponse<T>> {
	return apiFetch<T>(endpoint, { ...options, method: "GET" });
}

export async function apiPost<T>(
	endpoint: string,
	body: unknown,
	options?: FetchOptions,
): Promise<ApiResponse<T>> {
	return apiFetch<T>(endpoint, {
		...options,
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function apiDelete<T>(
	endpoint: string,
	options?: FetchOptions,
): Promise<ApiResponse<T>> {
	return apiFetch<T>(endpoint, { ...options, method: "DELETE" });
}
