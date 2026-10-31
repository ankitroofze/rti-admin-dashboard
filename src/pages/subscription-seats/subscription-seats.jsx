import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";
import apiClient from "../../services/apiClient";
import { getAuthToken } from "../../services/authSession";
import AppToast from "../../components/common/AppToast";
import statesDistricts from "../../data/statesDistricts.json";
import districtBlocks from "../../data/districtBlocks.json";
import { getVillagesByTaluka } from "../../utils/villages";

/* ------------------------------------------------------------------ */
/*  Roles + levels (moduleFactory ke 25 roles ke saath same order)      */
/* ------------------------------------------------------------------ */

const subscriptionRoles = [
  "Chief Editor / Publisher", "Executive Editor", "Deputy Editor (National)", "Public Relations Officer (PRO)", "National Bureau Chief",
  "State Chief Editor", "State Bureau Chief", "State Coordinator", "Senior State Correspondent", "Special State Reporter",
  "District Head", "District Bureau Chief", "District Correspondent", "Senior District Reporter", "District Coordinator",
  "Taluka Head", "Taluka Correspondent", "Sub-Reporter", "Taluka Representative", "Regional Reporter",
  "Village Correspondent", "Village Representative", "Village Reporter", "Public Communication Associate", "Rural Reporter",
];

const LEVELS = [
  { key: "state", label: "State", start: 5 },
  { key: "district", label: "District", start: 10 },
  { key: "taluka", label: "Taluka", start: 15 },
  { key: "village", label: "Village", start: 20 },
];

const rolesForLevel = (levelKey) => {
  const level = LEVELS.find((l) => l.key === levelKey) || LEVELS[4];
  return subscriptionRoles.slice(level.start, level.start + 5).map((label, i) => ({ id: level.start + i + 1, label }));
};

const levelFromRoleId = (id) => {
  const n = Number(id);
  if (!n || n <= 5) return "national";
  if (n <= 10) return "state";
  if (n <= 15) return "district";
  if (n <= 20) return "taluka";
  return "village";
};

const levelLabel = (key) => LEVELS.find((l) => l.key === key)?.label || "-";

/* ------------------------------------------------------------------ */
/*  Location helpers                                                    */
/* ------------------------------------------------------------------ */

const ALL_STATES = statesDistricts.map((s) => s.name);
const norm = (value) => String(value || "").trim().toLowerCase();

const getDistricts = (state) => statesDistricts.find((s) => norm(s.name) === norm(state))?.districts || [];
const getTalukas = (district) => {
  const match = districtBlocks.find((d) => norm(d.name) === norm(district));
  return match ? match.blockList.map((b) => b.name) : [];
};

const seatKey = (roleId, level, loc = {}) => {
  const parts = [roleId, level];
  if (["state", "district", "taluka", "village"].includes(level)) parts.push(norm(loc.state));
  if (["district", "taluka", "village"].includes(level)) parts.push(norm(loc.district));
  if (["taluka", "village"].includes(level)) parts.push(norm(loc.taluka));
  if (level === "village") parts.push(norm(loc.village));
  return parts.join("|");
};

/* ------------------------------------------------------------------ */
/*  Format + API helpers                                                */
/* ------------------------------------------------------------------ */

const moneyFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const formatMoney = (value) => `₹${moneyFormatter.format(Number(value) || 0)}`;

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return String(value);
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = parsed.toLocaleString("en-US", { month: "short" });
  return `${day}-${month}-${parsed.getFullYear()}`;
};

const apiHeaders = () => {
  const token = getAuthToken();
  return { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const firstArray = (payload, extraKeys = []) => {
  const candidates = [
    ...extraKeys.flatMap((k) => [payload?.[k]?.data, payload?.data?.[k]?.data, payload?.[k], payload?.data?.[k]]),
    payload?.data?.data,
    payload?.data,
    payload,
  ];
  return candidates.find(Array.isArray) || [];
};

const loadPaged = async (url, extraKeys) => {
  const all = [];
  let page = 1;
  let lastPage = 1;
  do {
    const res = await apiClient.get(url, { headers: apiHeaders(), params: { per_page: 100, page }, timeout: 20000 });
    all.push(...firstArray(res.data, extraKeys));
    lastPage = Number(res.data?.payments?.last_page ?? res.data?.meta?.last_page ?? res.data?.last_page ?? 1) || 1;
    page += 1;
  } while (page <= lastPage && page <= 100);
  return all;
};

const normalizePayment = (row = {}, index = 0, planMap = {}) => {
  const seat = row.seat && typeof row.seat === "object" ? row.seat : null;
  const typeRaw = String(row.module || row.subscription_type || row.type || "").toLowerCase();
  const statusRaw = String(row.status || row.payment_status || "created").toLowerCase();
  const validityRaw = String(row.validity_status || "").toLowerCase();
  const planId = row.plan_id ?? row.plan?.id ?? "";
  const plan = planMap[String(planId)] || {};
  const roleId = Number(seat?.role_id ?? row.role_id ?? row.plan?.role_id ?? plan.role_id ?? 0) || 0;
  const seatLevel = norm(seat?.level) || norm(plan.location_level) || (roleId ? levelFromRoleId(roleId) : "");
  const endRaw = row.end_date || row.endDate || "";

  return {
    key: String(row.payment_id || row.id || `payment-${index}`),
    isRole: typeRaw === "role" || Boolean(seat),
    roleId,
    roleLabel: roleId ? subscriptionRoles[roleId - 1] : "Premium / Open",
    level: seatLevel === "" ? "national" : seatLevel,
    state: seat?.state || "",
    district: seat?.district || "",
    taluka: seat?.taluka || "",
    village: seat?.village || "",
    planTitle: row.plan?.title || row.plan_title || plan.title || "-",
    userName: row.user?.name || row.user_name || row.username || "-",
    userEmail: row.user?.email || row.user_email || "",
    amount: Number(row.amount ?? row.price ?? 0) || 0,
    paid: statusRaw === "paid",
    expired: validityRaw === "expired",
    purchaseDate: row.purchase_date || row.purchaseDate || row.created_at || "",
    endDate: endRaw ? formatDate(endRaw) : "No expiry",
  };
};

/* ------------------------------------------------------------------ */
/*  UI                                                                  */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 15;

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  return (
    <nav className="mt-3 d-flex justify-content-center">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onChange(page - 1)}>Previous</button>
        </li>
        {pages.map((n) => (
          <li key={n} className={`page-item ${n === page ? "active" : ""}`}>
            <button type="button" className="page-link" onClick={() => onChange(n)}>{n}</button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onChange(page + 1)}>Next</button>
        </li>
      </ul>
    </nav>
  );
};

const StatusBadge = ({ sold }) => (
  <span className={`badge light badge-${sold ? "danger" : "success"}`}>{sold ? "Sold" : "Unsold"}</span>
);

const Select = ({ value, onChange, options, placeholder, disabled }) => (
  <select className="form-select form-control" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const SubscriptionSeats = () => {
  const [soldMap, setSoldMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [level, setLevel] = useState("village");
  const [roleId, setRoleId] = useState(String(rolesForLevel("village")[0].id)); // "all" ya role id
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | sold | unsold
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [villages, setVillages] = useState({ list: [], loading: false });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let planMap = {};
      try {
        const plans = await loadPaged(API.SUBSCRIPTION_PLAN_INDEX, ["role_subscription_plans", "subscription_plans", "plans"]);
        planMap = Object.fromEntries(plans.map((p) => [String(p.id), p]));
      } catch { /* plan list na mile to bhi chalega */ }
      const rows = await loadPaged(API.PAYMENT_HISTORY_INDEX, ["payments"]);
      const paid = rows.map((r, i) => normalizePayment(r, i, planMap)).filter((p) => p.isRole && p.paid && p.roleId);
      const map = new Map();
      paid.forEach((p) => {
        const key = seatKey(p.roleId, p.level, p);
        const cur = map.get(key);
        if (!cur || new Date(p.purchaseDate) > new Date(cur.purchaseDate)) map.set(key, p);
      });
      setSoldMap(map);
    } catch (error) {
      setToast(error?.response?.data?.message || error?.message || "Unable to load data from server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => setPage(1), [level, roleId, state, district, taluka, statusFilter, search]);

  const roles = useMemo(() => rolesForLevel(level), [level]);
  const needState = level !== "state";
  const needDistrict = level === "taluka" || level === "village";
  const needTaluka = level === "village";

  useEffect(() => {
    if (level !== "village" || !district || !taluka) { setVillages({ list: [], loading: false }); return undefined; }
    let active = true;
    setVillages({ list: [], loading: true });
    getVillagesByTaluka(district, taluka)
      .then((list) => active && setVillages({ list, loading: false }))
      .catch(() => active && setVillages({ list: [], loading: false }));
    return () => { active = false; };
  }, [level, district, taluka]);

  const changeLevel = (key) => {
    setLevel(key);
    setRoleId(String(rolesForLevel(key)[0].id));
    setStatusFilter("all");
  };

  const locations = useMemo(() => {
    if (level === "state") return ALL_STATES.map((s) => ({ label: s, state: s }));
    if (level === "district") return state ? getDistricts(state).map((d) => ({ label: d, state, district: d })) : null;
    if (level === "taluka") return state && district ? getTalukas(district).map((t) => ({ label: t, state, district, taluka: t })) : null;
    return state && district && taluka ? villages.list.map((v) => ({ label: v, state, district, taluka, village: v })) : null;
  }, [level, state, district, taluka, villages.list]);

  const allRoles = roleId === "all";
  const shownRoles = allRoles ? roles : roles.filter((r) => String(r.id) === roleId);

  const rows = useMemo(() => (locations || []).map((loc) => ({
    loc,
    cells: shownRoles.map((role) => ({ role, rec: soldMap.get(seatKey(role.id, level, loc)) })),
  })), [locations, shownRoles, level, soldMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const matches = (row) => {
    if (statusFilter === "sold") return row.cells.some((c) => c.rec);
    if (statusFilter === "unsold") return row.cells.some((c) => !c.rec);
    return true;
  };

  const soldCount = rows.reduce((n, r) => n + r.cells.filter((c) => c.rec).length, 0);
  const unsoldCount = rows.reduce((n, r) => n + r.cells.filter((c) => !c.rec).length, 0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => matches(row) && (!term || row.loc.label.toLowerCase().includes(term) || row.cells.some((c) => c.rec && c.rec.userName.toLowerCase().includes(term))));
  }, [rows, statusFilter, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const missing = [needState && !state && "state", needDistrict && !district && "district", needTaluka && !taluka && "taluka"].filter(Boolean);
  const prompt = loading ? "Loading..."
    : !locations ? `Select ${missing.join(", ")} to see the ${levelLabel(level).toLowerCase()} list.`
    : level === "village" && villages.loading ? "Loading villages..."
    : level === "village" && !villages.list.length ? "No village data found for this taluka." : "";

  return (
    <>
      <style>{`
        .rti-seat-filters{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin-bottom:16px}
        .rti-seat-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
        .rti-seat-table th{font-size:12px}
        .rti-seat-table td{vertical-align:middle;font-size:14px}
        .rti-seat-cell small{display:block;opacity:.7;font-size:11px;margin-top:2px}
        .rti-seat-prompt{text-align:center;padding:48px 12px;opacity:.75}
        .rti-seat-prompt i{font-size:34px;margin-bottom:10px;display:block}
      `}</style>
      <AppToast show={Boolean(toast)} message={toast} onClose={() => setToast("")} variant="error" />

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <h3 className="mb-0">Subscription Seats — Sold / Unsold</h3>
        <button type="button" className="btn btn-light btn-sm" onClick={loadData} disabled={loading}>
          <i className={`fa fa-rotate me-2 ${loading ? "fa-spin" : ""}`} />Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="rti-seat-row">
            {LEVELS.map((l) => (
              <button key={l.key} type="button" className={`btn ${level === l.key ? "btn-primary" : "btn-outline-primary"}`} onClick={() => changeLevel(l.key)}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="rti-seat-row">
            {roles.map((role) => (
              <button key={role.id} type="button" className={`btn btn-sm ${roleId === String(role.id) ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setRoleId(String(role.id))}>
                {role.label}
              </button>
            ))}
            <button type="button" className={`btn btn-sm ${allRoles ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setRoleId("all")}>All 5 roles</button>
          </div>

          <div className="rti-seat-filters">
            {needState && <Select value={state} onChange={(v) => { setState(v); setDistrict(""); setTaluka(""); }} options={ALL_STATES} placeholder="Select state" />}
            {needDistrict && <Select value={district} onChange={(v) => { setDistrict(v); setTaluka(""); }} options={state ? getDistricts(state) : []} placeholder="Select district" disabled={!state} />}
            {needTaluka && <Select value={taluka} onChange={setTaluka} options={district ? getTalukas(district) : []} placeholder="Select taluka" disabled={!district} />}
            <input type="search" className="form-control" placeholder={`Search ${levelLabel(level).toLowerCase()} / buyer...`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="rti-seat-row">
            <button type="button" className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-light"}`} onClick={() => setStatusFilter("all")}>All ({soldCount + unsoldCount})</button>
            <button type="button" className={`btn btn-sm ${statusFilter === "sold" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => setStatusFilter("sold")}>Sold ({soldCount})</button>
            <button type="button" className={`btn btn-sm ${statusFilter === "unsold" ? "btn-success" : "btn-outline-success"}`} onClick={() => setStatusFilter("unsold")}>Unsold ({unsoldCount})</button>
          </div>

          {prompt ? (
            <div className="rti-seat-prompt"><i className="fa fa-map-location-dot" />{prompt}</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-responsive-md rti-seat-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{levelLabel(level)}</th>
                      {allRoles ? roles.map((r) => <th key={r.id}>{r.label}</th>) : (<><th>Status</th><th>Sold to</th><th>Date</th></>)}
                    </tr>
                  </thead>
                  <tbody>
                    {!pageRows.length && <tr><td colSpan={7} className="text-center py-4">No records found</td></tr>}
                    {pageRows.map((row, i) => (
                      <tr key={`${row.loc.label}-${i}`}>
                        <td>{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                        <td><strong>{row.loc.label}</strong></td>
                        {allRoles ? row.cells.map((c) => (
                          <td key={c.role.id} className="rti-seat-cell">
                            <StatusBadge sold={Boolean(c.rec)} />
                            {c.rec && <small>{c.rec.userName}</small>}
                          </td>
                        )) : (
                          <>
                            <td><StatusBadge sold={Boolean(row.cells[0].rec)} /></td>
                            <td>{row.cells[0].rec ? row.cells[0].rec.userName : "-"}</td>
                            <td>{row.cells[0].rec ? formatDate(row.cells[0].rec.purchaseDate) : "-"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SubscriptionSeats;