export const APP_NAME = "TerraWatch";

export const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const ML_API_BASE_URL =
	import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

export const PORTUGAL_BOUNDS = {
	north: 42.15,
	south: 36.96,
	west: -9.5,
	east: -6.19,
};

export const PORTUGAL_CENTER: [number, number] = [39.5, -8.0];
export const DEFAULT_ZOOM = 7;

export const EVENT_MARKERS = {
	fire: { color: "#ef4444", icon: "🔥" },
	disaster: { color: "#f59e0b", icon: "⚠️" },
	rescue: { color: "#3b82f6", icon: "🚁" },
	accident: { color: "#8b5cf6", icon: "💥" },
};

export const SEVERITY_COLORS = {
	low: "#22c55e",
	medium: "#f59e0b",
	high: "#f97316",
	critical: "#ef4444",
};

export const STATUS_COLORS = {
	active: "#ef4444",
	contained: "#f59e0b",
	resolved: "#22c55e",
	monitoring: "#3b82f6",
};

export const DISTRICTS = [
	"Aveiro",
	"Beja",
	"Braga",
	"Bragança",
	"Castelo Branco",
	"Coimbra",
	"Évora",
	"Faro",
	"Guarda",
	"Leiria",
	"Lisboa",
	"Portalegre",
	"Porto",
	"Santarém",
	"Setúbal",
	"Viana do Castelo",
	"Vila Real",
	"Viseu",
];
