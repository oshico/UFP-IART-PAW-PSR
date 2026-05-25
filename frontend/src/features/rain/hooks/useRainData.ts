import { useEffect, useState } from "react";
import type { FilterValues } from "../../../components/filterBar/FilterBar";
import type { RainLocation } from "../../../services/rainLocation";
import { getRainLocations } from "../../../services/rainLocation";

interface UseRainDataResult {
	locations: RainLocation[];
	isLoading: boolean;
	error: string | null;
}

export function useRainData(filters?: FilterValues): UseRainDataResult {
	const [locations, setLocations] = useState<RainLocation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetch() {
			setIsLoading(true);
			setError(null);

			const hasFilters = filters?.year || filters?.local;
			const result = await getRainLocations(
				hasFilters ? { year: filters?.year, city: filters?.local } : undefined,
			);
			if (cancelled) return;

			if (result.success) {
				setLocations(result.data);
			} else {
				setError(result.error ?? "Failed to load rain data");
			}
			setIsLoading(false);
		}

		fetch();

		return () => {
			cancelled = true;
		};
	}, [filters?.year, filters?.local]);

	return { locations, isLoading, error };
}
