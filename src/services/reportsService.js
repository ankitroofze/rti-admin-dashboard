import API from "../api/api";
import adminRtiClient from "./adminRtiClient";

/* ------------------------------------------------------------------ */
/*  Admin Reports (Moderation)  —  base: /api/admin-rti (adminRtiClient)*/
/*                                                                    */
/*    GET   /reports?type=news&status=pending&per_page=20&page=1      */
/*    POST  /reports/{reportId}/status                                */
/*          Body: { "status": "resolved" }                            */
/*                                                                    */
/*  Available Filters:                                                */
/*    type:   news (post reports) | user (account reports)            */
/*    status: pending | reviewed | resolved | rejected                */
/*    per_page: 20 (or dynamic)                                       */
/* ------------------------------------------------------------------ */

export const REPORTS_LIST_PATH = "/admin/reports";
export const REPORTS_VIEW_PATH = "/admin/reports/view";
const ACTIVE_REPORT_KEY = "rti-active-report-snapshot";

export const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    badgeClass: "badge-warning",
    icon: "fa-clock",
    description: "Awaiting review",
  },
  reviewed: {
    label: "Reviewed",
    badgeClass: "badge-info",
    icon: "fa-eye",
    description: "Under review",
  },
  resolved: {
    label: "Resolved",
    badgeClass: "badge-success",
    icon: "fa-check-circle",
    description: "Issue resolved",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "badge-danger",
    icon: "fa-ban",
    description: "Dismissed as invalid",
  },
};

export const TYPE_CONFIG = {
  news: {
    label: "News / Post Report",
    shortLabel: "News",
    badgeClass: "badge-primary",
    icon: "fa-newspaper",
  },
  user: {
    label: "User / Account Report",
    shortLabel: "User",
    badgeClass: "badge-secondary",
    icon: "fa-user",
  },
};

/* ----------------------------- helpers ----------------------------- */

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  if (!data) return error?.message && !error?.response ? error.message : fallback;
  if (typeof data === "string") return data;
  if (data.errors && typeof data.errors === "object") {
    const all = Object.values(data.errors).flat().filter(Boolean);
    if (all.length) return all.join(" | ");
  }
  return data.message || data.error || fallback;
};

export const formatReportDate = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
};

const API_ORIGIN = (() => {
  const raw = String(import.meta.env.VITE_API_BASE_URL || "https://189.72.144.238/api");
  try {
    return new URL(raw).origin;
  } catch {
    return "https://189.72.144.238";
  }
})();

export const toFileUrl = (value) => {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:")) return v;
  if (v.startsWith("/")) return `${API_ORIGIN}${v}`;
  return `${API_ORIGIN}/storage/${v}`;
};

/* --------------------------- normalization ------------------------- */

export const normalizeReport = (raw, index = 0) => {
  if (!raw || typeof raw !== "object") return {};

  const id = raw.id || raw.report_id || raw._id || `report-${index + 1}`;
  const rawType = String(raw.type || raw.report_type || "").trim().toLowerCase();
  const type = rawType === "user" ? "user" : (raw.user_id && !raw.news_id ? "user" : "news");
  const rawStatus = String(raw.status || "pending").trim().toLowerCase();
  const status = ["pending", "reviewed", "resolved", "rejected"].includes(rawStatus)
    ? rawStatus
    : "pending";

  // Reporter info
  const reporterObj = raw.reporter || raw.reported_by || raw.user_reported_by || raw.user || {};
  const reporterId = raw.reporter_id || raw.reported_by_id || (typeof reporterObj === "object" ? reporterObj.id : null);
  const reporterName =
    (typeof reporterObj === "object" ? (reporterObj.name || reporterObj.username || reporterObj.full_name) : null) ||
    raw.reporter_name ||
    raw.reported_by_name ||
    (reporterId ? `User #${reporterId}` : "Anonymous");
  const reporterEmail = (typeof reporterObj === "object" ? reporterObj.email : "") || raw.reporter_email || raw.reported_by_email || "";
  const reporterMobile = (typeof reporterObj === "object" ? (reporterObj.mobile || reporterObj.phone) : "") || raw.reporter_mobile || "";

  // Reported Target (News or User)
  const newsObj = raw.news || raw.post || raw.reported_news || raw.target || {};
  const targetUserObj = raw.reported_user || raw.target_user || (type === "user" && typeof raw.user === "object" ? raw.user : {}) || raw.target || {};

  // News specific details
  const newsId = raw.news_id || raw.post_id || (typeof newsObj === "object" ? newsObj.id : null);
  const newsTitle =
    (typeof newsObj === "object" ? (newsObj.title || newsObj.heading || newsObj.name) : null) ||
    raw.news_title ||
    raw.title ||
    (newsId ? `News Post #${newsId}` : "-");
  const newsImage = toFileUrl(
    (typeof newsObj === "object" ? (newsObj.image || newsObj.thumbnail || newsObj.media) : null) ||
    raw.news_image ||
    raw.image
  );
  const newsContent = (typeof newsObj === "object" ? (newsObj.description || newsObj.content || newsObj.details) : "") || raw.news_content || "";
  const newsAuthor = (typeof newsObj === "object" ? (newsObj.author || newsObj.user?.name || newsObj.user_name) : "") || raw.news_author || "";

  // User specific details
  const userId = raw.user_id || raw.reported_user_id || (typeof targetUserObj === "object" ? targetUserObj.id : null);
  const userName =
    (typeof targetUserObj === "object" ? (targetUserObj.name || targetUserObj.username || targetUserObj.full_name) : null) ||
    raw.user_name ||
    raw.reported_user_name ||
    (userId ? `User #${userId}` : "-");
  const userEmail = (typeof targetUserObj === "object" ? targetUserObj.email : "") || raw.user_email || raw.reported_user_email || "";
  const userMobile = (typeof targetUserObj === "object" ? (targetUserObj.mobile || targetUserObj.phone) : "") || raw.user_mobile || "";
  const userImage = toFileUrl(
    (typeof targetUserObj === "object" ? (targetUserObj.profile_image || targetUserObj.avatar || targetUserObj.image) : null) ||
    raw.user_image ||
    raw.profile_image
  );

  const reason = raw.reason || raw.report_reason || raw.reason_text || raw.subject || raw.title || "No reason specified";
  const description = raw.description || raw.details || raw.message || raw.comment || raw.notes || "";
  const adminRemarks = raw.admin_remarks || raw.admin_notes || raw.resolution_notes || "";
  const createdAt = raw.created_at || raw.createdAt || raw.date || "";
  const updatedAt = raw.updated_at || raw.updatedAt || "";

  return {
    id,
    sr: index + 1,
    type,
    status,
    reason,
    description,
    adminRemarks,
    createdAt,
    updatedAt,
    reporter: {
      id: reporterId,
      name: reporterName,
      email: reporterEmail,
      mobile: reporterMobile,
    },
    targetNews: {
      id: newsId,
      title: newsTitle,
      image: newsImage,
      content: newsContent,
      author: newsAuthor,
    },
    targetUser: {
      id: userId,
      name: userName,
      email: userEmail,
      mobile: userMobile,
      image: userImage,
    },
    raw,
  };
};

/* -------------------------- storage helpers ------------------------ */

export const setActiveReport = (report) => {
  try {
    sessionStorage.setItem(ACTIVE_REPORT_KEY, JSON.stringify(report));
  } catch (error) {
    console.error("Failed to cache active report", error);
  }
};

export const getActiveReport = () => {
  try {
    const cached = sessionStorage.getItem(ACTIVE_REPORT_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const clearActiveReport = () => {
  try {
    sessionStorage.removeItem(ACTIVE_REPORT_KEY);
  } catch {
    /* ignore storage errors */
  }
};

/* ------------------------------- API calls ------------------------- */

/**
 * Fetch reports list with filters and pagination
 * GET /admin-rti/reports?type=news&status=pending&per_page=20&page=1
 */
export const getReports = async ({
  type = "news",
  status = "pending",
  per_page = 20,
  page = 1,
} = {}) => {
  const params = {};
  if (type && type !== "all") params.type = type;
  if (status && status !== "all") params.status = status;
  if (per_page) params.per_page = per_page;
  if (page) params.page = page;

  const endpoint = API.REPORTS_INDEX || "/reports";
  const response = await adminRtiClient.get(endpoint, {
    params,
    timeout: 15000,
  });

  const payload = response.data;
  
  // Extract list items gracefully from various API wrapper formats
  const rawList = (() => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.reports?.data)) return payload.reports.data;
    if (Array.isArray(payload?.reports)) return payload.reports;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  })();

  const rows = rawList.map((item, idx) => normalizeReport(item, idx));

  // Extract pagination info
  const paginationSource = payload?.data?.data ? payload.data : (payload?.pagination || payload);
  const total = Number(
    paginationSource?.total ??
    payload?.total ??
    rows.length
  );
  const currentPage = Number(
    paginationSource?.current_page ??
    paginationSource?.page ??
    page
  );
  const perPageVal = Number(
    paginationSource?.per_page ??
    paginationSource?.perPage ??
    per_page
  );
  const lastPage = Number(
    paginationSource?.last_page ??
    paginationSource?.totalPages ??
    (perPageVal > 0 ? Math.ceil(total / perPageVal) : 1)
  );

  return {
    rows,
    total,
    currentPage,
    lastPage: Math.max(1, lastPage),
    perPage: perPageVal,
  };
};

/**
 * Update report status
 * POST /admin-rti/reports/{reportId}/status
 * Body: { "status": "resolved" }
 */
export const updateReportStatus = async (reportId, nextStatus, remarks = "") => {
  if (!reportId) throw new Error("Report ID is required");
  if (!nextStatus) throw new Error("Status is required");

  const endpoint = API.REPORTS_STATUS ? API.REPORTS_STATUS(reportId) : `/reports/${reportId}/status`;
  const body = { status: nextStatus };
  if (remarks) {
    body.admin_remarks = remarks;
  }

  const response = await adminRtiClient.post(endpoint, body, {
    timeout: 15000,
  });

  return {
    message: response.data?.message || `Report status updated to ${nextStatus}`,
    data: response.data,
  };
};

/**
 * Fetch a single report details by ID
 */
export const getReportById = async (reportId) => {
  if (!reportId) return null;
  try {
    const endpoint = API.REPORTS_SHOW ? API.REPORTS_SHOW(reportId) : `/reports/${reportId}`;
    const response = await adminRtiClient.get(endpoint, { timeout: 15000 });
    const raw = response.data?.data || response.data?.report || response.data;
    return normalizeReport(raw);
  } catch (err) {
    // If specific show endpoint is not provided, fallback to active cached report
    const active = getActiveReport();
    if (active && String(active.id) === String(reportId)) {
      return active;
    }
    throw err;
  }
};
