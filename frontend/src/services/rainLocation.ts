import type { ApiResponse } from "../types/api";
import { apiGet } from "./api";

export interface RainLocation {
	city: string;
	lat: number;
	long: number;
	precipitation_mm: number | null;
	year: number;
}

export async function getRainLocations(
	params?: { year?: string; city?: string },
): Promise<ApiResponse<RainLocation[]>> {
	const qs = new URLSearchParams();
	if (params?.year) qs.set("year", params.year);
	if (params?.city) qs.set("city", params.city);
	const query = qs.toString();
	return apiGet<RainLocation[]>(`/locations/rains${query ? `?${query}` : ""}`);
}
