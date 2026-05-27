import { useEffect, useState } from "react";
import {
  type DashboardFilters,
  type LookupItem,
  type StatItem,
  getAlertSources,
  getCauseDescriptions,
  getCauseGroups,
  getFiresByDistrict,
  getFiresByMonth,
  getFiresByCauseGroup,
  getFiresByYear,
} from "../../services/dashboard";
import "./DashboardTab.css";

function BarChart({
  data,
  title,
  disableScroll = false,
}: {
  data: StatItem[];
  title: string;
  disableScroll?: boolean;
}) {
  if (!data.length) return <p className="dash-empty">No data</p>;
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="dash-chart">
      <h3>{title}</h3>
      <div
        className={`dash-bars ${disableScroll ? "dash-bars-no-scroll" : ""}`}
      >
        {data.map((item) => (
          <div key={item.label} className="dash-bar-row">
            <span className="dash-bar-label">{item.label || "Unknown"}</span>
            <div className="dash-bar-track">
              <div
                className="dash-bar-fill"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="dash-bar-count">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardTab() {
  const [filters, setFilters] = useState<DashboardFilters>({});

  // lookup data for dropdowns
  const [causeGroups, setCauseGroups] = useState<LookupItem[]>([]);
  const [causeDescs, setCauseDescs] = useState<LookupItem[]>([]);
  const [alertSources, setAlertSources] = useState<LookupItem[]>([]);

  // chart data
  const [byDistrict, setByDistrict] = useState<StatItem[]>([]);
  const [byYear, setByYear] = useState<StatItem[]>([]);
  const [byMonth, setByMonth] = useState<StatItem[]>([]);
  const [byCause, setByCause] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // load dropdowns once
  useEffect(() => {
    getCauseGroups().then((r) => {
      if (r.success) setCauseGroups(r.data);
    });
    getCauseDescriptions().then((r) => {
      if (r.success) setCauseDescs(r.data);
    });
    getAlertSources().then((r) => {
      if (r.success) setAlertSources(r.data);
    });
  }, []);

  // reload charts when filters change
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getFiresByDistrict(filters),
      getFiresByYear(filters),
      getFiresByMonth(filters),
      getFiresByCauseGroup(filters),
    ]).then(([district, yearly, monthly, cause]) => {
      if (district.success) setByDistrict(district.data);
      if (yearly.success) setByYear(yearly.data);
      if (monthly.success) setByMonth(monthly.data);
      if (cause.success) setByCause(cause.data);
      setLoading(false);
    });
  }, [filters]);

  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const byMonthNamed = byMonth.map((d) => ({
    ...d,
    label: MONTH_NAMES[parseInt(d.label) - 1] ?? d.label,
  }));

  function set(key: keyof DashboardFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h2>Fires Dashboard</h2>
      </div>

      <div className="dash-filters">
        <div className="dash-filter-group">
          <label htmlFor="year-select">Year</label>
          <select
            id="year-select"
            value={filters.year ?? ""}
            onChange={(e) => set("year", e.target.value)}
          >
            <option value="">All years</option>
            {Array.from({ length: 25 }, (_, i) => 2001 + i).map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-filter-group">
          <label htmlFor="cause-group-select">Cause Group</label>
          <select
            id="cause-group-select"
            value={filters.causeGroup ?? ""}
            onChange={(e) => set("causeGroup", e.target.value)}
          >
            <option value="">All</option>
            {causeGroups.map((g) => (
              <option key={g.ID} value={String(g.ID)}>
                {g.Description}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-filter-group">
          <label htmlFor="cause-description-select">Cause Description</label>
          <select
            id="cause-description-select"
            value={filters.causeDescription ?? ""}
            onChange={(e) => set("causeDescription", e.target.value)}
          >
            <option value="">All</option>
            {causeDescs.map((d) => (
              <option key={d.ID} value={String(d.ID)}>
                {d.Description}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-filter-group">
          <label htmlFor="alert-source-select">Alert Source</label>
          <select
            id="alert-source-select"
            value={filters.alertSource ?? ""}
            onChange={(e) => set("alertSource", e.target.value)}
          >
            <option value="">All</option>
            {alertSources.map((a) => (
              <option
                style={{ color: "white" }}
                key={a.ID}
                value={String(a.ID)}
              >
                {a.Description}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="dash-clear"
          onClick={() => setFilters({})}
        >
          Clear filters
        </button>
      </div>

      {loading ? (
        <p className="dash-loading">Loading...</p>
      ) : (
        <div className="dash-grid">
          <BarChart data={byDistrict} title="Fires by District" />
          <BarChart data={byMonthNamed} title="Fires by Month" disableScroll />
          <BarChart data={byCause} title="Fires by Cause Group" />
          <BarChart data={byYear} title="Fires by Year" />
        </div>
      )}
    </div>
  );
}
