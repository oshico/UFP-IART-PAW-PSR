export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface DateRangeFilter {
	startDate?: string;
	endDate?: string;
}

export interface EventFilterParams extends PaginationParams, DateRangeFilter {
	type?: string;
	severity?: string;
	status?: string;
	district?: string;
	municipality?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
	message?: string;
}

export interface PredictionParams {
	eventType: string;
	region: string;
	startDate: string;
	endDate: string;
	historicalMonths?: number;
}

export interface PredictionResult {
	id: string;
	eventType: string;
	region: string;
	probability: number;
	riskLevel: "low" | "medium" | "high" | "critical";
	predictedDate: string;
	confidence: number;
	factors: string[];
	recommendation: string;
	createdAt: string;
}
