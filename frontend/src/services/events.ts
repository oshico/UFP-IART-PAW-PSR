import type { EventFilterParams, PaginatedResponse } from "../types/api";
import type {
	AccidentEvent,
	DisasterEvent,
	FireEvent,
	RescueEvent,
	TerraWatchEvent,
} from "../types/events";
import { apiGet } from "./api";

function buildQueryString(params: EventFilterParams): string {
	const query = new URLSearchParams();
	if (params.page) query.set("page", String(params.page));
	if (params.limit) query.set("limit", String(params.limit));
	if (params.startDate) query.set("start_date", params.startDate);
	if (params.endDate) query.set("end_date", params.endDate);
	if (params.severity) query.set("severity", params.severity);
	if (params.status) query.set("status", params.status);
	if (params.district) query.set("district", params.district);
	if (params.municipality) query.set("municipality", params.municipality);
	return query.toString();
}

export async function getEvents(params: EventFilterParams = {}) {
	const qs = buildQueryString(params);
	return apiGet<PaginatedResponse<TerraWatchEvent>>(`/events?${qs}`);
}

export async function getFires(params: EventFilterParams = {}) {
	const qs = buildQueryString(params);
	return apiGet<PaginatedResponse<FireEvent>>(`/events/fires?${qs}`);
}

export async function getDisasters(params: EventFilterParams = {}) {
	const qs = buildQueryString(params);
	return apiGet<PaginatedResponse<DisasterEvent>>(`/events/disasters?${qs}`);
}

export async function getRescues(params: EventFilterParams = {}) {
	const qs = buildQueryString(params);
	return apiGet<PaginatedResponse<RescueEvent>>(`/events/rescues?${qs}`);
}

export async function getAccidents(params: EventFilterParams = {}) {
	const qs = buildQueryString(params);
	return apiGet<PaginatedResponse<AccidentEvent>>(`/events/accidents?${qs}`);
}
