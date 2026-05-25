import { useState } from "react";
import {
	FilterBar,
	type FilterValues,
} from "../../components/filterBar/FilterBar";
import { MapView, type MapMarker } from "../map/MapView";
import { useFiresData } from "./hooks/useFiresData";

export function FiresTab() {
	const [filters, setFilters] = useState<FilterValues>({ year: "2025" });
	const { locations, isLoading, error } = useFiresData(filters);

	const markers: MapMarker[] = locations.map((loc) => ({
		lat: loc.lat,
		lng: loc.long,
		title: loc.local,
		description: loc.date ? `${loc.date} às ${loc.hour}h` : undefined,
	}));

	return (
		<div className="tab-content">
			<FilterBar onFilterChange={setFilters} defaultValues={{ year: "2025" }} />
			{error && <div className="error-banner">{error}</div>}
			<MapView isLoading={isLoading} markers={markers} />
		</div>
	);
}
