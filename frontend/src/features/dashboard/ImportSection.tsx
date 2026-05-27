import { useEffect, useRef, useState } from "react";
import {
	getImportStatus,
	type ImportTask,
	uploadFiresFile,
	uploadRainsFile,
} from "../../services/import";
import "./ImportSection.css";

function ImportBox({
	label,
	accept,
	uploading,
	task,
	onUpload,
	onFileChange,
	file,
}: {
	label: string;
	accept: string;
	uploading: boolean;
	task: ImportTask | null;
	onUpload: () => void;
	onFileChange: (file: File | null) => void;
	file: File | null;
}) {
	const [dragging, setDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setDragging(false);
		const f = e.dataTransfer.files[0];
		if (f) onFileChange(f);
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		setDragging(true);
	}

	function handleDragLeave() {
		setDragging(false);
	}

	const statusLabel =
		task?.status === "done"
			? `Done — ${task.imported} imported, ${task.errors} errors`
			: task?.status === "error"
				? `Error — ${task.error}`
				: task?.status === "processing"
					? "Processing..."
					: task?.status === "pending"
						? "Queued..."
						: null;

	return (
		<div className="dash-import-card">
			<h4 className="dash-import-label">{label}</h4>

			<label
				className={`dash-import-dropzone ${dragging ? "dragging" : ""}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<input
					ref={inputRef}
					type="file"
					accept={accept}
					hidden
					onChange={(e) => {
						const f = e.target.files?.[0];
						if (f) onFileChange(f);
						e.target.value = "";
					}}
				/>
				{file ? (
					<span className="dash-import-filename">{file.name}</span>
				) : (
					<>
						<svg
							className="dash-import-icon"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-label="Upload"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						<span className="dash-import-hint">
							Drop .xlsx here or click to browse
						</span>
					</>
				)}
			</label>

			<button
				type="button"
				className="dash-import-btn"
				disabled={!file || uploading}
				onClick={onUpload}
			>
				{uploading ? "Importing..." : "Import"}
			</button>

			{task && statusLabel && (
				<div
					className={`dash-import-status ${
						task.status === "error" ? "status-error" : ""
					}`}
				>
					{statusLabel}
				</div>
			)}
		</div>
	);
}

export function ImportSection() {
	const [fireFile, setFireFile] = useState<File | null>(null);
	const [rainFile, setRainFile] = useState<File | null>(null);
	const [fireUploading, setFireUploading] = useState(false);
	const [rainUploading, setRainUploading] = useState(false);
	const [fireTask, setFireTask] = useState<ImportTask | null>(null);
	const [rainTask, setRainTask] = useState<ImportTask | null>(null);

	useEffect(() => {
		if (!fireTask) return;
		if (fireTask.status === "done" || fireTask.status === "error") return;
		const id = setInterval(async () => {
			const res = await getImportStatus(fireTask.id);
			if (res.success) setFireTask(res.data);
		}, 2000);
		return () => clearInterval(id);
	}, [fireTask]);

	useEffect(() => {
		if (!rainTask) return;
		if (rainTask.status === "done" || rainTask.status === "error") return;
		const id = setInterval(async () => {
			const res = await getImportStatus(rainTask.id);
			if (res.success) setRainTask(res.data);
		}, 2000);
		return () => clearInterval(id);
	}, [rainTask]);

	async function handleFireUpload() {
		if (!fireFile) return;
		setFireUploading(true);
		const res = await uploadFiresFile(fireFile);
		setFireUploading(false);
		if (res.success) {
			setFireTask({
				id: res.data.task_id,
				status: "pending",
				imported: 0,
				errors: 0,
				created_at: new Date().toISOString(),
			});
		}
		setFireFile(null);
	}

	async function handleRainUpload() {
		if (!rainFile) return;
		setRainUploading(true);
		const res = await uploadRainsFile(rainFile);
		setRainUploading(false);
		if (res.success) {
			setRainTask({
				id: res.data.task_id,
				status: "pending",
				imported: 0,
				errors: 0,
				created_at: new Date().toISOString(),
			});
		}
		setRainFile(null);
	}

	return (
		<div className="dash-import-section">
			<h3 className="dash-import-heading">Import Data</h3>
			<div className="dash-import-grid">
				<ImportBox
					label="Fire Data"
					accept=".xlsx"
					uploading={fireUploading}
					task={fireTask}
					file={fireFile}
					onUpload={handleFireUpload}
					onFileChange={setFireFile}
				/>
				<ImportBox
					label="Rain Data"
					accept=".xlsx"
					uploading={rainUploading}
					task={rainTask}
					file={rainFile}
					onUpload={handleRainUpload}
					onFileChange={setRainFile}
				/>
			</div>
		</div>
	);
}
