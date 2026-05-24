import { TimeFilter } from "../../components/timeFilter/TimeFilter.tsx";
import { MapView } from "../map/MapView";

export function DisastersTab() {
	return (
		<div className="tab-content">
			<TimeFilter />
			<MapView />
		</div>
	);
}
