import type { ApiResponse } from "../types/api";
import { apiGet } from "./api";

export interface StatItem {
  label: string;
  count: number;
}

export interface LookupItem {
  ID: number;
  Description: string;
}

export interface DashboardFilters {
  year?: string;
  causeGroup?: string;
  causeDescription?: string;
  alertSource?: string;
}

function buildQs(filters: DashboardFilters): string {
  const qs = new URLSearchParams();
  if (filters.year)             qs.set("year", filters.year);
  if (filters.causeGroup)       qs.set("causeGroup", filters.causeGroup);
  if (filters.causeDescription) qs.set("causeDescription", filters.causeDescription);
  if (filters.alertSource)      qs.set("alertSource", filters.alertSource);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function getFiresByDistrict(f: DashboardFilters = {}): Promise<ApiResponse<StatItem[]>> {
  return apiGet<StatItem[]>(`/stats/fires/by-district${buildQs(f)}`);
}

export async function getFiresByYear(f: DashboardFilters = {}): Promise<ApiResponse<StatItem[]>> {
  return apiGet<StatItem[]>(`/stats/fires/by-year${buildQs(f)}`);
}

export async function getFiresByMonth(f: DashboardFilters = {}): Promise<ApiResponse<StatItem[]>> {
  return apiGet<StatItem[]>(`/stats/fires/by-month${buildQs(f)}`);
}

export async function getFiresByCauseGroup(f: DashboardFilters = {}): Promise<ApiResponse<StatItem[]>> {
  return apiGet<StatItem[]>(`/stats/fires/by-cause-group${buildQs(f)}`);
}

export async function getCauseGroups(): Promise<ApiResponse<LookupItem[]>> {
  return apiGet<LookupItem[]>("/meta/cause-groups");
}

export async function getCauseDescriptions(): Promise<ApiResponse<LookupItem[]>> {
  return apiGet<LookupItem[]>("/meta/cause-descriptions");
}

export async function getAlertSources(): Promise<ApiResponse<LookupItem[]>> {
  return apiGet<LookupItem[]>("/meta/alert-sources");
}