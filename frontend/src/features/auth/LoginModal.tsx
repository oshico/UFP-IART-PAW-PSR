import { type FormEvent, useState } from "react";
import { Modal } from "../../components/modal/Modal.tsx";
import { useAuth } from "./hooks/useAuth";
import "./LoginModal.css";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToRegister: () => void;
}

export function LoginModal({
	isOpen,
	onClose,
	onSwitchToRegister,
}: LoginModalProps) {
	const { login, isLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");

		const success = await login(email, password);
		if (success) {
			setEmail("");
			setPassword("");
			onClose();
		} else {
			setError("Login failed. Backend not available yet.");
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Login">
			<form onSubmit={handleSubmit} className="auth-form">
				{error && <div className="auth-error">{error}</div>}

				<div className="form-group">
					<label htmlFor="login-email">Email</label>
					<input
						id="login-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						placeholder="your@email.com"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="login-password">Password</label>
					<input
						id="login-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						placeholder="••••••••"
					/>
				</div>

				<button type="submit" className="auth-submit" disabled={isLoading}>
					{isLoading ? "Logging in..." : "Login"}
				</button>

				<p className="auth-switch">
					Don't have an account?{" "}
					<button
						type="button"
						className="auth-link"
						onClick={onSwitchToRegister}
					>
						Register
					</button>
				</p>
			</form>
		</Modal>
	);
}
