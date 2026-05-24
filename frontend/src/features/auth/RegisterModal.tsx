import { type FormEvent, useState } from "react";
import { Modal } from "../../components/modal/Modal.tsx";
import { useAuth } from "./hooks/useAuth";
import "./RegisterModal.css";

interface RegisterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToLogin: () => void;
}

export function RegisterModal({
	isOpen,
	onClose,
	onSwitchToLogin,
}: RegisterModalProps) {
	const { register, isLoading } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");

		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}

		const success = await register(name, email, password);
		if (success) {
			setName("");
			setEmail("");
			setPassword("");
			onClose();
		} else {
			setError("Registration failed. Backend not available yet.");
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Register">
			<form onSubmit={handleSubmit} className="auth-form">
				{error && <div className="auth-error">{error}</div>}

				<div className="form-group">
					<label htmlFor="register-name">Name</label>
					<input
						id="register-name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						placeholder="Your name"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="register-email">Email</label>
					<input
						id="register-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						placeholder="your@email.com"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="register-password">Password</label>
					<input
						id="register-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						placeholder="At least 6 characters"
					/>
				</div>

				<button type="submit" className="auth-submit" disabled={isLoading}>
					{isLoading ? "Creating account..." : "Register"}
				</button>

				<p className="auth-switch">
					Already have an account?{" "}
					<button type="button" className="auth-link" onClick={onSwitchToLogin}>
						Login
					</button>
				</p>
			</form>
		</Modal>
	);
}
