import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppToast from "../../components/common/AppToast";
import noImage from "../../assets/images/no-image.jpg";
import {
  NEWSPAPER_LIST_PATH,
  clearActiveNewspaper,
  createNewspaper,
  getActiveNewspaper,
  getApiErrorMessage,
  getFieldErrors,
  getNewspaper,
  clearPendingDesign,
  getPendingDesign,
  toDateInputValue,
  updateNewspaper,
} from "../../services/newspaperService";

const formatSize = (bytes = 0) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const todayInput = () => {
  const now = new Date();
  return toDateInputValue(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
};

const emptyValues = () => ({
  title: "",
  publishedForDate: todayInput(),
  description: "",
  isActive: true,
  isPublished: true, // user side par tabhi dikhta hai jab published ho — isliye Add me default ON
});

const FieldError = ({ message }) => (message ? <div className="text-danger small mt-1">{message}</div> : null);

// mode = "Add" | "Update"
const NewspaperForm = ({ mode = "Add" }) => {
  const navigate = useNavigate();
  const isUpdate = mode === "Update";

  const [record, setRecord] = useState(() => (isUpdate ? getActiveNewspaper() : null));
  // Designer se aaya (PDF + thumbnail + title/date) ho to Add form me pehle se bhar do
  const [design] = useState(() => (isUpdate ? null : getPendingDesign()));
  const [values, setValues] = useState(() => (record ? {
    title: record.title,
    publishedForDate: record.publishedForDate,
    description: record.description,
    isActive: record.isActive,
    isPublished: record.isPublished,
  } : {
    ...emptyValues(),
    ...(design ? { title: design.title || "", publishedForDate: design.publishedForDate || todayInput(), description: design.description || "" } : {}),
  }));
  const [thumbnailFile, setThumbnailFile] = useState(design?.thumbnailFile || null);
  const [pdfFile, setPdfFile] = useState(design?.pdfFile || null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ message: "", variant: "success" });
  const dirty = useRef(false); // user ne type karna shuru kar diya to late aayi server value usko overwrite na kare

  // Designer ka data form me aa gaya — ab memory se hata do (refresh par purani file na chipke)
  useEffect(() => {
    clearPendingDesign();
  }, []);

  // Update page direct khula aur active record nahi mila -> list par wapas
  useEffect(() => {
    if (isUpdate && !record?.id) navigate(NEWSPAPER_LIST_PATH, { replace: true });
  }, [isUpdate, record, navigate]);

  // Update: server se latest record laao (show endpoint na ho to list wala snapshot hi chalega)
  useEffect(() => {
    if (!isUpdate || !record?.id) return undefined;
    let active = true;
    getNewspaper(record.id)
      .then((fresh) => {
        if (!active || !fresh?.id) return;
        setRecord(fresh);
        if (dirty.current) return;
        setValues({
          title: fresh.title,
          publishedForDate: fresh.publishedForDate,
          description: fresh.description,
          isActive: fresh.isActive,
          isPublished: fresh.isPublished,
        });
      })
      .catch(() => { /* snapshot se kaam chalao */ });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, record?.id]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  const setField = (name, value) => {
    dirty.current = true;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: "" } : current));
  };

  const pickThumbnail = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, thumbnail: "Please select an image file." }));
      event.target.value = "";
      setThumbnailFile(null);
      return;
    }
    setErrors((current) => ({ ...current, thumbnail: "" }));
    setThumbnailFile(file);
  };

  const pickPdf = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setErrors((current) => ({ ...current, pdf: "Please select a PDF file." }));
      event.target.value = "";
      setPdfFile(null);
      return;
    }
    setErrors((current) => ({ ...current, pdf: "" }));
    setPdfFile(file);
  };

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = "Title is required.";
    if (!values.publishedForDate) next.published_for_date = "Published for date is required.";
    if (!isUpdate && !pdfFile) next.pdf = "PDF file is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !validate()) return;

    const payload = { ...values, thumbnailFile, pdfFile };
    const onUploadProgress = (progressEvent) => {
      if (progressEvent.total) setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
    };

    setSubmitting(true);
    setProgress(0);
    try {
      const result = isUpdate
        ? await updateNewspaper(record.id, payload, onUploadProgress)
        : await createNewspaper(payload, onUploadProgress);
      clearActiveNewspaper();
      sessionStorage.setItem(
        "moduleToast",
        result.message || (isUpdate ? "Newspaper updated successfully" : "Newspaper added successfully")
      );
      navigate(NEWSPAPER_LIST_PATH);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      setErrors((current) => ({ ...current, ...fieldErrors }));
      setToast({ message: getApiErrorMessage(error, "Unable to save newspaper. Please try again."), variant: "error" });
      setSubmitting(false);
    }
  };

  const currentThumbnail = thumbnailPreview || record?.thumbnailUrl || "";

  return (
    <div className="row">
      <div className="col-12">
        <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
          <h3 className="mb-1">{isUpdate ? "Update Newspaper" : "Add Newspaper"}</h3>
          {design && <span className="badge light badge-info">PDF designer se bana hai — check karke Save karein</span>}
        </div>
      </div>
      <AppToast show={Boolean(toast.message)} message={toast.message} variant={toast.variant} onClose={() => setToast((t) => ({ ...t, message: "" }))} />

      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    placeholder="Newspaper title"
                    maxLength={255}
                    value={values.title}
                    onChange={(event) => setField("title", event.target.value)}
                  />
                  <FieldError message={errors.title} />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Published For Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="published_for_date"
                    className={`form-control ${errors.published_for_date ? "is-invalid" : ""}`}
                    value={values.publishedForDate}
                    onChange={(event) => setField("publishedForDate", event.target.value)}
                  />
                  <FieldError message={errors.published_for_date} />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    rows={4}
                    placeholder="Short description"
                    value={values.description}
                    onChange={(event) => setField("description", event.target.value)}
                  />
                  <FieldError message={errors.description} />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Thumbnail (image)</label>
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    className={`form-control ${errors.thumbnail ? "is-invalid" : ""}`}
                    onChange={pickThumbnail}
                  />
                  <FieldError message={errors.thumbnail} />
                  <div className="mt-2 d-flex align-items-center gap-3">
                    <img
                      src={currentThumbnail || noImage}
                      alt="Thumbnail preview"
                      className="rounded border"
                      width="90"
                      height="116"
                      style={{ objectFit: "cover" }}
                      onError={(event) => { event.currentTarget.src = noImage; }}
                    />
                    <small className="text-muted">
                      {thumbnailFile
                        ? `${thumbnailFile.name} (${formatSize(thumbnailFile.size)})`
                        : isUpdate && record?.thumbnailUrl ? "Current thumbnail. Choose a new image to replace it." : "No thumbnail selected."}
                    </small>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">PDF {!isUpdate && <span className="text-danger">*</span>}</label>
                  <input
                    type="file"
                    name="pdf"
                    accept="application/pdf,.pdf"
                    className={`form-control ${errors.pdf ? "is-invalid" : ""}`}
                    onChange={pickPdf}
                  />
                  <FieldError message={errors.pdf} />
                  <div className="mt-2">
                    {pdfFile ? (
                      <small className="text-muted"><i className="fa fa-file-pdf me-1" />{pdfFile.name} ({formatSize(pdfFile.size)})</small>
                    ) : isUpdate && record?.pdfUrl ? (
                      <small>
                        <a href={record.pdfUrl} target="_blank" rel="noreferrer" className="text-primary">
                          <i className="fa fa-file-pdf me-1" />Current PDF
                        </a>
                        <span className="text-muted"> — choose a new PDF to replace it.</span>
                      </small>
                    ) : (
                      <small className="text-muted">No PDF selected.</small>
                    )}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input
                      id="newspaper-is-active"
                      type="checkbox"
                      className="form-check-input"
                      checked={values.isActive}
                      onChange={(event) => setField("isActive", event.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="newspaper-is-active">Active</label>
                  </div>
                  <FieldError message={errors.is_active} />
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input
                      id="newspaper-is-published"
                      type="checkbox"
                      className="form-check-input"
                      checked={values.isPublished}
                      onChange={(event) => setField("isPublished", event.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="newspaper-is-published">
                      {isUpdate ? "Published" : "Publish immediately"}
                    </label>
                  </div>
                  <FieldError message={errors.is_published} />
                </div>
              </div>

              {submitting && (
                <div className="progress mb-3" style={{ height: 18 }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                    {progress < 100 ? `Uploading ${progress}%` : "Saving..."}
                  </div>
                </div>
              )}

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    isUpdate ? "Update" : "Save"
                  )}
                </button>
                <Link to={NEWSPAPER_LIST_PATH} className={`btn btn-light ${submitting ? "disabled" : ""}`} onClick={() => isUpdate && clearActiveNewspaper()}>
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewspaperForm;