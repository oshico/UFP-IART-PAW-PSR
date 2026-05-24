import { type ReactNode, useEffect } from "react";
import "./styles/Modal.css";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
	useEffect(() => {
		function handleEscape(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: dosent need onkeydown
		<div className="modal-backdrop" onClick={onClose}>
			<div
				className="modal-content"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={() => {}}
				role="dialog"
				aria-modal="true"
			>
				<div className="modal-header">
					<h2>{title}</h2>
					<button
						type="button"
						className="modal-close"
						onClick={onClose}
						aria-label="Close modal"
					>
						×
					</button>
				</div>
				<div className="modal-body">{children}</div>
			</div>
		</div>
	);
}
