import { useState } from "react";
import "./styles/FilterBar.css";

export interface FilterValues {
	year?: string;
	local?: string;
}

interface FilterBarProps {
	onFilterChange?: (filters: FilterValues) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
	const [year, setYear] = useState("");
	const [local, setLocal] = useState("");

	function handleApply() {
		const filters: FilterValues = {};
		if (year.trim()) filters.year = year.trim();
		if (local.trim()) filters.local = local.trim();
		onFilterChange?.(filters);
	}

	function handleReset() {
		setYear("");
		setLocal("");
		onFilterChange?.({});
	}

	return (
		<div className="filter-bar">
			<div className="filter-bar-fields">
				<div className="form-group-inline">
					<label htmlFor="filter-year">Year</label>
					<input
						id="filter-year"
						type="number"
						placeholder="e.g. 2023"
						value={year}
						onChange={(e) => setYear(e.target.value)}
						min={2001}
						max={2030}
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
