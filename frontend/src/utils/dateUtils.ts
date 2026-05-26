export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("pt-PT", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function formatDateTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("pt-PT", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "Agora mesmo";
	if (diffMins < 60) return `há ${diffMins}min`;
	if (diffHours < 24) return `há ${diffHours}h`;
	return `há ${diffDays}d`;
}

export function toISOString(date: Date): string {
	return date.toISOString();
}

export function getDateRange(days: number): {
	startDate: string;
	endDate: string;
} {
	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);
	return {
		startDate: startDate.toISOString().split("T")[0],
		endDate: endDate.toISOString().split("T")[0],
	};
}
