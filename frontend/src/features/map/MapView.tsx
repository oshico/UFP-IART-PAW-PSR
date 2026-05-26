import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { LoadingSpinner } from "../../components/loadingSpinner/LoadingSpinner.tsx";
import { DEFAULT_ZOOM, PORTUGAL_CENTER } from "../../utils/constants";
import "./MapView.css";

export interface MapMarker {
	lat: number;
	lng: number;
	title: string;
	description?: string;
	type?: "fire" | "rain";
}

interface MapViewProps {
	isLoading?: boolean;
	height?: string;
	markers?: MapMarker[];
}

const MARKER_STYLES = {
	fire: { color: "#ef4444", fillColor: "#ef4444" },
	rain: { color: "#3b82f6", fillColor: "#3b82f6" },
} as const;

export function MapView({
	isLoading = false,
	height = "600px",
	markers = [],
}: MapViewProps) {
	return (
		<div className="map-container" style={{ height }}>
			{isLoading && <LoadingSpinner />}

			<MapContainer
				center={PORTUGAL_CENTER}
				zoom={DEFAULT_ZOOM}
				className="map"
				scrollWheelZoom
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{markers.map((m, i) => (
					<CircleMarker
						key={i}
						center={[m.lat, m.lng]}
						radius={8}
						pathOptions={{
							...MARKER_STYLES[m.type ?? "fire"],
							fillOpacity: 0.9,
							weight: 2,
							opacity: 1,
						}}
					>
						<Popup>
							<strong>{m.title}</strong>
							{m.description && <br />}
							{m.description}
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</div>
	);
}
