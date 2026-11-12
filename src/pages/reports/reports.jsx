import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Form, Button } from "react-bootstrap";
import AppToast from "../../components/common/AppToast";
import noImage from "../../assets/images/no-image.jpg";
import profilePlaceholder from "../../assets/images/avatar/1.jpg";
import {
  REPORTS_VIEW_PATH,
  STATUS_CONFIG,
  TYPE_CONFIG,
  formatReportDate,
  getApiErrorMessage,
  getCachedReports,
  getReports,
  setActiveReport,
  updateReportStatus,
} from "../../services/reportsService";

const STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All Statuses" },
];

const TYPE_TABS = [
  { value: "news", label: "News / Post Reports", icon: "fa-newspaper" },
  { value: "user", label: "User / Account Reports", icon: "fa-user-shield" },
  { value: "all", label: "All Reports", icon: "fa-list" },
];

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    badgeClass: "badge-secondary",
    icon: "fa-circle-question",
  };
  return (
    <span className={`badge light ${config.badgeClass} d-inline-flex align-items-center gap-1`}>
      <i className={`fa ${config.icon} font-10`} />
      {config.label}
    </span>
  );
};

export const TypeBadge = ({ type }) => {
  const config = TYPE_CONFIG[type] || {
    label: type || "Unknown",
    badgeClass: "badge-secondary",
    icon: "fa-tag",
  };
  return (
    <span className={`badge light ${config.badgeClass} d-inline-flex align-items-center gap-1`}>
      <i className={`fa ${config.icon} font-10`} />
      {config.shortLabel || config.label}
    </span>
  );
};

const Reports = () => {
  const navigate = useNavigate();

  // Filters State
  const [activeType, setActiveType] = useState("news");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Data State
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Status Change Modal State
  const [statusModalReport, setStatusModalReport] = useState(null);
  const [targetStatus, setTargetStatus] = useState("resolved");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Image Preview Modal
  const [imagePreview, setImagePreview] = useState("");

  // Notification Toast
  const [toast, setToast] = useState(() => {
    const message = sessionStorage.getItem("moduleToast");
    if (message) sessionStorage.removeItem("moduleToast");
    return { message: message || "", variant: "success" };
  });

  const notify = (message, variant = "success") => setToast({ message, variant });

  // Load Reports from Server (instant SWR display)
  const loadReports = useCallback(async () => {
    const cached = getCachedReports({
      type: activeType,
      status: activeStatus,
      per_page: perPage,
      page,
    });
    if (cached) {
      setRows(cached.rows || []);
      setTotal(cached.total || 0);
      setLastPage(cached.lastPage || 1);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const result = await getReports({
        type: activeType,
        status: activeStatus,
        per_page: perPage,
        page,
      });
      setRows(result.rows || []);
      setTotal(result.total || 0);
      setLastPage(result.lastPage || 1);
    } catch (error) {
      if (!cached) {
        notify(getApiErrorMessage(error, "Failed to load reports. Please try again."), "error");
        setRows([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeType, activeStatus, perPage, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReports();
  }, [loadReports]);

  // Client-side text search over fetched rows
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const matchId = String(r.id || "").toLowerCase().includes(q);
      const matchReason = String(r.reason || "").toLowerCase().includes(q);
      const matchDesc = String(r.description || "").toLowerCase().includes(q);
      const matchReporter = String(r.reporter?.name || "").toLowerCase().includes(q) ||
        String(r.reporter?.email || "").toLowerCase().includes(q);
      const matchNews = String(r.targetNews?.title || "").toLowerCase().includes(q);
      const matchUser = String(r.targetUser?.name || "").toLowerCase().includes(q) ||
        String(r.targetUser?.email || "").toLowerCase().includes(q);
      return matchId || matchReason || matchDesc || matchReporter || matchNews || matchUser;
    });
  }, [rows, search]);

  // Open Details view
  const handleView = (report) => {
    setActiveReport(report);
    navigate(`${REPORTS_VIEW_PATH}?id=${report.id}`);
  };

  // Open Status update modal
  const openStatusModal = (report) => {
    setStatusModalReport(report);
    // Suggest a natural next status (if pending, default to resolved or reviewed)
    setTargetStatus(report.status === "pending" ? "resolved" : report.status);
    setStatusRemarks(report.adminRemarks || "");
  };

  // Submit Status update
  const handleStatusSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!statusModalReport || updatingStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await updateReportStatus(statusModalReport.id, targetStatus, statusRemarks);
      
      // Update local state smoothly
      setRows((current) =>
        current.map((item) =>
          item.id === statusModalReport.id
            ? { ...item, status: targetStatus, adminRemarks: statusRemarks }
            : item
        )
      );

      notify(res.message || `Report #${statusModalReport.id} marked as ${targetStatus}`);
      setStatusModalReport(null);
    } catch (error) {
      notify(getApiErrorMessage(error, "Failed to update report status"), "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick inline status change
  const handleQuickStatus = async (report, nextStatus) => {
    if (updatingStatus || report.status === nextStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await updateReportStatus(report.id, nextStatus);
      setRows((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, status: nextStatus } : item
        )
      );
      notify(res.message || `Report #${report.id} marked as ${nextStatus}`);
    } catch (error) {
      notify(getApiErrorMessage(error, "Failed to update status"), "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="row pb-5 mb-5" style={{ minHeight: "100%", overflowY: "visible" }}>
      <div className="col-12">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="mb-1 text-primary fw-bold">
              <i className="fa fa-shield-halved me-2" />
              Reports Management
            </h3>
            <p className="text-muted mb-0 small">
              Review and moderate reported news posts and user accounts.
            </p>
          </div>
        </div>
      </div>

      <AppToast
        show={Boolean(toast.message)}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((t) => ({ ...t, message: "" }))}
      />

      {/* Main Container Card */}
      <div className="col-12">
        <div className="card">
          {/* Card Header with Tabs */}
          <div className="card-header border-bottom py-2">
            <div className="d-flex align-items-center justify-content-between flex-wrap w-100 gap-2">
              {/* Type Tabs */}
              <ul className="nav nav-tabs card-header-tabs border-0">
                {TYPE_TABS.map((tab) => (
                  <li className="nav-item" key={tab.value}>
                    <button
                      type="button"
                      className={`nav-link border-0 fw-semibold px-3 py-2 ${
                        activeType === tab.value ? "active text-primary border-bottom border-primary border-2" : "text-muted"
                      }`}
                      onClick={() => {
                        setActiveType(tab.value);
                        setPage(1);
                      }}
                    >
                      <i className={`fa ${tab.icon} me-2`} />
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Status Pills */}
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <span className="small text-muted me-1">Status:</span>
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`btn btn-xs ${
                      activeStatus === s.value ? "btn-primary shadow-sm" : "btn-light"
                    }`}
                    onClick={() => {
                      setActiveStatus(s.value);
                      setPage(1);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="card-body border-bottom bg-light py-2">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap">
                {/* Search */}
                <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
                  <span className="input-group-text bg-white">
                    <i className="fa fa-search text-muted" />
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search by ID, reason, title, user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Per Page selector */}
                <div className="d-flex align-items-center gap-1">
                  <span className="small text-muted">Per Page:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 80 }}
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={loadReports}
                disabled={loading}
                title="Refresh Reports"
              >
                <i className={`fa fa-rotate ${loading ? "fa-spin" : ""}`} />
                <span className="ms-1 d-none d-sm-inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-responsive-md mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>Sr.</th>
                    <th style={{ width: 80 }}>ID</th>
                    <th style={{ width: 100 }}>Type</th>
                    <th>Reported Target</th>
                    <th>Reported By</th>
                    <th style={{ minWidth: 180 }}>Reason & Details</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 130 }}>Date</th>
                    <th style={{ width: 130 }} className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                        <span className="text-muted">Loading reports...</span>
                      </td>
                    </tr>
                  )}

                  {!loading && !filteredRows.length && (
                    <tr>
                      <td colSpan={9} className="text-center py-5 text-muted">
                        <i className="fa fa-folder-open fa-2x mb-2 d-block text-secondary opacity-50" />
                        No reports found matching the selected filter.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredRows.map((report, idx) => (
                      <tr key={report.id || idx}>
                        <td className="text-muted small">{report.sr || idx + 1}</td>
                        <td>
                          <span className="badge bg-light text-dark font-11">#{report.id}</span>
                        </td>
                        <td>
                          <TypeBadge type={report.type} />
                        </td>

                        {/* Reported Target Item */}
                        <td>
                          {report.type === "news" ? (
                            <div className="d-flex align-items-center gap-2">
                              {report.targetNews?.image ? (
                                <img
                                  src={report.targetNews.image}
                                  alt="news"
                                  className="rounded object-fit-cover cursor-pointer"
                                  style={{ width: 44, height: 44 }}
                                  onClick={() => setImagePreview(report.targetNews.image)}
                                  onError={(e) => { e.target.src = noImage; }}
                                />
                              ) : (
                                <div
                                  className="bg-light rounded d-flex align-items-center justify-content-center text-muted"
                                  style={{ width: 44, height: 44 }}
                                >
                                  <i className="fa fa-newspaper font-16 text-secondary" />
                                </div>
                              )}
                              <div style={{ maxWidth: 220 }}>
                                <div className="fw-semibold text-truncate" title={report.targetNews?.title}>
                                  {report.targetNews?.title || "Untitled Post"}
                                </div>
                                <small className="text-muted d-block">
                                  {report.targetNews?.id ? `News ID: #${report.targetNews.id}` : ""}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={report.targetUser?.image || profilePlaceholder}
                                alt="user"
                                className="rounded-circle object-fit-cover"
                                style={{ width: 40, height: 40 }}
                                onError={(e) => { e.target.src = profilePlaceholder; }}
                              />
                              <div style={{ maxWidth: 200 }}>
                                <div className="fw-semibold text-truncate" title={report.targetUser?.name}>
                                  {report.targetUser?.name || "User"}
                                </div>
                                <small className="text-muted d-block text-truncate" title={report.targetUser?.email}>
                                  {report.targetUser?.email || `ID: #${report.targetUser?.id}`}
                                </small>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Reported By */}
                        <td>
                          <div className="fw-semibold small">{report.reporter?.name}</div>
                          <small className="text-muted d-block">{report.reporter?.email || "-"}</small>
                        </td>

                        {/* Reason / Details */}
                        <td>
                          <div className="fw-bold text-dark font-12 mb-1">{report.reason}</div>
                          {report.description && (
                            <div
                              className="text-muted small text-truncate"
                              style={{ maxWidth: 240 }}
                              title={report.description}
                            >
                              {report.description}
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td>
                          <StatusBadge status={report.status} />
                        </td>

                        {/* Date */}
                        <td className="small text-muted">
                          {formatReportDate(report.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="text-end pe-3">
                          <div className="d-inline-flex align-items-center gap-1">
                            {/* View Button */}
                            <button
                              type="button"
                              className="btn btn-info shadow btn-xs sharp"
                              title="View Details"
                              onClick={() => handleView(report)}
                            >
                              <i className="fa fa-eye" />
                            </button>

                            {/* Status Change Button */}
                            <button
                              type="button"
                              className="btn btn-warning shadow btn-xs sharp"
                              title="Update Status"
                              onClick={() => openStatusModal(report)}
                            >
                              <i className="fa fa-pen-to-square" />
                            </button>

                            {/* Quick Resolve Button if pending */}
                            {report.status === "pending" && (
                              <button
                                type="button"
                                className="btn btn-success shadow btn-xs sharp"
                                title="Quick Resolve"
                                onClick={() => handleQuickStatus(report, "resolved")}
                                disabled={updatingStatus}
                              >
                                <i className="fa fa-check" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {lastPage > 1 && (
              <div className="d-flex align-items-center justify-content-between p-3 border-top flex-wrap gap-2">
                <div className="small text-muted">
                  Showing page <strong>{page}</strong> of <strong>{lastPage}</strong> (Total {total} reports)
                </div>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                  >
                    <i className="fa fa-chevron-left me-1" />
                    Previous
                  </button>
                  <span className="btn btn-light disabled px-3">
                    {page}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage || loading}
                  >
                    Next
                    <i className="fa fa-chevron-right ms-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        show={Boolean(statusModalReport)}
        onHide={() => !updatingStatus && setStatusModalReport(null)}
        centered
      >
        <Form onSubmit={handleStatusSubmit}>
          <Modal.Header closeButton={!updatingStatus}>
            <Modal.Title className="h5">
              <i className="fa fa-pen-to-square me-2 text-primary" />
              Update Report Status
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {statusModalReport && (
              <>
                <div className="alert alert-light border mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Report ID:</span>
                    <strong>#{statusModalReport.id}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Type:</span>
                    <TypeBadge type={statusModalReport.type} />
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Current Status:</span>
                    <StatusBadge status={statusModalReport.status} />
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">New Status</Form.Label>
                  <Form.Select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    disabled={updatingStatus}
                  >
                    <option value="pending">Pending (Awaiting action)</option>
                    <option value="reviewed">Reviewed (Under review)</option>
                    <option value="resolved">Resolved (Issue addressed)</option>
                    <option value="rejected">Rejected (Dismissed / invalid)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Admin Remarks <span className="text-muted fw-normal small">(Optional)</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter any notes or resolution remarks..."
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    disabled={updatingStatus}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              onClick={() => setStatusModalReport(null)}
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updatingStatus}>
              {updatingStatus ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Updating...
                </>
              ) : (
                "Save Status"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal show={Boolean(imagePreview)} onHide={() => setImagePreview("")} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="h6">Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-2 bg-dark">
          <img
            src={imagePreview}
            alt="Preview"
            className="img-fluid rounded"
            style={{ maxHeight: "75vh" }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Reports;
