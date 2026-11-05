import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import AppToast from "../../components/common/AppToast";
import noImage from "../../assets/images/no-image.jpg";
import {
  DESIGNER_PATH,
  NEWSPAPER_LIST_PATH,
  deleteNewspaper,
  formatNewspaperDate,
  getApiErrorMessage,
  listNewspapers,
  publishNewspaper,
  setActiveNewspaper,
} from "../../services/newspaperService";

const PAGE_SIZE = 10;

const FILTERS = [
  ["", "All"],
  ["published", "Published"],
  ["draft", "Draft"],
  ["active", "Active"],
  ["inactive", "Inactive"],
];

export const ActiveBadge = ({ active }) => (
  <span className={`badge light badge-${active ? "success" : "danger"}`}>{active ? "Active" : "Inactive"}</span>
);

export const PublishBadge = ({ published }) => (
  <span className={`badge light badge-${published ? "primary" : "warning"}`}>{published ? "Published" : "Draft"}</span>
);

const Newspaper = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(() => {
    const message = sessionStorage.getItem("moduleToast");
    if (message) sessionStorage.removeItem("moduleToast");
    return { message: message || "", variant: "success" };
  });
  const [deleteRow, setDeleteRow] = useState(null);
  const [publishRow, setPublishRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const notify = (message, variant = "success") => setToast({ message, variant });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listNewspapers();
      // naya sabse upar (id descending), id na ho to server ka order
      setRows([...list].sort((a, b) => Number(b.id) - Number(a.id) || 0));
    } catch (error) {
      notify(getApiErrorMessage(error, "Unable to load newspapers from server"), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "published" && !row.isPublished) return false;
      if (filter === "draft" && row.isPublished) return false;
      if (filter === "active" && !row.isActive) return false;
      if (filter === "inactive" && row.isActive) return false;
      if (!term) return true;
      return [row.id, row.title, row.description, row.publishedForDate, formatNewspaperDate(row.publishedForDate)]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openView = (row) => {
    setActiveNewspaper(row);
    navigate(`${NEWSPAPER_LIST_PATH}/view`);
  };

  const confirmDelete = async () => {
    const target = deleteRow;
    if (!target || busy) return;
    setBusy(true);
    try {
      await deleteNewspaper(target.id);
      setRows((current) => current.filter((item) => item.id !== target.id));
      notify(`${target.title || "Newspaper"} deleted successfully`);
    } catch (error) {
      notify(getApiErrorMessage(error, "Delete failed. Please check server response."), "error");
    } finally {
      setBusy(false);
      setDeleteRow(null);
    }
  };

  const confirmPublish = async () => {
    const target = publishRow;
    if (!target || busy) return;
    setBusy(true);
    try {
      const result = await publishNewspaper(target.id);
      const saved = result.newspaper?.id ? result.newspaper : {};
      setRows((current) =>
        current.map((item) => (item.id === target.id ? { ...item, ...saved, id: item.id, isPublished: true } : item))
      );
      notify(result.message || `${target.title || "Newspaper"} published successfully`);
    } catch (error) {
      notify(getApiErrorMessage(error, "Publish failed. Please check server response."), "error");
    } finally {
      setBusy(false);
      setPublishRow(null);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
          <h3 className="mb-1">Newspaper</h3>
        </div>
      </div>
      <AppToast show={Boolean(toast.message)} message={toast.message} variant={toast.variant} onClose={() => setToast((t) => ({ ...t, message: "" }))} />

      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h4 className="card-title mb-0">Newspaper List</h4>
            <div className="d-flex align-items-center flex-wrap gap-2">
              <input
                type="search"
                className="form-control form-control-sm"
                style={{ minWidth: 200 }}
                placeholder="Search title / date..."
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              />
              <select
                className="form-select form-select-sm"
                style={{ minWidth: 130 }}
                value={filter}
                onChange={(event) => { setFilter(event.target.value); setPage(1); }}
              >
                {FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type="button" className="btn btn-light btn-sm" onClick={load} disabled={loading} title="Refresh">
                <i className={`fa fa-rotate ${loading ? "fa-spin" : ""}`} />
              </button>
              <Link to={DESIGNER_PATH} className="btn btn-warning btn-sm" title="News se newspaper design karein">
                <i className="fa fa-pen-ruler me-2" />
                Design Newspaper
              </Link>
              <Link to={`${NEWSPAPER_LIST_PATH}/add`} className="btn btn-primary btn-sm">
                <i className="fa fa-plus me-2" />
                Add Newspaper
              </Link>
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-responsive-md">
                <thead>
                  <tr>
                    <th>Sr.No</th>
                    <th>ID</th>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Published For</th>
                    <th>Status</th>
                    <th>Publish</th>
                    <th>PDF</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <span className="spinner-border spinner-border-sm me-2" />
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && !pageRows.length && (
                    <tr>
                      <td colSpan={9} className="text-center py-4">No records found</td>
                    </tr>
                  )}
                  {!loading && pageRows.map((row, index) => (
                    <tr key={row.id || index} style={{ cursor: "pointer" }} onClick={() => openView(row)}>
                      <td>{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                      <td>{row.id || "-"}</td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="border-0 bg-transparent p-0" onClick={() => setImagePreview(row.thumbnailUrl || noImage)}>
                          <img
                            src={row.thumbnailUrl || noImage}
                            alt={row.title}
                            className="rounded"
                            width="44"
                            height="56"
                            style={{ objectFit: "cover" }}
                            onError={(event) => { event.currentTarget.src = noImage; }}
                          />
                        </button>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <span className="d-inline-block text-truncate" style={{ maxWidth: 260 }} title={row.title}>{row.title || "-"}</span>
                      </td>
                      <td>{formatNewspaperDate(row.publishedForDate)}</td>
                      <td><ActiveBadge active={row.isActive} /></td>
                      <td><PublishBadge published={row.isPublished} /></td>
                      <td onClick={(event) => event.stopPropagation()}>
                        {row.pdfUrl ? (
                          <a href={row.pdfUrl} target="_blank" rel="noreferrer" className="text-primary">
                            <i className="fa fa-file-pdf me-1" />
                            Open
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <div className="d-flex gap-1">
                          <button type="button" className="btn btn-info shadow btn-xs sharp" title="View" onClick={() => openView(row)}>
                            <i className="fa fa-eye" />
                          </button>
                          <Link
                            to={`${NEWSPAPER_LIST_PATH}/update`}
                            className="btn btn-primary shadow btn-xs sharp"
                            title="Update"
                            onClick={() => setActiveNewspaper(row)}
                          >
                            <i className="fas fa-pen" />
                          </Link>
                          {!row.isPublished && (
                            <button type="button" className="btn btn-success shadow btn-xs sharp" title="Publish" onClick={() => setPublishRow(row)}>
                              <i className="fa fa-upload" />
                            </button>
                          )}
                          <button type="button" className="btn btn-danger shadow btn-xs sharp" title="Delete" onClick={() => setDeleteRow(row)}>
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav className="mt-3 d-flex justify-content-center">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${safePage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setPage(Math.max(1, safePage - 1))}>Previous</button>
                </li>
                <li className="page-item active">
                  <span className="page-link">{safePage} / {totalPages}</span>
                </li>
                <li className={`page-item ${safePage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setPage(Math.min(totalPages, safePage + 1))}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <Modal show={Boolean(deleteRow)} onHide={() => !busy && setDeleteRow(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete <strong>{deleteRow?.title || "this newspaper"}</strong>?</Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={() => setDeleteRow(null)} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={busy}>
            {busy ? "Deleting..." : "Delete"}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(publishRow)} onHide={() => !busy && setPublishRow(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Publish Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Publish <strong>{publishRow?.title || "this newspaper"}</strong> now?</Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={() => setPublishRow(null)} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-success" onClick={confirmPublish} disabled={busy}>
            {busy ? "Publishing..." : "Publish"}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(imagePreview)} onHide={() => setImagePreview("")} centered>
        <Modal.Body className="text-center">
          <img src={imagePreview} alt="Thumbnail" className="img-fluid" onError={(event) => { event.currentTarget.src = noImage; }} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Newspaper;