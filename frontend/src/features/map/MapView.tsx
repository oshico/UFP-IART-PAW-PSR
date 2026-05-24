import { MapContainer, TileLayer } from "react-leaflet";
import { LoadingSpinner } from "../../components/loadingSpinner/LoadingSpinner.tsx";
import { DEFAULT_ZOOM, PORTUGAL_CENTER } from "../../utils/constants";
import "./MapView.css";

interface MapViewProps {
	isLoading?: boolean;
	height?: string;
}

export function MapView({ isLoading = false, height = "600px" }: MapViewProps) {
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
			</MapContainer>
		</div>
	);
}
