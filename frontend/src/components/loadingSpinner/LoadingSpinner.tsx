import "./styles/LoadingSpinner.css";

export function LoadingSpinner() {
	return (
		<div className="loading-spinner" role="status" aria-label="Loading">
			<div className="spinner" />
			<span>Loading...</span>
		</div>
	);
}
