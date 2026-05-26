import { useState } from "react";
import { getDateRange } from "../../utils/dateUtils.ts";
import "./styles/TimeFilter.css";

interface TimeFilterProps {
	onFilterChange?: (range: { startDate: string; endDate: string }) => void;
}

const QUICK_RANGES = [
	{ label: "7 days", days: 7 },
	{ label: "30 days", days: 30 },
	{ label: "90 days", days: 90 },
	{ label: "1 year", days: 365 },
];

export function TimeFilter({ onFilterChange }: TimeFilterProps) {
	const defaultRange = getDateRange(30);
	const [startDate, setStartDate] = useState(defaultRange.startDate);
	const [endDate, setEndDate] = useState(defaultRange.endDate);

	function applyQuickRange(days: number) {
		const range = getDateRange(days);
		setStartDate(range.startDate);
		setEndDate(range.endDate);
		onFilterChange?.(range);
	}

	function handleApply() {
		onFilterChange?.({ startDate, endDate });
	}

	function handleReset() {
		const range = getDateRange(30);
		setStartDate(range.startDate);
		setEndDate(range.endDate);
		onFilterChange?.(range);
	}

	return (
		<div className="time-filter">
			<div className="time-filter-dates">
				<div className="form-group-inline">
					<label htmlFor="start-date">From</label>
					<input
						id="start-date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div className="form-group-inline">
					<label htmlFor="end-date">To</label>
					<input
						id="end-date"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
				<button type="button" className="btn-apply" onClick={handleApply}>
					Apply
				</button>
				<button type="button" className="btn-reset" onClick={handleReset}>
					Reset
				</button>
			</div>

			<div className="time-filter-quick">
				{QUICK_RANGES.map(({ label, days }) => (
					<button
						key={label}
						type="button"
						className="btn-quick"
						onClick={() => applyQuickRange(days)}
					>
						{label}
					</button>
				))}
			</div>
		</div>
	);
}
