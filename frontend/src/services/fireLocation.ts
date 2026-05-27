import type { ApiResponse } from "../types/api";
import { apiGet } from "./api";

export interface FireLocation {
	local: string;
	lat: number;
	long: number;
	date: string;
	hour: number;
}

export async function getFireLocations(params?: {
	startDate?: string;
	endDate?: string;
	local?: string;
}): Promise<ApiResponse<FireLocation[]>> {
	const qs = new URLSearchParams();
	if (params?.startDate) qs.set("startDate", params.startDate);
	if (params?.endDate) qs.set("endDate", params.endDate);
	if (params?.local) qs.set("local", params.local);
	const query = qs.toString();
	return apiGet<FireLocation[]>(`/locations/fires${query ? `?${query}` : ""}`);
}
