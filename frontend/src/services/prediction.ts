import type {
	PaginatedResponse,
	PaginationParams,
	PredictionParams,
	PredictionResult,
} from "../types/api";
import { apiGet, apiPost } from "./api";

export async function getPredictions(
	params: PredictionParams & PaginationParams,
) {
	const qs = new URLSearchParams({
		event_type: params.eventType,
		region: params.region,
		start_date: params.startDate,
		end_date: params.endDate,
	});

	if (params.historicalMonths) {
		qs.set("historical_months", String(params.historicalMonths));
	}
	if (params.page) qs.set("page", String(params.page));
	if (params.limit) qs.set("limit", String(params.limit));

	return apiGet<PaginatedResponse<PredictionResult>>(
		`/predictions?${qs.toString()}`,
		{ requiresAuth: true },
	);
}

export async function createPrediction(params: PredictionParams) {
	return apiPost<PredictionResult>("/predictions", params, {
		requiresAuth: true,
	});
}

export async function getPredictionById(id: string) {
	return apiGet<PredictionResult>(`/predictions/${id}`, {
		requiresAuth: true,
	});
}
