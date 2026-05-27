import { useState } from "react";
import { Navbar } from "./components/navbar/Navbar.tsx";
import { AccidentsTab } from "./features/accidents/AccidentsTab";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { DashboardTab } from "./features/dashboard/DashboardTab";
import { DisastersTab } from "./features/disasters/DisastersTab";
import { FiresTab } from "./features/fires/FiresTab";
import { PredictionsTab } from "./features/prediction/PredictionsTab";
import { RainTab } from "./features/rain/RainTab";
import { RescuesTab } from "./features/rescues/RescuesTab";
import type { EventType } from "./types/events";
import "./App.css";

type TabType = EventType | "prediction" | "rain" | "dashboard";

function App() {
	const [activeTab, setActiveTab] = useState<TabType>("fire");

	return (
		<AuthProvider>
			<div className="app">
				<Navbar activeTab={activeTab} onTabChange={setActiveTab} />
				<main className="app-main">
					{activeTab === "fire" && <FiresTab />}
					{activeTab === "disaster" && <DisastersTab />}
					{activeTab === "rescue" && <RescuesTab />}
					{activeTab === "accident" && <AccidentsTab />}
					{activeTab === "rain" && <RainTab />}
					{activeTab === "dashboard" && (
						<ProtectedRoute featureName="the dashboard">
							<DashboardTab />
						</ProtectedRoute>
					)}
					{activeTab === "prediction" && (
						<ProtectedRoute>
							<PredictionsTab />
						</ProtectedRoute>
					)}
				</main>
			</div>
		</AuthProvider>
	);
}

export default App;
