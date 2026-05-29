import { useEffect, useMemo, useState } from "react";
import { trainFires, trainRains } from "../../services/predictions";
import { DISTRICTS } from "../../utils/constants";
import { useAuth } from "../auth/hooks/useAuth";
import { type MapMarker, MapView } from "../map/MapView";
import { useFirePredictions, useRainPredictions } from "./hooks/usePredictions";
import "./PredictionsTab.css";

const CITIES = [
	"Viana do Castelo",
	"Bragança",
	"Porto",
	"Castelo Branco",
	"Lisboa",
	"Beja",
	"Faro",
	"Funchal",
	"Angra do Heroísmo",
];

type PredictionType = "fire" | "rain";

export function PredictionsTab() {
	const { isAuthenticated } = useAuth();
	const [predictionType, setPredictionType] = useState<PredictionType>("fire");
	const [selectedDistrict, setSelectedDistrict] = useState("");
	const [selectedCity, setSelectedCity] = useState("");
	const [months, setMonths] = useState(12);
	const [years, setYears] = useState(5);
	const [trainingStatus, setTrainingStatus] = useState<string | null>(null);
	const [filterYear, setFilterYear] = useState("");
	const [filterMonth, setFilterMonth] = useState("");

	const fire = useFirePredictions();
	const rain = useRainPredictions();

	const isLoading = fire.isLoading || rain.isLoading;
	const error = fire.error || rain.error;
	const meta = predictionType === "fire" ? fire.meta : rain.meta;

	const allPredictions =
		predictionType === "fire" ? fire.predictions : rain.predictions;

	const availableYears = useMemo(() => {
		const years = new Set(allPredictions.map((p) => p.date.slice(0, 4)));
		return [...years].sort().reverse();
	}, [allPredictions]);

	const availableMonths = useMemo(() => {
		if (!filterYear) return [];
		const months = new Set(
			allPredictions
				.filter((p) => p.date.startsWith(filterYear))
				.map((p) => p.date.slice(5, 7)),
		);
		return [...months]
			.map((m) => ({
				value: m,
				label: new Date(0, Number(m) - 1).toLocaleString("default", {
					month: "long",
				}),
			}))
			.sort((a, b) => Number(a.value) - Number(b.value));
	}, [allPredictions, filterYear]);

	const predictions = useMemo(() => {
		let filtered = allPredictions;
		if (filterYear)
			filtered = filtered.filter((p) => p.date.startsWith(filterYear));
		if (filterMonth && predictionType === "fire")
			filtered = filtered.filter((p) => p.date.slice(5, 7) === filterMonth);
		return filtered;
	}, [allPredictions, filterYear, filterMonth, predictionType]);

	useEffect(() => {
		if (predictionType !== "fire") setFilterMonth("");
	}, [predictionType]);

	const handlePredict = () => {
		if (predictionType === "fire") {
			fire.fetch({
				district: selectedDistrict || undefined,
				months,
			});
		} else {
			rain.fetch({
				city: selectedCity || undefined,
				years,
			});
		}
	};

	const handleTrain = async () => {
		setTrainingStatus("Training...");
		try {
			if (predictionType === "fire") {
				const res = await trainFires();
				setTrainingStatus(
					`Trained ${res.regions_trained.length} districts (v${res.model_version})`,
				);
			} else {
				const res = await trainRains();
				setTrainingStatus(
					`Trained ${res.regions_trained.length} cities (v${res.model_version})`,
				);
			}
		} catch (e) {
			setTrainingStatus(e instanceof Error ? e.message : "Training failed");
		}
		setTimeout(() => setTrainingStatus(null), 5000);
	};

	const markers: MapMarker[] = predictions.map((p) => {
		if (predictionType === "fire") {
			const fp = p as (typeof fire.predictions)[number];
			return {
				lat: fp.lat ?? 39.5,
				lng: fp.long ?? -8.0,
				title: fp.district,
				description: `${fp.predicted_count} fires predicted (${fp.confidence_lower}–${fp.confidence_upper}) on ${fp.date}`,
				type: "fire" as const,
			};
		}
		const rp = p as (typeof rain.predictions)[number];
		return {
			lat: rp.lat ?? 39.5,
			lng: rp.long ?? -8.0,
			title: rp.city,
			description: `${rp.predicted_precipitation_mm} mm predicted (${rp.confidence_lower}–${rp.confidence_upper}) for ${rp.date}`,
			type: "rain" as const,
		};
	});

	return (
		<div className="tab-content tab-predictions">
			<div className="prediction-controls">
				<div className="prediction-type-switcher">
					<button
						type="button"
						className={predictionType === "fire" ? "active" : ""}
						onClick={() => setPredictionType("fire")}
					>
						Fire Predictions
					</button>
					<button
						type="button"
						className={predictionType === "rain" ? "active" : ""}
						onClick={() => setPredictionType("rain")}
					>
						Rain Predictions
					</button>
				</div>

				<div className="prediction-filters">
					{predictionType === "fire" ? (
						<select
							value={selectedDistrict}
							onChange={(e) => setSelectedDistrict(e.target.value)}
						>
							<option value="">All Districts</option>
							{DISTRICTS.map((d) => (
								<option key={d} value={d}>
									{d}
								</option>
							))}
						</select>
					) : (
						<select
							value={selectedCity}
							onChange={(e) => setSelectedCity(e.target.value)}
						>
							<option value="">All Cities</option>
							{CITIES.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					)}

					{predictionType === "fire" ? (
						<label>
							Months: {months}
							<input
								type="range"
								min={1}
								max={60}
								value={months}
								onChange={(e) => setMonths(Number(e.target.value))}
							/>
						</label>
					) : (
						<label>
							Years: {years}
							<input
								type="range"
								min={1}
								max={20}
								value={years}
								onChange={(e) => setYears(Number(e.target.value))}
							/>
						</label>
					)}

					{availableYears.length > 0 && (
						<select
							value={filterYear}
							onChange={(e) => {
								setFilterYear(e.target.value);
								setFilterMonth("");
							}}
						>
							<option value="">All Years</option>
							{availableYears.map((y) => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>
					)}

					{predictionType === "fire" &&
						filterYear &&
						availableMonths.length > 0 && (
							<select
								value={filterMonth}
								onChange={(e) => setFilterMonth(e.target.value)}
							>
								<option value="">All Months</option>
								{availableMonths.map((m) => (
									<option key={m.value} value={m.value}>
										{m.label}
									</option>
								))}
							</select>
						)}

					<button type="button" onClick={handlePredict}>
						Get Predictions
					</button>

					{isAuthenticated && (
						<button type="button" className="btn-train" onClick={handleTrain}>
							Train Models
						</button>
					)}
				</div>

				{trainingStatus && (
					<div className="training-status">{trainingStatus}</div>
				)}

				{meta && (
					<div className="prediction-meta">
						Model: {meta.model_name} (v{meta.model_version}) — Generated:{" "}
						{new Date(meta.generated_at).toLocaleString()}
					</div>
				)}
			</div>

			{error && <div className="error-banner">{error}</div>}

			{!predictions.length && !isLoading && !error && (
				<div className="predictions-placeholder">
					<h3>Predictions</h3>
					<p>Select parameters and click "Get Predictions" to see results.</p>
				</div>
			)}

			{(predictions.length > 0 || isLoading) && (
				<div className="prediction-map-wrapper">
					<MapView isLoading={isLoading} markers={markers} height="500px" />
				</div>
			)}

			{predictions.length > 0 && (
				<div className="predictions-table-container">
					<table className="predictions-table">
						<thead>
							<tr>
								<th>{predictionType === "fire" ? "District" : "City"}</th>
								<th>Date</th>
								<th>Predicted Value</th>
								<th>Confidence Interval</th>
							</tr>
						</thead>
						<tbody>
							{predictions.map((p) => (
								<tr
									key={`${predictionType}-${p.date}-${predictionType === "fire" ? (p as (typeof fire.predictions)[number]).district : (p as (typeof rain.predictions)[number]).city}`}
								>
									{predictionType === "fire" ? (
										<>
											<td>
												{(p as (typeof fire.predictions)[number]).district}
											</td>
											<td>{p.date}</td>
											<td>
												{(
													p as (typeof fire.predictions)[number]
												).predicted_count.toFixed(1)}{" "}
												fires
											</td>
											<td>
												{(
													p as (typeof fire.predictions)[number]
												).confidence_lower.toFixed(1)}{" "}
												–{" "}
												{(
													p as (typeof fire.predictions)[number]
												).confidence_upper.toFixed(1)}
											</td>
										</>
									) : (
										<>
											<td>{(p as (typeof rain.predictions)[number]).city}</td>
											<td>{p.date}</td>
											<td>
												{(
													p as (typeof rain.predictions)[number]
												).predicted_precipitation_mm.toFixed(1)}{" "}
												mm
											</td>
											<td>
												{(
													p as (typeof rain.predictions)[number]
												).confidence_lower.toFixed(1)}{" "}
												–{" "}
												{(
													p as (typeof rain.predictions)[number]
												).confidence_upper.toFixed(1)}
											</td>
										</>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
