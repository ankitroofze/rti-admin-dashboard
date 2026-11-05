import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import AppToast from "../../components/common/AppToast";
import noImage from "../../assets/images/no-image.jpg";
import { ActiveBadge, PublishBadge } from "./newspaper";
import {
  NEWSPAPER_LIST_PATH,
  formatNewspaperDate,
  formatNewspaperDateTime,
  getActiveNewspaper,
  getApiErrorMessage,
  getNewspaper,
  publishNewspaper,
  setActiveNewspaper,
} from "../../services/newspaperService";

const DetailRow = ({ label, children }) => (
  <div className="row mb-3">
    <div className="col-sm-4 col-md-3 text-muted">{label}</div>
    <div className="col-sm-8 col-md-9">{children || "-"}</div>
  </div>
);

const NewspaperView = () => {
  const navigate = useNavigate();
  const [row, setRow] = useState(() => getActiveNewspaper());
  const [toast, setToast] = useState({ message: "", variant: "success" });
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!row?.id) navigate(NEWSPAPER_LIST_PATH, { replace: true });
  }, [row, navigate]);

  // Latest data server se (show endpoint na ho to list wala snapshot dikhta rahega)
  useEffect(() => {
    if (!row?.id) return undefined;
    let active = true;
    getNewspaper(row.id)
      .then((fresh) => {
        if (!active || !fresh?.id) return;
        setRow(fresh);
        setActiveNewspaper(fresh);
      })
      .catch(() => { /* snapshot se kaam chalao */ });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.id]);

  const handlePublish = async () => {
    if (busy || !row) return;
    setBusy(true);
    try {
      const result = await publishNewspaper(row.id);
      const saved = result.newspaper?.id ? result.newspaper : {};
      const next = { ...row, ...saved, id: row.id, isPublished: true };
      setRow(next);
      setActiveNewspaper(next);
      setToast({ message: result.message || "Newspaper published successfully", variant: "success" });
    } catch (error) {
      setToast({ message: getApiErrorMessage(error, "Publish failed. Please check server response."), variant: "error" });
    } finally {
      setBusy(false);
      setConfirmPublish(false);
    }
  };

  if (!row?.id) return null;

  return (
    <div className="row">
      <div className="col-12">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <h3 className="mb-1">Newspaper Details</h3>
          <div className="d-flex gap-2">
            <Link to={NEWSPAPER_LIST_PATH} className="btn btn-light btn-sm">
              <i className="fa fa-arrow-left me-2" />
              Back
            </Link>
            <Link to={`${NEWSPAPER_LIST_PATH}/update`} className="btn btn-primary btn-sm" onClick={() => setActiveNewspaper(row)}>
              <i className="fas fa-pen me-2" />
              Update
            </Link>
            {!row.isPublished && (
              <button type="button" className="btn btn-success btn-sm" onClick={() => setConfirmPublish(true)}>
                <i className="fa fa-upload me-2" />
                Publish
              </button>
            )}
          </div>
        </div>
      </div>
      <AppToast show={Boolean(toast.message)} message={toast.message} variant={toast.variant} onClose={() => setToast((t) => ({ ...t, message: "" }))} />

      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 mb-3 text-center">
                <img
                  src={row.thumbnailUrl || noImage}
                  alt={row.title}
                  className="img-fluid rounded border"
                  style={{ maxHeight: 320, objectFit: "cover" }}
                  onError={(event) => { event.currentTarget.src = noImage; }}
                />
              </div>
              <div className="col-md-9">
                <DetailRow label="ID">{row.id}</DetailRow>
                <DetailRow label="Title">{row.title}</DetailRow>
                <DetailRow label="Published For">{formatNewspaperDate(row.publishedForDate)}</DetailRow>
                <DetailRow label="Description"><span style={{ whiteSpace: "pre-wrap" }}>{row.description}</span></DetailRow>
                <DetailRow label="Status"><ActiveBadge active={row.isActive} /></DetailRow>
                <DetailRow label="Publish"><PublishBadge published={row.isPublished} /></DetailRow>
                {row.publishedAt && <DetailRow label="Published At">{formatNewspaperDateTime(row.publishedAt)}</DetailRow>}
                <DetailRow label="PDF">
                  {row.pdfUrl ? (
                    <a href={row.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
                      <i className="fa fa-file-pdf me-2" />
                      Open PDF
                    </a>
                  ) : null}
                </DetailRow>
                {row.createdAt && <DetailRow label="Created At">{formatNewspaperDateTime(row.createdAt)}</DetailRow>}
                {row.updatedAt && <DetailRow label="Updated At">{formatNewspaperDateTime(row.updatedAt)}</DetailRow>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={confirmPublish} onHide={() => !busy && setConfirmPublish(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Publish Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Publish <strong>{row.title}</strong> now?</Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={() => setConfirmPublish(false)} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-success" onClick={handlePublish} disabled={busy}>
            {busy ? "Publishing..." : "Publish"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NewspaperView;