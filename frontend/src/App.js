import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Zap,
  Activity,
  Box,
  Truck,
  IndianRupee,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Percent
} from "lucide-react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8001";
const PAGE_SIZE = 11;

// Quick Simulation Presets
const PRESETS = [
  {
    name: "🚨 Stress Test",
    data: {
      item_category: "Structure",
      supplier_risk_class: "High",
      region: "North",
      order_quantity: 950,
      unit_cost: 320,
      order_value: 304000,
      promised_lead_time: 7,
      historical_avg_delay: 6.2,
      historical_late_rate: 0.88,
      defect_rate: 0.065,
      order_month: 11,
      order_dayofweek: 5,
    }
  },
  {
    name: "⚡ Avionics Rush",
    data: {
      item_category: "Avionics",
      supplier_risk_class: "Medium",
      region: "East",
      order_quantity: 180,
      unit_cost: 650,
      order_value: 117000,
      promised_lead_time: 14,
      historical_avg_delay: 2.8,
      historical_late_rate: 0.42,
      defect_rate: 0.021,
      order_month: 7,
      order_dayofweek: 2,
    }
  },
  {
    name: "✅ Safe Baseline",
    data: {
      item_category: "Fasteners",
      supplier_risk_class: "Low",
      region: "South",
      order_quantity: 2500,
      unit_cost: 8,
      order_value: 20000,
      promised_lead_time: 30,
      historical_avg_delay: 0.3,
      historical_late_rate: 0.05,
      defect_rate: 0.004,
      order_month: 4,
      order_dayofweek: 1,
    }
  }
];

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vortex_theme") || "dark";
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAscending, setSortAscending] = useState(false);

  // Live Simulator Form State
  const [formData, setFormData] = useState({
    item_category: "Structure",
    supplier_risk_class: "High",
    region: "North",
    order_quantity: 450,
    unit_cost: 200,
    order_value: 90000,
    promised_lead_time: 12,
    historical_avg_delay: 3.8,
    historical_late_rate: 0.76,
    defect_rate: 0.042,
    order_month: 9,
    order_dayofweek: 4,
  });

  const [simulating, setSimulating] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("vortex_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${API_BASE}/orders`);
      setOrders(res.data);
      if (res.data.length > 0) {
        setSelectedOrder(res.data[0]);
      }
    } catch (err) {
      console.error("Orders fetching failed:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setSimulating(true);
    try {
      const res = await axios.post(`${API_BASE}/predict`, formData);
      setPredictionResult(res.data);
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  const applyPreset = (preset) => {
    setFormData(preset.data);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRisk, searchTerm, sortAscending]);

  const filteredOrders = useMemo(() => {
    const list = orders.filter((o) => {
      const rowCat = String(o.risk_category || "").trim().toLowerCase();
      const targetFilter = filterRisk.toLowerCase();

      const matchesRisk = filterRisk === "ALL" || rowCat === targetFilter;

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        String(o.order_id || "").toLowerCase().includes(q) ||
        String(o.supplier_id || "").toLowerCase().includes(q) ||
        String(o.item_category || "").toLowerCase().includes(q);

      return matchesRisk && matchesSearch;
    });

    return list.sort((a, b) => {
      const scoreA = Number(a.risk_score || 0);
      const scoreB = Number(b.risk_score || 0);
      return sortAscending ? scoreA - scoreB : scoreB - scoreA;
    });
  }, [orders, filterRisk, searchTerm, sortAscending]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const totalCount = orders.length;
  const highRisk = useMemo(() => orders.filter((o) => String(o.risk_category || "").toLowerCase() === "high").length, [orders]);
  const medRisk = useMemo(() => orders.filter((o) => String(o.risk_category || "").toLowerCase() === "medium").length, [orders]);
  const lowRisk = useMemo(() => orders.filter((o) => String(o.risk_category || "").toLowerCase() === "low").length, [orders]);

  const highPct = totalCount ? ((highRisk / totalCount) * 100).toFixed(1) : "0";
  const medPct = totalCount ? ((medRisk / totalCount) * 100).toFixed(1) : "0";
  const lowPct = totalCount ? ((lowRisk / totalCount) * 100).toFixed(1) : "0";

  // Selected Order Gauge parameters
  const selectedScore = Number(selectedOrder?.risk_score || 0);
  const selectedPct = (selectedScore * 100).toFixed(2);
  const gaugeRadius = 36;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeDashoffset = gaugeCircumference - (selectedScore * gaugeCircumference);

  const getRiskColor = (cat) => {
    const c = String(cat || "").toLowerCase();
    if (c === "high") return "var(--risk-high)";
    if (c === "medium") return "var(--risk-medium)";
    return "var(--risk-low)";
  };

  return (
    <div className="app-container">
      {/* Dynamic Ambient Glow Orbs */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />

      {/* Top Navigation */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="brand-mark">
            <Zap size={22} />
          </div>
          <div>
            <div className="brand-title">
              VORTEX
            </div>
            <p className="brand-subtitle">Autonomous Supply Chain Delay Risk Intelligence</p>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title="Switch Dashboard Theme"
          >
            {theme === "dark" ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
            <span>{theme === "dark" ? "Obsidian Aurora" : "Executive Luxe"}</span>
          </button>

          <button
            className="theme-toggle-btn"
            onClick={fetchOrders}
            disabled={loadingOrders}
            title="Reload Orders"
          >
            <RefreshCw size={14} className={loadingOrders ? "spin-icon" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* KPI Banner */}
        <section className="kpi-grid">
          {/* Total Monitored */}
          <div className="kpi-card" style={{ "--kpi-accent": "var(--accent-blue)", "--kpi-icon-bg": "rgba(59, 130, 246, 0.12)" }}>
            <div className="kpi-top">
              <span className="kpi-label">TOTAL MONITORED</span>
              <div className="kpi-icon-wrap">
                <Activity size={18} />
              </div>
            </div>
            <div className="kpi-value-row">
              <div className="kpi-value">{totalCount.toLocaleString()}</div>
              <span className="kpi-pill">100% active</span>
            </div>
            <div className="kpi-desc">
              <span>Active purchase orders tracked across all tiers</span>
            </div>
          </div>

          {/* High Risk */}
          <div className="kpi-card" style={{ "--kpi-accent": "var(--risk-high)", "--kpi-icon-bg": "var(--risk-high-bg)" }}>
            <div className="kpi-top">
              <span className="kpi-label" style={{ color: "var(--risk-high)" }}>HIGH RISK POs</span>
              <div className="kpi-icon-wrap">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="kpi-value-row">
              <div className="kpi-value" style={{ color: "var(--risk-high)" }}>{highRisk.toLocaleString()}</div>
              <span className="kpi-pill" style={{ background: "var(--risk-high-bg)", color: "var(--risk-high)" }}>
                {highPct}% of total
              </span>
            </div>
            <div className="kpi-desc">
              <span>Urgent delay mitigation required immediately</span>
            </div>
          </div>

          {/* Medium Risk */}
          <div className="kpi-card" style={{ "--kpi-accent": "var(--risk-medium)", "--kpi-icon-bg": "var(--risk-medium-bg)" }}>
            <div className="kpi-top">
              <span className="kpi-label" style={{ color: "var(--risk-medium)" }}>MEDIUM WATCHLIST</span>
              <div className="kpi-icon-wrap">
                <Clock size={18} />
              </div>
            </div>
            <div className="kpi-value-row">
              <div className="kpi-value" style={{ color: "var(--risk-medium)" }}>{medRisk.toLocaleString()}</div>
              <span className="kpi-pill" style={{ background: "var(--risk-medium-bg)", color: "var(--risk-medium)" }}>
                {medPct}% of total
              </span>
            </div>
            <div className="kpi-desc">
              <span>Lead-time buffer compressed; monitoring tightly</span>
            </div>
          </div>

          {/* Low Risk */}
          <div className="kpi-card" style={{ "--kpi-accent": "var(--risk-low)", "--kpi-icon-bg": "var(--risk-low-bg)" }}>
            <div className="kpi-top">
              <span className="kpi-label" style={{ color: "var(--risk-low)" }}>ON-TRACK (NOMINAL)</span>
              <div className="kpi-icon-wrap">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="kpi-value-row">
              <div className="kpi-value" style={{ color: "var(--risk-low)" }}>{lowRisk.toLocaleString()}</div>
              <span className="kpi-pill" style={{ background: "var(--risk-low-bg)", color: "var(--risk-low)" }}>
                {lowPct}% of total
              </span>
            </div>
            <div className="kpi-desc">
              <span>Reliable supplier delivery schedule margin</span>
            </div>
          </div>
        </section>

        {/* Core Layout Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Orders Registry */}
          <div className="panel-card">
            <div className="panel-header-row">
              <div className="panel-title">
                <Sliders size={18} color="var(--accent-indigo)" />
                <span>ACTIVE PURCHASE ORDERS REGISTRY</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                {filteredOrders.length} matching POs
              </span>
            </div>

            {/* Toolbar */}
            <div className="toolbar-container">
              <div className="search-and-sort">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    className="search-input"
                    placeholder="Search by PO number, Supplier ID, or Item Category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  className="filter-btn"
                  onClick={() => setSortAscending(!sortAscending)}
                  title="Toggle Risk Score Sort Order"
                  style={{ minWidth: "120px", justifyContent: "center" }}
                >
                  <TrendingUp size={14} />
                  <span>{sortAscending ? "Risk: Asc ↑" : "Risk: Desc ↓"}</span>
                </button>
              </div>

              <div className="filter-pills">
                {[
                  { label: "All Orders", key: "ALL", count: totalCount },
                  { label: "High Risk", key: "High", count: highRisk },
                  { label: "Medium", key: "Medium", count: medRisk },
                  { label: "Low (Safe)", key: "Low", count: lowRisk }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilterRisk(item.key)}
                    className={`filter-btn ${filterRisk === item.key ? "active" : ""}`}
                  >
                    <span>{item.label}</span>
                    <span style={{
                      fontSize: "11px",
                      opacity: 0.85,
                      padding: "1px 6px",
                      borderRadius: "999px",
                      background: filterRisk === item.key ? "rgba(255,255,255,0.2)" : "var(--bg-surface-hover)"
                    }}>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: "70px" }}>RANK</th>
                    <th>ORDER ID</th>
                    <th>SUPPLIER</th>
                    <th>CATEGORY</th>
                    <th style={{ width: "160px" }}>DELAY RISK</th>
                    <th style={{ width: "110px", textAlign: "right" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((item, idx) => {
                    const isSelected = selectedOrder?.order_id === item.order_id;
                    const pct = (Number(item.risk_score || 0) * 100).toFixed(2);
                    const cat = String(item.risk_category || "Low").toLowerCase();

                    return (
                      <tr
                        key={item.order_id || idx}
                        onClick={() => setSelectedOrder(item)}
                        className={isSelected ? "selected-row" : ""}
                      >
                        <td>
                          <span className="rank-badge">
                            #{item.risk_rank || (currentPage - 1) * PAGE_SIZE + idx + 1}
                          </span>
                        </td>
                        <td className="primary-cell">
                          {item.order_id}
                        </td>
                        <td>
                          <span className="supplier-chip">{item.supplier_id}</span>
                        </td>
                        <td>{item.item_category}</td>
                        <td>
                          <div className="score-cell">
                            <div className="score-bar-bg">
                              <div
                                className="score-bar-fill"
                                style={{
                                  width: `${pct}%`,
                                  background: cat === "high"
                                    ? "linear-gradient(90deg, #f43f5e, #e11d48)"
                                    : cat === "medium"
                                    ? "linear-gradient(90deg, #fbbf24, #d97706)"
                                    : "linear-gradient(90deg, #34d399, #10b981)"
                                }}
                              />
                            </div>
                            <span className="score-text" style={{ color: getRiskColor(cat) }}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`status-pill ${cat}`}>
                            <span className="status-pill-dot" />
                            {item.risk_category}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        No purchase orders match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar">
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} orders
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", minWidth: "85px", textAlign: "center" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Intel Directory & Sandbox */}
          <div className="right-column">
            {/* Selected Order Intel */}
            <div className="panel-card intel-card">
              <div className="panel-header-row" style={{ marginBottom: "14px" }}>
                <div className="panel-title">
                  <Layers size={18} color="var(--accent-cyan)" />
                  <span>ORDER INTEL DIRECTORY</span>
                </div>
                {selectedOrder && (
                  <span className={`status-pill ${String(selectedOrder.risk_category).toLowerCase()}`}>
                    <span className="status-pill-dot" />
                    {selectedOrder.risk_category} RISK
                  </span>
                )}
              </div>

              {selectedOrder ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.5px" }}>
                        Selected Purchase Order
                      </div>
                      <div className="intel-order-id">{selectedOrder.order_id}</div>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                      Cat: <strong style={{ color: "var(--text-primary)" }}>{selectedOrder.item_category}</strong>
                    </span>
                  </div>

                  {/* Visual Radial Gauge for Delay Likelihood */}
                  <div className="intel-gauge-box">
                    <svg width="86" height="86" className="gauge-svg" viewBox="0 0 86 86">
                      <circle
                        cx="43"
                        cy="43"
                        r={gaugeRadius}
                        stroke="var(--bg-surface-hover)"
                        strokeWidth="7"
                        fill="transparent"
                      />
                      <circle
                        cx="43"
                        cy="43"
                        r={gaugeRadius}
                        stroke={getRiskColor(selectedOrder.risk_category)}
                        strokeWidth="7"
                        strokeDasharray={gaugeCircumference}
                        strokeDashoffset={gaugeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                      />
                    </svg>

                    <div className="gauge-details">
                      <div className="gauge-label">Delay Probability</div>
                      <div className="gauge-number" style={{ color: getRiskColor(selectedOrder.risk_category) }}>
                        {selectedPct}%
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {selectedScore >= 0.7
                          ? "Severe risk of supply bottleneck"
                          : selectedScore >= 0.4
                          ? "Moderate delay vulnerability"
                          : "High fulfillment confidence"}
                      </div>
                    </div>
                  </div>

                  {/* Spec Details Grid */}
                  <div className="specs-grid">
                    <div className="spec-item">
                      <Truck size={18} className="spec-icon" />
                      <div className="spec-text">
                        <span>Supplier ID</span>
                        <strong>{selectedOrder.supplier_id}</strong>
                      </div>
                    </div>

                    <div className="spec-item">
                      <Box size={18} className="spec-icon" />
                      <div className="spec-text">
                        <span>Quantity Ordered</span>
                        <strong>{Number(selectedOrder.order_quantity || 0).toLocaleString()} units</strong>
                      </div>
                    </div>

                    <div className="spec-item">
                      <Clock size={18} className="spec-icon" />
                      <div className="spec-text">
                        <span>Promised Lead Time</span>
                        <strong>{selectedOrder.promised_lead_time} days</strong>
                      </div>
                    </div>

                    <div className="spec-item">
                      <Percent size={18} className="spec-icon" />
                      <div className="spec-text">
                        <span>Historical Late Rate</span>
                        <strong>{(Number(selectedOrder.historical_late_rate || 0) * 100).toFixed(1)}%</strong>
                      </div>
                    </div>

                    <div className="spec-item">
                      <ShieldAlert size={18} className="spec-icon" />
                      <div className="spec-text">
                        <span>Defect Rate</span>
                        <strong>{(Number(selectedOrder.defect_rate || 0) * 100).toFixed(2)}%</strong>
                      </div>
                    </div>

                    <div className="spec-item">
                      <IndianRupee size={18} className="spec-icon" />
                      <div className="spec-text">
                        <span>Order Total Value</span>
                        <strong>
                          {selectedOrder.order_value
                            ? `₹${Number(selectedOrder.order_value).toLocaleString('en-IN')}`
                            : `₹${(Number(selectedOrder.order_quantity || 0) * Number(selectedOrder.unit_cost || 100)).toLocaleString('en-IN')}`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Strategic AI Advisory */}
                  <div className={`advisory-box ${String(selectedOrder.risk_category).toLowerCase()}`}>
                    <Sparkles size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>AI Dispatch Advisory:</strong>{" "}
                      {String(selectedOrder.risk_category).toLowerCase() === "high"
                        ? "Initiate backup procurement pipeline or engage buffer stock. This vendor exhibits elevated delay frequency under current lead times."
                        : String(selectedOrder.risk_category).toLowerCase() === "medium"
                        ? "Maintain active pinging of logistics milestone 48 hours prior to promised lead deadline to preempt transit slippage."
                        : "Nominal operational trajectory. Order is aligned with vendor historical capacity and safe SLA boundaries."}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "20px 0" }}>
                  Select an order from the registry table to inspect telemetry and risk breakdown.
                </p>
              )}
            </div>

            {/* Live Simulation Sandbox */}
            <div className="panel-card">
              <div className="panel-header-row" style={{ marginBottom: "12px" }}>
                <div className="panel-title">
                  <TrendingUp size={18} color="var(--accent-purple)" />
                  <span>PREDICTIVE RISK SIMULATOR</span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-purple)", background: "rgba(168, 85, 247, 0.12)", padding: "3px 8px", borderRadius: "6px" }}>
                  ML INFERENCE
                </span>
              </div>

              {/* 1-Click Presets */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
                  Quick Scenario Presets:
                </div>
                <div className="preset-chips">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-btn"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePredict} className="sim-form-grid">
                <div className="form-group">
                  <label className="form-label">Item Category</label>
                  <select
                    className="form-input"
                    value={formData.item_category}
                    onChange={(e) => setFormData({ ...formData, item_category: e.target.value })}
                  >
                    <option value="Structure">Structure</option>
                    <option value="Cabin">Cabin</option>
                    <option value="Avionics">Avionics</option>
                    <option value="LandingGear">LandingGear</option>
                    <option value="Engine">Engine</option>
                    <option value="Fasteners">Fasteners</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Supplier Risk Class</label>
                  <select
                    className="form-input"
                    value={formData.supplier_risk_class}
                    onChange={(e) => setFormData({ ...formData, supplier_risk_class: e.target.value })}
                  >
                    <option value="High">High Risk Class</option>
                    <option value="Medium">Medium Risk Class</option>
                    <option value="Low">Low Risk Class</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Order Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.order_quantity}
                    onChange={(e) => setFormData({ ...formData, order_quantity: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Promised Lead Time (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.promised_lead_time}
                    onChange={(e) => setFormData({ ...formData, promised_lead_time: Number(e.target.value) })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <button type="submit" className="submit-btn" disabled={simulating}>
                    <Zap size={16} />
                    <span>{simulating ? "Evaluating Risk Model..." : "Run AI Pipeline Inference"}</span>
                  </button>
                </div>
              </form>

              {/* Simulation Result */}
              {predictionResult && (
                <div className="verdict-card">
                  <div className="verdict-header">
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                      Model Inference Verdict:
                    </span>
                    <span className={`status-pill ${String(predictionResult.risk_category).toLowerCase()}`}>
                      <span className="status-pill-dot" />
                      {predictionResult.risk_category} RISK
                    </span>
                  </div>

                  <div className="verdict-score" style={{ color: getRiskColor(predictionResult.risk_category) }}>
                    {predictionResult.risk_score_percent}%
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Predicted Status:{" "}
                    <strong style={{ color: predictionResult.predicted_late_delivery === 1 ? "var(--risk-high)" : "var(--risk-low)" }}>
                      {predictionResult.predicted_late_delivery === 1 ? "⚠️ High Risk of Late Delivery" : "✅ Expected On-Time Arrival"}
                    </strong>
                  </div>

                  {/* Recommended Alternative Suppliers */}
                  {predictionResult.recommended_suppliers && predictionResult.recommended_suppliers.length > 0 && (
                    <div className="matched-suppliers-list">
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Top Recommended Suppliers for {formData.item_category}:
                      </div>
                      {predictionResult.recommended_suppliers.map((sup, i) => (
                        <div key={i} className="matched-sup-item">
                          <div className="matched-sup-left">
                            <span className="matched-sup-id">{sup.supplier_id}</span>
                            <span className="matched-sup-meta">({sup.orders_completed} orders completed)</span>
                          </div>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: sup.late_rate > 50 ? "var(--risk-high)" : "var(--risk-low)"
                          }}>
                            {sup.late_rate}% late rate
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}