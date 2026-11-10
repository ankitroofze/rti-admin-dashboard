import API from "../api/api";
import adminRtiClient from "./adminRtiClient";

/* ------------------------------------------------------------------ */
/*  Admin Newspapers  —  base: /api/admin-rti  (adminRtiClient)         */
/*                                                                      */
/*    GET    /newspapers                                                */
/*    GET    /newspapers/{id}                                           */
/*    POST   /newspapers            (multipart)                         */
/*    PUT    /newspapers/{id}       (multipart)                         */
/*    POST   /newspapers/{id}/publish                                   */
/*    POST   /newspapers/{id}       (_method=DELETE  -> delete)         */
/*                                                                      */
/*  Create/Update fields:                                               */
/*    title, published_for_date, description, thumbnail, pdf,           */
/*    is_active, is_published                                           */
/* ------------------------------------------------------------------ */

// PDF upload 12s (adminRtiClient default) me nahi hoga, isliye upload calls ka timeout bada rakha hai.
const UPLOAD_TIMEOUT = 180000;
const REQUEST_TIMEOUT = 30000;

// Laravel multipart ke saath real PUT request ki body (files + fields) parse nahi karta,
// isliye update POST + `_method=PUT` se jata hai (backend par wahi PUT /newspapers/{id} route chalta hai).
// Agar aapka backend real PUT multipart accept karta hai to ise false kar dein.
const UPDATE_VIA_METHOD_SPOOF = true;

/* ----------------------------- helpers ----------------------------- */

const API_ORIGIN = (() => {
  const raw = String(import.meta.env.VITE_API_BASE_URL || "https://189.72.144.238/api");
  try {
    return new URL(raw).origin;
  } catch {
    return "https://189.72.144.238";
  }
})();

// Backend full URL de to wahi; sirf relative path mile to storage URL banate hain.
const toFileUrl = (value) => {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:")) return v;
  if (v.startsWith("/")) return `${API_ORIGIN}${v}`;
  return `${API_ORIGIN}/storage/${v}`;
};

const asBool = (value) => {
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on", "active", "published"].includes(String(value ?? "").trim().toLowerCase());
};

// "2026-11-05" / "2026-11-05T00:00:00.000000Z" -> "2026-11-05"  (timezone shift se bachne ke liye string se hi kaat rahe hain)
export const toDateInputValue = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// "2026-11-05" -> "05-Nov-2026"
export const formatNewspaperDate = (value) => {
  const iso = toDateInputValue(value);
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${String(d).padStart(2, "0")}-${date.toLocaleString("en-US", { month: "short" })}-${y}`;
};

export const formatNewspaperDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return `${formatNewspaperDate(`${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`)} ${parsed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
};

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

// 422 validation errors -> { title: "…", pdf: "…" }
export const getFieldErrors = (error) => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, Array.isArray(value) ? value.join(" ") : String(value)])
  );
};

/* ---------------------------- normalizers -------------------------- */

export const normalizeNewspaper = (row = {}) => ({
  id: String(row.id ?? row.newspaper_id ?? ""),
  title: row.title || "",
  publishedForDate: toDateInputValue(row.published_for_date ?? row.publish_date),
  description: row.description || "",
  thumbnailUrl: toFileUrl(row.thumbnail_url || row.thumbnail),
  pdfUrl: toFileUrl(row.pdf_url || row.pdf),
  isActive: asBool(row.is_active),
  isPublished: asBool(row.is_published),
  publishedAt: row.published_at || "",
  createdAt: row.created_at || "",
  updatedAt: row.updated_at || "",
});

const pickList = (payload) => {
  const candidates = [
    payload?.newspapers,
    payload?.data?.newspapers,
    payload?.data,
    payload?.items,
    payload?.records,
    payload,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && Array.isArray(candidate.data)) return candidate.data; // Laravel paginator
  }
  return [];
};

const pickLastPage = (payload) =>
  Number(
    payload?.newspapers?.last_page ??
    payload?.data?.newspapers?.last_page ??
    payload?.data?.last_page ??
    payload?.meta?.last_page ??
    payload?.last_page ??
    1
  ) || 1;

const pickItem = (payload) =>
  payload?.newspaper || payload?.data?.newspaper || payload?.data || payload || {};

/* ------------------------------ payload ---------------------------- */

// Saari fields hamesha bhejte hain. Files sirf tab jab admin ne nayi file chuni ho
// (update me purani file backend par waise hi rehti hai).
export const buildNewspaperFormData = ({
  title,
  publishedForDate,
  description,
  thumbnailFile,
  pdfFile,
  isActive,
  isPublished,
}) => {
  const formData = new FormData();
  formData.append("title", String(title || "").trim());
  formData.append("published_for_date", toDateInputValue(publishedForDate));
  formData.append("description", String(description || "").trim());
  if (thumbnailFile instanceof File && thumbnailFile.size) formData.append("thumbnail", thumbnailFile);
  if (pdfFile instanceof File && pdfFile.size) formData.append("pdf", pdfFile);
  formData.append("is_active", isActive ? "1" : "0");       // Laravel boolean rule: 1 / 0
  formData.append("is_published", isPublished ? "1" : "0");
  return formData;
};

/* ------------------------------- calls ----------------------------- */

export const listNewspapers = async () => {
  const rows = [];
  let page = 1;
  let lastPage = 1;
  do {
    const response = await adminRtiClient.get(API.NEWSPAPER_INDEX, {
      params: { per_page: 100, page },
      timeout: REQUEST_TIMEOUT,
    });
    rows.push(...pickList(response.data));
    lastPage = pickLastPage(response.data);
    page += 1;
  } while (page <= lastPage && page <= 50);
  return rows.map(normalizeNewspaper);
};

export const getNewspaper = async (id) => {
  const response = await adminRtiClient.get(API.NEWSPAPER_SHOW(encodeURIComponent(id)), { timeout: REQUEST_TIMEOUT });
  return normalizeNewspaper(pickItem(response.data));
};

export const createNewspaper = async (values, onUploadProgress) => {
  const response = await adminRtiClient.post(API.NEWSPAPER_ADD, buildNewspaperFormData(values), {
    timeout: UPLOAD_TIMEOUT,
    onUploadProgress,
  });
  return { message: response.data?.message, newspaper: normalizeNewspaper(pickItem(response.data)) };
};

export const updateNewspaper = async (id, values, onUploadProgress) => {
  const url = API.NEWSPAPER_UPDATE(encodeURIComponent(id));
  const formData = buildNewspaperFormData(values);
  const config = { timeout: UPLOAD_TIMEOUT, onUploadProgress };

  let response;
  if (UPDATE_VIA_METHOD_SPOOF) {
    formData.append("_method", "PUT");
    response = await adminRtiClient.post(url, formData, config);
  } else {
    response = await adminRtiClient.put(url, formData, config);
  }
  return { message: response.data?.message, newspaper: normalizeNewspaper(pickItem(response.data)) };
};

// Publish karte waqt backend ko `is_published` required hai: publish = 1 (draft/unpublish = 0).
export const publishNewspaper = async (id) => {
  const formData = new FormData();
  formData.append("is_published", "1");
  const response = await adminRtiClient.post(API.NEWSPAPER_PUBLISH(encodeURIComponent(id)), formData, { timeout: REQUEST_TIMEOUT });
  return { message: response.data?.message, newspaper: normalizeNewspaper(pickItem(response.data)) };
};

// Delete hamesha POST se jata hai (real DELETE request nahi) — Laravel `_method=DELETE` se
// wahi DELETE /newspapers/{id} route chalata hai.
export const deleteNewspaper = async (id) => {
  const url = API.NEWSPAPER_DELETE(encodeURIComponent(id));
  const formData = new FormData();
  formData.append("_method", "DELETE");
  return adminRtiClient.post(url, formData, { timeout: REQUEST_TIMEOUT });
};

/* ------------------- list -> view/update handoff ------------------- */
// Baaki modules ki tarah active record sessionStorage me rakhte hain (refresh par bhi bacha rehta hai).

const ACTIVE_KEY = "rti-active-newspaper";

export const setActiveNewspaper = (row) => {
  try {
    sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(row));
  } catch {
    /* ignore */
  }
};

export const getActiveNewspaper = () => {
  try {
    return JSON.parse(sessionStorage.getItem(ACTIVE_KEY) || "null");
  } catch {
    return null;
  }
};

export const clearActiveNewspaper = () => sessionStorage.removeItem(ACTIVE_KEY);

export const NEWSPAPER_LIST_PATH = "/admin/e-paper";

export const DESIGNER_PATH = "/admin/digital-newspaper";

/* ------------- designer -> e-paper form handoff (in-memory) ------------ */
// Designer PDF + thumbnail (File objects) banata hai. Files sessionStorage me nahi rakh sakte,
// isliye module-level variable me rakhte hain; e-paper "Add" form khulte hi ek baar le leta hai.
let pendingDesign = null;

export const setPendingDesign = (design) => {
  pendingDesign = design || null;
};

export const getPendingDesign = () => pendingDesign;

export const clearPendingDesign = () => {
  pendingDesign = null;
};