export type EventSeverity = "low" | "medium" | "high" | "critical";
export type EventStatus = "active" | "contained" | "resolved" | "monitoring";
export type EventType = "fire" | "disaster" | "rescue" | "accident";

export interface GeoPoint {
	latitude: number;
	longitude: number;
}

export interface BaseEvent {
	id: string;
	type: EventType;
	severity: EventSeverity;
	status: EventStatus;
	title: string;
	description: string;
	location: GeoPoint;
	address?: string;
	municipality: string;
	district: string;
	occurredAt: string;
	reportedAt: string;
	updatedAt: string;
}

export interface FireEvent extends BaseEvent {
	type: "fire";
	areaAffected?: number;
	areaUnit?: "m2" | "ha";
	fireType?: "vegetation" | "urban" | "industrial";
	resourcesDeployed?: number;
}

export interface DisasterEvent extends BaseEvent {
	type: "disaster";
	disasterType?: "flood" | "landslide" | "storm" | "earthquake" | "drought";
	areaAffected?: number;
	casualties?: number;
	displaced?: number;
}

export interface RescueEvent extends BaseEvent {
	type: "rescue";
	rescueType?: "water" | "mountain" | "confined_space" | "structural";
	peopleRescued?: number;
	teamsInvolved?: number;
}

export interface AccidentEvent extends BaseEvent {
	type: "accident";
	accidentType?: "vehicle" | "industrial" | "domestic" | "other";
	casualties?: number;
	injuries?: number;
	vehiclesInvolved?: number;
}

export type TerraWatchEvent =
	| FireEvent
	| DisasterEvent
	| RescueEvent
	| AccidentEvent;
