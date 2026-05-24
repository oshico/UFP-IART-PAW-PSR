import { TimeFilter } from "../../components/timeFilter/TimeFilter.tsx";
import { MapView } from "../map/MapView";

export function RescuesTab() {
	return (
		<div className="tab-content">
			<TimeFilter />
			<MapView />
		</div>
	);
}
