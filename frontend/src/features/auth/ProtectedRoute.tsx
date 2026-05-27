import { type ReactNode, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";

type AuthModalType = "login" | "register" | null;

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({
	children,
	featureName = "this feature",
}: ProtectedRouteProps & { featureName?: string }) {
	const { isAuthenticated } = useAuth();
	const [modalType, setModalType] = useState<AuthModalType>(null);

	if (isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div className="protected-route">
			<div className="protected-message">
				<h3>Authentication Required</h3>
				<p>You need to login to access {featureName}.</p>
				<div className="protected-actions">
					<button
						type="button"
						className="btn-primary"
						onClick={() => setModalType("login")}
					>
						Login
					</button>
					<button
						type="button"
						className="btn-secondary"
						onClick={() => setModalType("register")}
					>
						Register
					</button>
				</div>
			</div>

			<LoginModal
				isOpen={modalType === "login"}
				onClose={() => setModalType(null)}
				onSwitchToRegister={() => setModalType("register")}
			/>
			<RegisterModal
				isOpen={modalType === "register"}
				onClose={() => setModalType(null)}
				onSwitchToLogin={() => setModalType("login")}
			/>
		</div>
	);
}
