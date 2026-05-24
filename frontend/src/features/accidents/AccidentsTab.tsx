import { TimeFilter } from "../../components/timeFilter/TimeFilter.tsx";
import { MapView } from "../map/MapView";

export function AccidentsTab() {
	return (
		<div className="tab-content">
			<TimeFilter />
			<MapView />
		</div>
	);
}
