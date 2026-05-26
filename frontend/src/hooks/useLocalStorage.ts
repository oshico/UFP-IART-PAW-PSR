import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | null = null) {
	const [storedValue, setStoredValue] = useState<T | null>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch {
			return initialValue;
		}
	});

	const setValue = useCallback(
		(value: T | null) => {
			try {
				setStoredValue(value);
				if (value === null) {
					window.localStorage.removeItem(key);
				} else {
					window.localStorage.setItem(key, JSON.stringify(value));
				}
			} catch (error) {
				console.error("Error saving to localStorage:", error);
			}
		},
		[key],
	);

	return [storedValue, setValue] as const;
}
