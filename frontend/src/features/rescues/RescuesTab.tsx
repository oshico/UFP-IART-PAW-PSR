import { FilterBar } from "../../components/filterBar/FilterBar";
import { MapView } from "../map/MapView";

export function RescuesTab() {
	return (
		<div className="tab-content">
			<FilterBar />
			<MapView />
		</div>
	);
}
