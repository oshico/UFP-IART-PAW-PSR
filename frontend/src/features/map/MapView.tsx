import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
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

function createIcon(type?: string) {
	return divIcon({
		className: "",
		html:
			type === "rain"
				? '<div class="marker-circle marker-rain">🌧️</div>'
				: '<div class="marker-circle marker-fire">🔥</div>',
		iconSize: [32, 32],
		iconAnchor: [16, 16],
		popupAnchor: [0, -20],
	});
}

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
					<Marker
						key={i}
						position={[m.lat, m.lng]}
						icon={createIcon(m.type)}
					>
						<Popup>
							<strong>{m.title}</strong>
							{m.description && <br />}
							{m.description}
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
}
