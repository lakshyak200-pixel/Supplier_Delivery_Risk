import React, { useState, useEffect } from "react";
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
  DollarSign,
  Layers
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8001";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLoading] = useState(true);

  // Live Simulator Form State
  const [formData, setFormData] = useState({
    item_category: "Electronics",
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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders?limit=60`);
      setOrders(res.data);
      if (res.data.length > 0) setSelectedOrder(res.data[0]);
    } catch (err) {
      console.error("Orders fetching failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
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

  // Filtered orders logic
  const filteredOrders = orders.filter((o) => {
    const matchesRisk = filterRisk === "ALL" || o.risk_category === filterRisk;
    const matchesSearch =
      (o.order_id && o.order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.supplier_id && o.supplier_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.item_category && o.item_category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRisk && matchesSearch;
  });

  const highRisk = orders.filter((o) => o.risk_category === "High").length;
  const medRisk = orders.filter((o) => o.risk_category === "Medium").length;
  const lowRisk = orders.filter((o) => o.risk_category === "Low").length;

  return (
    <div style={styles.appContainer}>
      {/* Top Navbar */}
      <nav style={styles.navBar}>
        <div style={styles.navLeft}>
          <div style={styles.logoBadge}>
            <Zap size={22} color="#60a5fa" />
          </div>
          <div>
            <h1 style={styles.logoTitle}>VORTEX // RISK ENGINE</h1>
            <p style={styles.logoSub}>Automated Supply Chain Late Delivery Predictor</p>
          </div>
        </div>
        <div style={styles.navStatus}>
          <span style={styles.livePulse}></span>
          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>API CONNECTED :8001</span>
        </div>
      </nav>

      <main style={styles.content}>
        {/* KPI Banner */}
        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiTitle}>TOTAL MONITORED</span>
              <Activity size={18} color="#94a3b8" />
            </div>
            <div style={styles.kpiNum}>{orders.length}</div>
            <div style={styles.kpiSub}>Active purchase orders tracked</div>
          </div>

          <div style={{ ...styles.kpiCard, borderColor: "rgba(239, 68, 68, 0.4)" }}>
            <div style={styles.kpiHeader}>
              <span style={{ ...styles.kpiTitle, color: "#f87171" }}>HIGH RISK POs</span>
              <AlertTriangle size={18} color="#ef4444" />
            </div>
            <div style={{ ...styles.kpiNum, color: "#ef4444" }}>{highRisk}</div>
            <div style={styles.kpiSub}>Urgent mitigation required</div>
          </div>

          <div style={{ ...styles.kpiCard, borderColor: "rgba(245, 158, 11, 0.4)" }}>
            <div style={styles.kpiHeader}>
              <span style={{ ...styles.kpiTitle, color: "#fbbf24" }}>MEDIUM RISK</span>
              <Clock size={18} color="#f59e0b" />
            </div>
            <div style={{ ...styles.kpiNum, color: "#f59e0b" }}>{medRisk}</div>
            <div style={styles.kpiSub}>Lead times under observation</div>
          </div>

          <div style={{ ...styles.kpiCard, borderColor: "rgba(16, 185, 129, 0.4)" }}>
            <div style={styles.kpiHeader}>
              <span style={{ ...styles.kpiTitle, color: "#34d399" }}>ON-TRACK (LOW)</span>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div style={{ ...styles.kpiNum, color: "#10b981" }}>{lowRisk}</div>
            <div style={styles.kpiSub}>Safe buffer margin</div>
          </div>
        </section>

        {/* Dashboard Core Grid */}
        <div style={styles.mainGrid}>
          {/* Left Table Section */}
          <div style={styles.tablePanel}>
            <div style={styles.tableToolbar}>
              <div style={styles.searchWrapper}>
                <Search size={16} color="#64748b" style={{ position: "absolute", left: "14px", top: "13px" }} />
                <input
                  style={styles.searchInput}
                  placeholder="Search by PO, Supplier ID, Category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={styles.filterGroup}>
                {["ALL", "High", "Medium", "Low"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterRisk(level)}
                    style={{
                      ...styles.filterBtn,
                      background: filterRisk === level ? "#3b82f6" : "rgba(255,255,255,0.03)",
                      color: filterRisk === level ? "#fff" : "#94a3b8",
                      border: filterRisk === level ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>RANK</th>
                    <th style={styles.th}>ORDER ID</th>
                    <th style={styles.th}>SUPPLIER</th>
                    <th style={styles.th}>CATEGORY</th>
                    <th style={styles.th}>RISK SCORE</th>
                    <th style={styles.th}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((item, idx) => {
                    const isSelected = selectedOrder?.order_id === item.order_id;
                    const pct = (Number(item.risk_score || 0) * 100).toFixed(1);
                    return (
                      <tr
                        key={item.order_id || idx}
                        onClick={() => setSelectedOrder(item)}
                        style={{
                          ...styles.tr,
                          background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                          borderColor: isSelected ? "#3b82f6" : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <td style={{ ...styles.td, fontWeight: 700, color: "#60a5fa" }}>
                          #{item.risk_rank || idx + 1}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{item.order_id}</td>
                        <td style={styles.td}>
                          <span style={styles.supplierTag}>{item.supplier_id}</span>
                        </td>
                        <td style={styles.td}>{item.item_category}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={styles.scoreBarTrack}>
                              <div
                                style={{
                                  ...styles.scoreBarFill,
                                  width: `${pct}%`,
                                  background:
                                    item.risk_category === "High"
                                      ? "#ef4444"
                                      : item.risk_category === "Medium"
                                      ? "#f59e0b"
                                      : "#10b981",
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 600, minWidth: "45px" }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={badgeStyle(item.risk_category)}>{item.risk_category}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Intel & Sandbox */}
          <div style={styles.rightSide}>
            {/* Selected PO Intel */}
            <div style={styles.intelCard}>
              <div style={styles.intelHeader}>
                <Layers size={18} color="#60a5fa" />
                <span style={{ fontWeight: 700, letterSpacing: "0.5px" }}>ORDER INTEL DIRECTORY</span>
              </div>

              {selectedOrder ? (
                <div>
                  <div style={styles.intelTopRow}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Selected PO</div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{selectedOrder.order_id}</div>
                    </div>
                    <span style={badgeStyle(selectedOrder.risk_category)}>{selectedOrder.risk_category} RISK</span>
                  </div>

                  <div style={styles.intelDetailGrid}>
                    <div style={styles.intelItem}>
                      <Truck size={14} color="#94a3b8" />
                      <span>Supplier: <strong>{selectedOrder.supplier_id}</strong></span>
                    </div>
                    <div style={styles.intelItem}>
                      <Box size={14} color="#94a3b8" />
                      <span>Qty: <strong>{selectedOrder.order_quantity}</strong></span>
                    </div>
                    <div style={styles.intelItem}>
                      <Clock size={14} color="#94a3b8" />
                      <span>Promised Lead: <strong>{selectedOrder.promised_lead_time} days</strong></span>
                    </div>
                    <div style={styles.intelItem}>
                      <DollarSign size={14} color="#94a3b8" />
                      <span>Historical Late: <strong>{(Number(selectedOrder.historical_late_rate || 0) * 100).toFixed(1)}%</strong></span>
                    </div>
                  </div>

                  <div style={styles.gaugeContainer}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Calculated Delay Likelihood</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#60a5fa" }}>
                        {(Number(selectedOrder.risk_score || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={styles.gaugeTrack}>
                      <div
                        style={{
                          ...styles.gaugeFill,
                          width: `${(Number(selectedOrder.risk_score || 0) * 100).toFixed(1)}%`,
                          background:
                            selectedOrder.risk_category === "High"
                              ? "linear-gradient(90deg, #f97316, #ef4444)"
                              : selectedOrder.risk_category === "Medium"
                              ? "linear-gradient(90deg, #3b82f6, #f59e0b)"
                              : "linear-gradient(90deg, #06b6d4, #10b981)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: "14px" }}>Click an order row to view details.</p>
              )}
            </div>

            {/* Simulation Sandbox */}
            <div style={styles.simulatorCard}>
              <div style={styles.intelHeader}>
                <TrendingUp size={18} color="#a855f7" />
                <span style={{ fontWeight: 700, letterSpacing: "0.5px" }}>LIVE SIMULATION SANDBOX</span>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
                Test any arbitrary new PO against the loaded pipeline model[cite: 1, 11].
              </p>

              <form onSubmit={handlePredict} style={styles.formGrid}>
                <div>
                  <label style={styles.fieldLabel}>Category</label>
                  <select
                    style={styles.fieldInput}
                    value={formData.item_category}
                    onChange={(e) => setFormData({ ...formData, item_category: e.target.value })}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label style={styles.fieldLabel}>Supplier Tier</label>
                  <select
                    style={styles.fieldInput}
                    value={formData.supplier_risk_class}
                    onChange={(e) => setFormData({ ...formData, supplier_risk_class: e.target.value })}
                  >
                    <option value="Low">Tier 1 (Low)</option>
                    <option value="Medium">Tier 2 (Medium)</option>
                    <option value="High">Tier 3 (High)</option>
                  </select>
                </div>

                <div>
                  <label style={styles.fieldLabel}>Order Quantity</label>
                  <input
                    type="number"
                    style={styles.fieldInput}
                    value={formData.order_quantity}
                    onChange={(e) => setFormData({ ...formData, order_quantity: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={styles.fieldLabel}>Lead Time (Days)</label>
                  <input
                    type="number"
                    style={styles.fieldInput}
                    value={formData.promised_lead_time}
                    onChange={(e) => setFormData({ ...formData, promised_lead_time: Number(e.target.value) })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <button type="submit" style={styles.predictBtn} disabled={simulating}>
                    <Zap size={16} />
                    {simulating ? "Evaluating Risk..." : "Run ML Pipeline Inference"}
                  </button>
                </div>
              </form>

              {predictionResult && (
                <div style={styles.resultBox}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Inference Verdict:</span>
                    <span style={badgeStyle(predictionResult.risk_category)}>{predictionResult.risk_category} RISK</span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#fff" }}>
                    {predictionResult.risk_score_percent}%
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    Predicted Flag: {predictionResult.predicted_late_delivery === 1 ? "⚠️ Likely Delay" : "✅ On Time"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const badgeStyle = (cat) => {
  if (cat === "High") {
    return {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 700,
      background: "rgba(239, 68, 68, 0.15)",
      color: "#f87171",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      letterSpacing: "0.5px",
    };
  }
  if (cat === "Medium") {
    return {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 700,
      background: "rgba(245, 158, 11, 0.15)",
      color: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      letterSpacing: "0.5px",
    };
  }
  return {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    background: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    letterSpacing: "0.5px",
  };
};

const styles = {
  appContainer: {
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), transparent)",
    paddingBottom: "40px",
  },
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoBadge: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "rgba(59, 130, 246, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  logoTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "1px",
  },
  logoSub: {
    fontSize: "12px",
    color: "#64748b",
  },
  navStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "8px 16px",
    borderRadius: "30px",
    border: "1px solid rgba(255, 255, 255, 0.07)",
  },
  livePulse: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981",
  },
  content: {
    padding: "32px",
    maxWidth: "1440px",
    margin: "0 auto",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
    marginBottom: "28px",
  },
  kpiCard: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(8px)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  kpiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  kpiTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "1px",
  },
  kpiNum: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#f8fafc",
  },
  kpiSub: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1.2fr",
    gap: "24px",
  },
  tablePanel: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
  },
  tableToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "14px",
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px 10px 38px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
  },
  filterGroup: {
    display: "flex",
    gap: "6px",
  },
  filterBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tableScroll: {
    maxHeight: "560px",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  tableHeadRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  th: {
    padding: "12px 10px",
    textAlign: "left",
    color: "#64748b",
    fontSize: "11px",
    letterSpacing: "0.5px",
    fontWeight: 700,
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  td: {
    padding: "14px 10px",
    color: "#e2e8f0",
  },
  supplierTag: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  scoreBarTrack: {
    width: "70px",
    height: "6px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: "4px",
  },
  rightSide: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  intelCard: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "22px",
  },
  intelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "16px",
  },
  intelTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  intelDetailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },
  intelItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#94a3b8",
  },
  gaugeContainer: {
    background: "rgba(255, 255, 255, 0.02)",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.04)",
  },
  gaugeTrack: {
    width: "100%",
    height: "10px",
    background: "rgba(255, 255, 255, 0.06)",
    borderRadius: "6px",
    overflow: "hidden",
  },
  gaugeFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.4s ease",
  },
  simulatorCard: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "22px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "6px",
    fontWeight: 600,
  },
  fieldInput: {
    width: "100%",
    padding: "9px 12px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
  },
  predictBtn: {
    width: "100%",
    marginTop: "8px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
  },
  resultBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
};