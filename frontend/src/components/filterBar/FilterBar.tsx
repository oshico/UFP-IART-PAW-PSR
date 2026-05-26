import { useState } from "react";
import "./styles/FilterBar.css";

export interface FilterValues {
	startDate?: string;
	endDate?: string;
	local?: string;
}

interface FilterBarProps {
	onFilterChange?: (filters: FilterValues) => void;
	defaultValues?: FilterValues;
}

export function FilterBar({ onFilterChange, defaultValues }: FilterBarProps) {
	const [startDate, setStartDate] = useState(defaultValues?.startDate ?? "");
	const [endDate, setEndDate] = useState(defaultValues?.endDate ?? "");
	const [local, setLocal] = useState(defaultValues?.local ?? "");

	function handleApply() {
		const filters: FilterValues = {};
		if (startDate.trim()) filters.startDate = startDate.trim();
		if (endDate.trim()) filters.endDate = endDate.trim();
		if (local.trim()) filters.local = local.trim();
		onFilterChange?.(filters);
	}

	function handleReset() {
		const defaults = defaultValues ?? {};
		setStartDate(defaults.startDate ?? "");
		setEndDate(defaults.endDate ?? "");
		setLocal(defaults.local ?? "");
		onFilterChange?.(defaults);
	}

	return (
		<div className="filter-bar">
			<div className="filter-bar-fields">
				<div className="form-group-inline">
					<label htmlFor="filter-start">From</label>
					<input
						id="filter-start"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div className="form-group-inline">
					<label htmlFor="filter-end">To</label>
					<input
						id="filter-end"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
				<div className="form-group-inline">
					<label htmlFor="filter-local">Local</label>
					<input
						id="filter-local"
						type="text"
						placeholder="Location name"
						value={local}
						onChange={(e) => setLocal(e.target.value)}
					/>
				</div>
				<button type="button" className="btn-apply" onClick={handleApply}>
					Apply
				</button>
				<button type="button" className="btn-reset" onClick={handleReset}>
					Reset
				</button>
			</div>
		</div>
	);
}
