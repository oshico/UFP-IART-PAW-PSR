import { useState } from "react";
import {
	FilterBar,
	type FilterValues,
} from "../../components/filterBar/FilterBar";
import { type MapMarker, MapView } from "../map/MapView";
import { useRainData } from "./hooks/useRainData";

const DEFAULT_FILTERS: FilterValues = {
	startDate: "2025-01-01",
	endDate: "2025-12-31",
};

export function RainTab() {
	const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
	const { locations, isLoading, error } = useRainData(filters);

	const markers: MapMarker[] = locations.map((loc) => ({
		lat: loc.lat,
		lng: loc.long,
		title: loc.city,
		description:
			loc.precipitation_mm != null
				? `${loc.precipitation_mm.toFixed(1)} mm`
				: "No data",
		type: "rain" as const,
	}));

	return (
		<div className="tab-content">
			<FilterBar onFilterChange={setFilters} defaultValues={DEFAULT_FILTERS} />
			{error && <div className="error-banner">{error}</div>}
			<MapView isLoading={isLoading} markers={markers} />
		</div>
	);
}
