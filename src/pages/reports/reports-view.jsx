import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppToast from "../../components/common/AppToast";
import noImage from "../../assets/images/no-image.jpg";
import profilePlaceholder from "../../assets/images/avatar/1.jpg";
import { StatusBadge, TypeBadge } from "./reports";
import {
  REPORTS_LIST_PATH,
  formatReportDate,
  getActiveReport,
  getApiErrorMessage,
  getReportById,
  setActiveReport,
  updateReportStatus,
} from "../../services/reportsService";

const ReportsView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState(() => getActiveReport());
  const [toast, setToast] = useState({ message: "", variant: "success" });
  const [imagePreview, setImagePreview] = useState("");

  // Status Change State
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    () => (getActiveReport()?.status || "pending")
  );
  const [remarks, setRemarks] = useState(
    () => (getActiveReport()?.adminRemarks || "")
  );

  const notify = (message, variant = "success") => setToast({ message, variant });

  // If page refreshed or accessed with ?id=..., load report
  useEffect(() => {
    const queryId = searchParams.get("id");
    if (!report?.id && queryId) {
      getReportById(queryId)
        .then((fresh) => {
          if (fresh?.id) {
            setReport(fresh);
            setSelectedStatus(fresh.status || "pending");
            setRemarks(fresh.adminRemarks || "");
            setActiveReport(fresh);
          } else {
            navigate(REPORTS_LIST_PATH, { replace: true });
          }
        })
        .catch(() => navigate(REPORTS_LIST_PATH, { replace: true }));
    } else if (!report?.id && !queryId) {
      navigate(REPORTS_LIST_PATH, { replace: true });
    }
  }, [report, searchParams, navigate]);



  // Status update handler
  const handleStatusUpdate = async (nextStatus, statusRemarks = remarks) => {
    if (updating || !report?.id) return;
    setUpdating(true);
    try {
      const res = await updateReportStatus(report.id, nextStatus, statusRemarks);
      const updated = {
        ...report,
        status: nextStatus,
        adminRemarks: statusRemarks,
      };
      setReport(updated);
      setSelectedStatus(nextStatus);
      setActiveReport(updated);
      notify(res.message || `Status successfully updated to ${nextStatus}`, "success");
    } catch (error) {
      notify(getApiErrorMessage(error, "Failed to update status"), "error");
    } finally {
      setUpdating(false);
    }
  };

  if (!report?.id) {
    return (
      <div className="py-5 text-center text-muted">
        <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
        Loading report details...
      </div>
    );
  }

  return (
    <div className="row pb-5 mb-5" style={{ minHeight: "100%", overflowY: "visible" }}>
      {/* Toast Notification */}
      <AppToast
        show={Boolean(toast.message)}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((t) => ({ ...t, message: "" }))}
      />

      {/* Top Header Bar */}
      <div className="col-12 mb-3">
        <div className="card shadow-sm border-0">
          <div className="card-body py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <Link to={REPORTS_LIST_PATH} className="btn btn-outline-secondary btn-sm">
                <i className="fa fa-arrow-left me-1" />
                Back to Reports
              </Link>
              <div>
                <h4 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <span>Report #{report.id}</span>
                  <TypeBadge type={report.type} />
                  <StatusBadge status={report.status} />
                </h4>
                <small className="text-muted">
                  Reported on: {formatReportDate(report.createdAt)}
                </small>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="small text-muted fw-semibold me-1">Change Status:</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 140 }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={updating}
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3"
                disabled={updating || selectedStatus === report.status}
                onClick={() => handleStatusUpdate(selectedStatus)}
              >
                {updating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa fa-check me-1" />
                    Save Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Unified Details Card */}
      <div className="col-12">
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            
            {/* 1. Reason / Complaint Banner */}
            <div className="alert alert-danger bg-danger-subtle border-0 rounded-3 p-3 mb-4">
              <div className="d-flex align-items-start gap-2">
                <i className="fa fa-triangle-exclamation text-danger mt-1 font-18" />
                <div className="flex-grow-1">
                  <div className="fw-bold text-danger font-15">
                    Reason: {report.reason || "Not specified"}
                  </div>
                  {report.description && (
                    <div className="text-dark small mt-1" style={{ whiteSpace: "pre-line" }}>
                      {report.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Side-by-side Details Grid */}
            <div className="row g-4">
              {/* Reported Target (News Post or User Account) */}
              <div className="col-lg-6">
                <div className="border rounded-3 p-3 bg-light h-100">
                  <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 d-flex align-items-center justify-content-between">
                    <span>
                      <i className={`fa ${report.type === "news" ? "fa-newspaper" : "fa-user"} me-2`} />
                      Reported {report.type === "news" ? "News Post" : "User Account"}
                    </span>
                    <TypeBadge type={report.type} />
                  </h6>

                  {report.type === "news" ? (
                    <div>
                      {report.targetNews?.image && (
                        <div className="mb-3 text-center">
                          <img
                            src={report.targetNews.image}
                            alt="News Thumbnail"
                            className="rounded border img-fluid"
                            style={{ maxHeight: 180, objectFit: "cover", cursor: "pointer" }}
                            onClick={() => setImagePreview(report.targetNews.image)}
                            onError={(e) => { e.currentTarget.src = noImage; }}
                          />
                        </div>
                      )}
                      <table className="table table-sm table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td className="text-muted fw-semibold" style={{ width: 120 }}>News Title:</td>
                            <td className="fw-bold text-dark">{report.targetNews?.title || "-"}</td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold">News ID:</td>
                            <td>
                              <span className="badge bg-secondary text-white font-11">
                                #{report.targetNews?.id || "-"}
                              </span>
                            </td>
                          </tr>
                          {report.targetNews?.author && (
                            <tr>
                              <td className="text-muted fw-semibold">Author:</td>
                              <td>{report.targetNews.author}</td>
                            </tr>
                          )}
                          {report.targetNews?.content && (
                            <tr>
                              <td className="text-muted fw-semibold align-top">Content:</td>
                              <td className="text-muted small" style={{ whiteSpace: "pre-wrap" }}>
                                {report.targetNews.content}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <img
                          src={report.targetUser?.image || profilePlaceholder}
                          alt="User"
                          className="rounded-circle border"
                          style={{ width: 56, height: 56, objectFit: "cover" }}
                          onError={(e) => { e.currentTarget.src = profilePlaceholder; }}
                        />
                        <div>
                          <div className="fw-bold text-dark font-15">
                            {report.targetUser?.name || "User"}
                          </div>
                          <div className="text-muted small">
                            User ID: #{report.targetUser?.id || "-"}
                          </div>
                        </div>
                      </div>
                      <table className="table table-sm table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td className="text-muted fw-semibold" style={{ width: 120 }}>Name:</td>
                            <td className="fw-bold text-dark">{report.targetUser?.name || "-"}</td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold">Email:</td>
                            <td>{report.targetUser?.email || "-"}</td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold">Mobile:</td>
                            <td>{report.targetUser?.mobile || "-"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Reported By & Status Information */}
              <div className="col-lg-6">
                <div className="border rounded-3 p-3 bg-light h-100 d-flex flex-column justify-content-between">
                  <div>
                    {/* Reporter Info */}
                    <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                      <i className="fa fa-user-check me-2" />
                      Reported By (Reporter)
                    </h6>
                    <table className="table table-sm table-borderless mb-3">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-semibold" style={{ width: 130 }}>Reporter Name:</td>
                          <td className="fw-bold text-dark">{report.reporter?.name || "-"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">Reporter ID:</td>
                          <td>
                            <span className="badge bg-secondary text-white font-11">
                              #{report.reporter?.id || "-"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">Email:</td>
                          <td>{report.reporter?.email || "-"}</td>
                        </tr>
                        {report.reporter?.mobile && (
                          <tr>
                            <td className="text-muted fw-semibold">Mobile:</td>
                            <td>{report.reporter.mobile}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="text-muted fw-semibold">Reported At:</td>
                          <td>{formatReportDate(report.createdAt)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Admin Remarks section */}
                    <h6 className="fw-bold text-primary border-bottom pb-2 mb-2">
                      <i className="fa fa-notes-medical me-2" />
                      Admin Notes & Remarks
                    </h6>
                    <div className="mb-3">
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="Add resolution notes or remarks here..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={updating}
                      />
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="border-top pt-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-1">
                      <span className="small text-muted me-1">Quick Action:</span>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-xs"
                        disabled={updating || report.status === "resolved"}
                        onClick={() => handleStatusUpdate("resolved", remarks)}
                      >
                        <i className="fa fa-check me-1" />
                        Resolve
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs"
                        disabled={updating || report.status === "rejected"}
                        onClick={() => handleStatusUpdate("rejected", remarks)}
                      >
                        <i className="fa fa-ban me-1" />
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-info btn-xs"
                        disabled={updating || report.status === "reviewed"}
                        onClick={() => handleStatusUpdate("reviewed", remarks)}
                      >
                        <i className="fa fa-eye me-1" />
                        Review
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={updating}
                      onClick={() => handleStatusUpdate(selectedStatus, remarks)}
                    >
                      {updating ? "Saving..." : "Save Remarks"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1055 }}
          onClick={() => setImagePreview("")}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 bg-transparent text-center">
              <div className="modal-header border-0 pb-0 justify-content-end">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setImagePreview("")}
                />
              </div>
              <div className="modal-body p-2">
                <img
                  src={imagePreview}
                  alt="Full preview"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "80vh" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
