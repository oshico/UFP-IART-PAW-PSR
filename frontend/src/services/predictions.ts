import { ML_API_BASE_URL } from "../utils/constants";

export interface FirePrediction {
	district: string;
	lat: number | null;
	long: number | null;
	date: string;
	predicted_count: number;
	confidence_lower: number;
	confidence_upper: number;
}

export interface RainPrediction {
	city: string;
	lat: number | null;
	long: number | null;
	date: string;
	predicted_precipitation_mm: number;
	confidence_lower: number;
	confidence_upper: number;
}

export interface FirePredictionsResponse {
	predictions: FirePrediction[];
	model_name: string;
	model_version: string;
	generated_at: string;
}

export interface RainPredictionsResponse {
	predictions: RainPrediction[];
	model_name: string;
	model_version: string;
	generated_at: string;
}

export interface TrainResponse {
	status: string;
	model_type: string;
	regions_trained: string[];
	model_version: string;
}

async function mlFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const url = `${ML_API_BASE_URL}${endpoint}`;
	const res = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(
			body?.detail || `ML API error: ${res.status} ${res.statusText}`,
		);
	}

	return res.json();
}

export async function getFirePredictions(params?: {
	district?: string;
	months?: number;
}): Promise<FirePredictionsResponse> {
	const qs = new URLSearchParams();
	if (params?.district) qs.set("district", params.district);
	if (params?.months != null) qs.set("months", String(params.months));
	const query = qs.toString();
	return mlFetch<FirePredictionsResponse>(
		`/predictions/fires${query ? `?${query}` : ""}`,
	);
}

export async function getRainPredictions(params?: {
	city?: string;
	years?: number;
}): Promise<RainPredictionsResponse> {
	const qs = new URLSearchParams();
	if (params?.city) qs.set("city", params.city);
	if (params?.years != null) qs.set("years", String(params.years));
	const query = qs.toString();
	return mlFetch<RainPredictionsResponse>(
		`/predictions/rains${query ? `?${query}` : ""}`,
	);
}

export async function trainFires(): Promise<TrainResponse> {
	return mlFetch<TrainResponse>("/train/fires", { method: "POST" });
}

export async function trainRains(): Promise<TrainResponse> {
	return mlFetch<TrainResponse>("/train/rains", { method: "POST" });
}
