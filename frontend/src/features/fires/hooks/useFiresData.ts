import { useEffect, useState } from "react";
import type { FilterValues } from "../../../components/filterBar/FilterBar";
import type { FireLocation } from "../../../services/fireLocation";
import { getFireLocations } from "../../../services/fireLocation";

interface UseFiresDataResult {
	locations: FireLocation[];
	isLoading: boolean;
	error: string | null;
}

export function useFiresData(filters?: FilterValues): UseFiresDataResult {
	const [locations, setLocations] = useState<FireLocation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetch() {
			setIsLoading(true);
			setError(null);

			const hasFilters =
				filters?.startDate || filters?.endDate || filters?.local;
			const result = await getFireLocations(
				hasFilters
					? {
							startDate: filters?.startDate,
							endDate: filters?.endDate,
							local: filters?.local,
						}
					: undefined,
			);
			if (cancelled) return;

			if (result.success) {
				setLocations(result.data);
			} else {
				setError(result.error ?? "Failed to load fire locations");
			}
			setIsLoading(false);
		}

		fetch();

		return () => {
			cancelled = true;
		};
	}, [filters?.startDate, filters?.endDate, filters?.local]);

	return { locations, isLoading, error };
}
