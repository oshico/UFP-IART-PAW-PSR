import { useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth.ts";
import { LoginModal } from "../../features/auth/LoginModal.tsx";
import { RegisterModal } from "../../features/auth/RegisterModal.tsx";
import type { EventType } from "../../types/events.ts";
import { APP_NAME } from "../../utils/constants.ts";
import "./styles/Navbar.css";

type TabType = EventType | "prediction";

const TABS: { key: TabType; label: string }[] = [
	{ key: "fire", label: "Fires" },
	{ key: "disaster", label: "Disasters" },
	{ key: "rescue", label: "Rescues" },
	{ key: "accident", label: "Accidents" },
	{ key: "prediction", label: "Predictions" },
];

interface NavbarProps {
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
	const { user, isAuthenticated, logout } = useAuth();
	const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

	return (
		<>
			<nav className="navbar">
				<div className="navbar-brand">{APP_NAME}</div>

				<div className="navbar-tabs">
					{TABS.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							className={`navbar-tab ${activeTab === key ? "active" : ""}`}
							onClick={() => onTabChange(key)}
						>
							{label}
						</button>
					))}
				</div>

				<div className="navbar-auth">
					{isAuthenticated && user ? (
						<div className="navbar-user">
							<span className="navbar-username">{user.name}</span>
							<button type="button" className="navbar-logout" onClick={logout}>
								Logout
							</button>
						</div>
					) : (
						<button
							type="button"
							className="navbar-login"
							onClick={() => setAuthModal("login")}
						>
							Login
						</button>
					)}
				</div>
			</nav>

			<LoginModal
				isOpen={authModal === "login"}
				onClose={() => setAuthModal(null)}
				onSwitchToRegister={() => setAuthModal("register")}
			/>
			<RegisterModal
				isOpen={authModal === "register"}
				onClose={() => setAuthModal(null)}
				onSwitchToLogin={() => setAuthModal("login")}
			/>
		</>
	);
}
