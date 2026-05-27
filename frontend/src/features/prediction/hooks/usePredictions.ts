import { useCallback, useState } from "react";
import type {
	FirePrediction,
	RainPrediction,
} from "../../../services/predictions";
import {
	getFirePredictions,
	getRainPredictions,
} from "../../../services/predictions";

export function useFirePredictions() {
	const [predictions, setPredictions] = useState<FirePrediction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [meta, setMeta] = useState<{
		model_name: string;
		model_version: string;
		generated_at: string;
	} | null>(null);

	const fetch = useCallback(
		async (params?: { district?: string; months?: number }) => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await getFirePredictions(params);
				setPredictions(res.predictions);
				setMeta({
					model_name: res.model_name,
					model_version: res.model_version,
					generated_at: res.generated_at,
				});
			} catch (e) {
				setError(
					e instanceof Error ? e.message : "Failed to fetch fire predictions",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	return { predictions, isLoading, error, meta, fetch };
}

export function useRainPredictions() {
	const [predictions, setPredictions] = useState<RainPrediction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [meta, setMeta] = useState<{
		model_name: string;
		model_version: string;
		generated_at: string;
	} | null>(null);

	const fetch = useCallback(
		async (params?: { city?: string; years?: number }) => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await getRainPredictions(params);
				setPredictions(res.predictions);
				setMeta({
					model_name: res.model_name,
					model_version: res.model_version,
					generated_at: res.generated_at,
				});
			} catch (e) {
				setError(
					e instanceof Error ? e.message : "Failed to fetch rain predictions",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	return { predictions, isLoading, error, meta, fetch };
}
