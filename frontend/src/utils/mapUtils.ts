import L from "leaflet";
import type { GeoPoint } from "../types/events";
import { EVENT_MARKERS, SEVERITY_COLORS } from "./constants";

export function createCustomMarker(type: string, severity: string): L.DivIcon {
	const markerStyle =
		EVENT_MARKERS[type as keyof typeof EVENT_MARKERS] || EVENT_MARKERS.fire;
	const color =
		SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] ||
		markerStyle.color;

	return L.divIcon({
		className: "custom-marker",
		html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    ">${markerStyle.icon}</div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
		popupAnchor: [0, -12],
	});
}

export function createPopupContent(
	title: string,
	description: string,
	status: string,
): string {
	return `
    <div class="marker-popup">
      <h3>${title}</h3>
      <p>${description}</p>
      <span class="status-badge status-${status}">${status}</span>
    </div>
  `;
}

export function isValidCoordinate(point: GeoPoint): boolean {
	return (
		typeof point.latitude === "number" &&
		typeof point.longitude === "number" &&
		!Number.isNaN(point.latitude) &&
		!Number.isNaN(point.longitude)
	);
}

export function isWithinPortugal(point: GeoPoint): boolean {
	return (
		point.latitude >= 36.96 &&
		point.latitude <= 42.15 &&
		point.longitude >= -9.5 &&
		point.longitude <= -6.19
	);
}
