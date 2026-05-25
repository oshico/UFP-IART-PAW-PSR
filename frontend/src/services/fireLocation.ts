import type { ApiResponse } from "../types/api";
import { apiGet } from "./api";

export interface FireLocation {
	local: string;
	lat: number;
	long: number;
	date: string;
	hour: number;
}

export async function getFireLocations(
	params?: { year?: string; local?: string },
): Promise<ApiResponse<FireLocation[]>> {
	const qs = new URLSearchParams();
	if (params?.year) qs.set("year", params.year);
	if (params?.local) qs.set("local", params.local);
	const query = qs.toString();
	return apiGet<FireLocation[]>(`/locations/fires${query ? `?${query}` : ""}`);
}
