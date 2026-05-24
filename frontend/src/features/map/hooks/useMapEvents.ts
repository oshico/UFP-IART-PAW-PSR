import { useRef } from "react";
import { useMap } from "react-leaflet";
import type { TerraWatchEvent } from "../../types/events";

interface UseMapEventsOptions {
	events?: TerraWatchEvent[];
	onMarkerClick?: (event: TerraWatchEvent) => void;
}

export function useMapEvents({
	events = [],
	onMarkerClick,
}: UseMapEventsOptions) {
	const map = useMap();
	const eventsRef = useRef(events);
	const onClickRef = useRef(onMarkerClick);

	eventsRef.current = events;
	onClickRef.current = onMarkerClick;

	return { map };
}
