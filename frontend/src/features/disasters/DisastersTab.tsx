import { FilterBar } from "../../components/filterBar/FilterBar";
import { MapView } from "../map/MapView";

export function DisastersTab() {
	return (
		<div className="tab-content">
			<FilterBar />
			<MapView />
		</div>
	);
}
