import type { ApiResponse } from "../types/api";
import { apiGet, apiUpload } from "./api";

export interface ImportTask {
	id: string;
	status: "pending" | "processing" | "done" | "error";
	imported: number;
	errors: number;
	error?: string;
	created_at: string;
}

export async function uploadFiresFile(
	file: File,
): Promise<ApiResponse<{ task_id: string }>> {
	const formData = new FormData();
	formData.append("file", file);
	return apiUpload<{ task_id: string }>("/import/fires", formData, {
		requiresAuth: true,
	});
}

export async function uploadRainsFile(
	file: File,
): Promise<ApiResponse<{ task_id: string }>> {
	const formData = new FormData();
	formData.append("file", file);
	return apiUpload<{ task_id: string }>("/import/rains", formData, {
		requiresAuth: true,
	});
}

export async function getImportStatus(
	taskId: string,
): Promise<ApiResponse<ImportTask>> {
	return apiGet<ImportTask>(`/import/status/${taskId}`, {
		requiresAuth: true,
	});
}
