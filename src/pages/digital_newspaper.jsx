import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";

import API from "../api/api";
import axiosClient from "../api/axiosClient";
import { allocateNewspaperPages } from "./newspaper_layout/allocationEngine";
import { getBlockConfig } from "./newspaper_layout/newspaperLayouts";

import LayoutOne from "./newspaper_layout/layoutOne";
import LayoutTwo from "./newspaper_layout/layoutTwo";
import LayoutThree from "./newspaper_layout/layoutThree";
import Layoutfouth from "./newspaper_layout/layoutfouth";

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .trim();

const countWords = (value) => {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
};

const fontOptions = [
  ["roboto", "Roboto"],
  ["arial", "Arial"],
  ["nirmala", "Nirmala UI"],
  ["mangal", "Mangal"],
  ["times", "Times New Roman"],
  ["georgia", "Georgia"],
  ["verdana", "Verdana"],
  ["tahoma", "Tahoma"],
];

const marathiBody = "गावातील नागरिकांनी पाणीपुरवठा, रस्ते, शाळा आणि आरोग्य केंद्राच्या कामांबाबत प्रशासनाकडे सातत्याने पाठपुरावा केला. बैठकीत अधिकाऱ्यांनी सर्व अर्जांची माहिती तपासून वेळेत निर्णय देण्याचे आश्वासन दिले. माहिती अधिकाराच्या माध्यमातून मिळालेल्या कागदपत्रांमुळे अनेक प्रलंबित प्रश्नांना गती मिळाली असून ग्रामस्थांनी पारदर्शक कारभाराची मागणी केली आहे.";

const sampleArticles = [
  ["जिल्हा प्राथमिक कार्यकर्ते लाचेच्या प्रकरणात चर्चेत", "मुख्य वार्ता", 560, ""],
  ["माहिती आयोगाकडून नागरिकांना दिलासा", "प्रशासन", 310, ""],
  ["लाचलुचपत प्रतिबंधक कारवाईत अधिकारी ताब्यात", "विशेष अहवाल", 430, "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&auto=format&fit=crop"],
  ["ग्रामसभेत विकास आराखड्यावर चर्चा", "तालुका वार्ता", 390, ""],
  ["शहरातील रस्ते दुरुस्तीला सुरुवात", "नगरपालिका", 280, ""],
  ["महिला बचत गटांच्या उपक्रमाला प्रतिसाद", "समाज", 610, "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=900&auto=format&fit=crop"],
  ["District RTI Desk Reviews Pending Applications", "English Brief", 460, ""],
  ["तहसील कार्यालयात अर्ज निवारण शिबिर", "जिल्हा बातमी", 420, "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&auto=format&fit=crop"],
  ["शेतकऱ्यांच्या तक्रारींवर विशेष सुनावणी", "कृषी", 500, ""],
  ["आरोग्य केंद्रात नवीन सुविधा सुरू", "आरोग्य", 480, ""],
  ["युवक मंडळाचा स्वच्छता अभियानात सहभाग", "स्थानिक", 440, "https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=900&auto=format&fit=crop"],
  ["अधिकाऱ्यांनी जनतेशी संवाद साधला", "जनसंपर्क", 500, ""],
  ["Editorial: Public Records Must Remain Accessible", "Opinion", 330, ""],
  ["संपादकीय: जबाबदार नागरिकत्वाची गरज", "मत", 340, "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=900&auto=format&fit=crop"],
  ["माहिती अधिकार जनजागृती मोहीम व्यापक", "विशेष लेख", 510, ""],
  ["शाळा व्यवस्थापन समितीची बैठक संपन्न", "शिक्षण", 300, ""],
  ["सार्वजनिक सूचना व संपर्क माहिती", "सूचना", 260, ""],
].map(([title, category, estimatedHeight, image], index) => ({
  id: `sample-${index + 1}`,
  title,
  category,
  description: `${marathiBody} ${index % 4 === 0 ? marathiBody : ""}`,
  author: index % 3 === 0 ? "प्रतिनिधी" : "RTI News Network",
  location: index % 2 === 0 ? "कोल्हापूर" : "मुंबई",
  published_at: `2026-06-${String(10 + index).padStart(2, "0")}T09:00:00`,
  estimatedHeight,
  image,
}));

const extractArticleList = (payload) => {
  const candidates = [
    payload?.news,
    payload?.data?.news,
    payload?.data?.list,
    payload?.data?.data,
    payload?.records,
    payload?.items,
    payload?.data,
    payload,
  ];
  return candidates.find(Array.isArray) || [];
};

const moduleStorageKey = (slug) => `rti-module-${slug}`;
const activeRecordKey = (slug) => `rti-active-${slug}`;

const readStoredRows = (slug) => {
  try {
    const rows = JSON.parse(localStorage.getItem(moduleStorageKey(slug)) || "[]");
    return Array.isArray(rows) ? rows.filter((row) => row && typeof row === "object") : [];
  } catch {
    return [];
  }
};

const saveStoredRows = (slug, rows) => {
  localStorage.setItem(moduleStorageKey(slug), JSON.stringify(rows));
};

const recordKey = (row = {}) =>
  String(row._rowKey || row.id || row.news_id || row.newsId || row.title || "");

const activeEPaperRow = () => {
  const rows = readStoredRows("e-paper");
  const activeKey = sessionStorage.getItem(activeRecordKey("e-paper"));
  return rows.find((row) => recordKey(row) === activeKey) || {};
};
const normalizeNewsForBlock = (news = {}, index = 0) => ({
  id: news.id || news.news_id || news.newsId || `news-${index}`,
  userId: news.userId || news.user_id || news.profileId || "",
  title: news.title || news.tittle || news.headline || news.news_title || "Untitled News",
  sub: news.sub || news.sub_tittle || news.subtitle || news.category || news.report_type || "",
  body: news.body || news.description || news.content || news.news || "",
  reporter: news.reporter || news.author || news.created_by || "",
  location: news.location || news.city || "",
  date: news.date || news.publishDate || news.published_at || news.createdAt || news.created_at || "",
    image:
    news.image ||
    news.mediaFileUrl ||
    news.media_file_url ||
    news.media_url ||
    news.image_url ||
    news.thumbnail ||
    news.photo ||
    (Array.isArray(news.images) && news.images[0]) ||
    (Array.isArray(news.media) && news.media[0]) ||
    "",
  images: (
    Array.isArray(news.images) ? news.images :
    Array.isArray(news.media) ? news.media :
    Array.isArray(news.gallery) ? news.gallery :
    []
  ).filter(Boolean),
  estimatedHeight: Number(news.estimatedHeight || news.estimated_height || 260),
});
const printElementAsPdf = (element, title = "e-paper") => {
  if (!element) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const MARGIN_MM = 8;
  const PAGE_WIDTH_MM = 297; // A3 portrait width
  const PX_TO_MM = 0.264583; // 1px @ 96dpi = 0.264583mm

  const contentHeightPx = element.scrollHeight || 1500;
  // content height ko mm mein convert karo aur margins add karo, safety ke liye thoda extra
  const pageHeightMm = Math.ceil(contentHeightPx * PX_TO_MM) + (MARGIN_MM * 2) + 10;

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #fff; font-family: Arial, sans-serif; }
          @page { size: ${PAGE_WIDTH_MM}mm ${pageHeightMm}mm; margin: ${MARGIN_MM}mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .clickable-section { outline: none !important; }
            .no-print { display: none !important; }
            .no-print-outline, .no-print-outline * { outline: none !important; }
            .manual-block-layer > .clickable-section { border: none !important; }
          }
          .no-print { display: none !important; }
          .manual-block-layer > .clickable-section { border: none !important; }
          html, body { height: auto !important; overflow: visible !important; }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 350);
};
const DigitalNewspaper = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const isUpdateMode = location.pathname.includes("/update");
  const savedRow = useMemo(() => (isUpdateMode ? activeEPaperRow() : {}), [isUpdateMode]);
  const [newspaperData, setNewspaperData] = useState({
    id: savedRow.layoutData?.newspaperData?.id || savedRow.id || id || `EP-${Date.now()}`,
    title: "",
    template: "layoutOne",
    header: {
      newspaperName: "RTI News",
      date: new Date().toLocaleDateString("en-IN"),
      edition: "Daily Edition",
      price: "Rs.5",
    },
       articles: [],
    images: [],
    richContent: [],
    footer: {
      pageNumber: 1,
      totalPages: 1,
      copyright: "Copyright 2026 RTI News",
    },
  });

 const [selectedTemplate, setSelectedTemplate] = useState(savedRow.layoutData?.selectedTemplate || "layoutOne");
  const [newsModuleList, setNewsModuleList] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activePageId, setActivePageId] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [adminOverrides, setAdminOverrides] = useState(savedRow.layoutData?.adminOverrides || {});
  const [newsPickerOpen, setNewsPickerOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
   const [fetchStatus, setFetchStatus] = useState("New e-paper");

  useEffect(() => {
    if (savedRow.layoutData?.newspaperData) {
      setNewspaperData(savedRow.layoutData.newspaperData);
      setFetchStatus("Continuing saved e-paper draft");
      return;
    }
    let ignore = false;
    const loadNews = async () => {
      try {
        const response = await axiosClient.get(API.NEWS_INDEX, { timeout: 12000 });
        const fetched = extractArticleList(response.data);
        if (!ignore && fetched.length > 0) {
          setNewspaperData((current) => ({ ...current, articles: fetched.map(normalizeNewsForBlock) }));
          setFetchStatus("Fetched from News module");
        }
      } catch (error) {
        const localNews = readStoredRows("news").map(normalizeNewsForBlock);
        if (!ignore && localNews.length) {
          setNewspaperData((current) => ({ ...current, articles: localNews }));
          setFetchStatus("Loaded from saved News module");
        } else if (!ignore) {
          setFetchStatus("Showing sample filled newspaper");
        }
      }
    };
    loadNews();
    return () => {
      ignore = true;
    };
  }, [savedRow.layoutData]);

  // News Modules button ke dropdown ke liye hamesha LIVE News module data fetch karo
  useEffect(() => {
    let ignore = false;
    const loadNewsModuleList = async () => {
      try {
        const response = await axiosClient.get(API.NEWS_INDEX, { timeout: 12000 });
        const fetched = extractArticleList(response.data);
        if (!ignore && fetched.length > 0) {
          setNewsModuleList(fetched.map(normalizeNewsForBlock));
          return;
        }
      } catch (error) {
        // niche fallback try karenge
      }
      if (!ignore) {
        const localNews = readStoredRows("news").map(normalizeNewsForBlock);
        setNewsModuleList(localNews);
      }
    };
    loadNewsModuleList();
    return () => { ignore = true; };
  }, []);

  const baseSections = useMemo(() => ({
    header: newspaperData.header,
    headline: { title: newspaperData.title },
    masthead: {
      date: newspaperData.header.date,
      title: newspaperData.header.newspaperName,
      website: "www.rtinewsnetwork.com",
    },
    heading: { title: newspaperData.title },
    footer: newspaperData.footer,
        slogan: { text: "" },
  }), [newspaperData]);

  const generatedPages = useMemo(() => allocateNewspaperPages({
    articles: newspaperData.articles,
    baseSections,
    adminOverrides,
  }), [newspaperData.articles, baseSections, adminOverrides]);

  const selectedTemplatePage = generatedPages.find((page) => page.layoutName === selectedTemplate);
  const visiblePages = [
    selectedTemplatePage || {
      id: `${selectedTemplate}-preview`,
      pageNumber: 1,
      layoutName: selectedTemplate,
      sections: baseSections,
    },
  ];

  const selectedPage = generatedPages.find((page) => page.id === activePageId) || generatedPages[0];
  const selectedBlock = selectedPage?.sections?.[activeSection] || {};
 const newsOptions = newsModuleList;

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setNewspaperData((current) => ({ ...current, template }));
    setShowTemplateModal(false);
  };

  const handleExportPDF = async () => {
    printElementAsPdf(previewRef.current, newspaperData.title || "e-paper");
  };

  const buildEPaperRecord = () => ({
    ...savedRow,
    _rowKey: savedRow._rowKey || newspaperData.id,
    sr: savedRow.sr || Date.now(),
    id: newspaperData.id,
    title: newspaperData.title || savedRow.title || "Untitled E-Paper",
    pdfFiles: savedRow.pdfFiles || "Generated from editor",
    publishDate: newspaperData.header?.date || new Date().toLocaleDateString("en-IN"),
    totalPage: String(generatedPages.length || 1),
    layoutData: {
      newspaperData,
      selectedTemplate,
      adminOverrides,
    },
  });

  const handleSave = (message = "E-paper saved successfully") => {
    const record = buildEPaperRecord();
    const rows = readStoredRows("e-paper");
    const key = recordKey(record);
    const nextRows = rows.some((row) => recordKey(row) === key)
      ? rows.map((row) => recordKey(row) === key ? record : row)
      : [record, ...rows];
    saveStoredRows("e-paper", nextRows);
    sessionStorage.setItem(activeRecordKey("e-paper"), recordKey(record));
    setSaveMessage(message);
  };

  const handleSectionChange = (pageId, sectionId, updated) => {
    const page = generatedPages.find((item) => item.id === pageId);
    const blockConfig = page ? getBlockConfig(page.layoutName, sectionId) : null;
    setAdminOverrides((current) => ({
      ...current,
      [pageId]: {
        ...(current[pageId] || {}),
        [sectionId]: {
          ...(current[pageId]?.[sectionId] || {}),
          article: blockConfig ? { ...updated, blockConfig } : updated,
          locked: true,
        },
      },
    }));
  };

  const updateSelectedBlock = (field, value) => {
    if (!selectedPage || !activeSection) return;
    handleSectionChange(selectedPage.id, activeSection, {
      ...selectedBlock,
      [field]: value,
    });
  };

  const updateSelectedNested = (group, field, value) => {
    if (!selectedPage || !activeSection) return;
    const nextGroup = { ...(selectedBlock[group] || {}), [field]: value };
    updateSelectedBlock(group, nextGroup);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateSelectedBlock("image", reader.result || "");
    reader.readAsDataURL(file);
  };

  const applyRichTextCommand = (command, value = null) => {
    if (!activeSection) return;
    document.execCommand(command, false, value);
    const editor = document.getElementById("epaper-rich-body-editor");
    if (editor) updateSelectedBlock("body", editor.innerHTML);
  };

  const applyNewsToSelectedBlock = (news) => {
    if (!selectedPage || !activeSection || !news) return;
    const blockConfig = getBlockConfig(selectedPage.layoutName, activeSection);
    handleSectionChange(selectedPage.id, activeSection, {
      ...normalizeNewsForBlock(news),
      blockConfig,
    });
    setNewsPickerOpen(false);
  };

  const toggleLock = () => {
    if (!selectedPage || !activeSection) return;
    setAdminOverrides((current) => {
      const pageOverrides = current[selectedPage.id] || {};
      const block = pageOverrides[activeSection] || { article: selectedBlock };
      return {
        ...current,
        [selectedPage.id]: {
          ...pageOverrides,
          [activeSection]: { ...block, locked: !block.locked },
        },
      };
    });
  };

  const removeBlock = () => {
    if (!selectedPage || !activeSection) return;
    setAdminOverrides((current) => ({
      ...current,
      [selectedPage.id]: {
        ...(current[selectedPage.id] || {}),
        [activeSection]: { removed: true, locked: true },
      },
    }));
  };

  const renderTemplate = (page) => {
    const templateProps = {
      sections: page.sections,
      activeSection: activePageId === page.id ? activeSection : "",
      onSelectSection: (sectionId) => {
        setActivePageId(page.id);
        setActiveSection(sectionId);
        setNewsPickerOpen(false);
      },
      onSectionChange: (sectionId, updated) => handleSectionChange(page.id, sectionId, updated),
    };

    switch (page.layoutName) {
      case "layoutOne":
        return <LayoutOne {...templateProps} />;
      case "layoutTwo":
        return <LayoutTwo {...templateProps} />;
      case "layoutThree":
        return <LayoutThree {...templateProps} />;
      case "layoutfouth":
        return <Layoutfouth {...templateProps} />;
      default:
        return <LayoutOne {...templateProps} />;
    }
  };

  return (
    <div className="digital-newspaper-container" style={styles.shell}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Digital Newspaper Editor</h3>
          <small className="text-muted">{fetchStatus}</small>
        </div>
        <div className="btn-group">
          <button className="btn btn-success" onClick={handleSave}>
            <i className="fa fa-save me-2" />
            Save
          </button>
          <button className="btn btn-light" onClick={() => navigate("/admin/e-paper")}>
            <i className="fa fa-arrow-left me-2" />
            Back
          </button>
          <button className="btn btn-info" onClick={() => setShowTemplateModal(true)}>
            <i className="fa fa-plus me-2" />
            Templates
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <i className="fa fa-file-pdf me-2" />
            Export PDF
          </button>
        </div>
      </div>
      {saveMessage && <div className="alert alert-success py-2">{saveMessage}</div>}

      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            {[
              ["layoutOne", "Template 1", "Front Page"],
              ["layoutTwo", "Template 2", "District News"],
              ["layoutThree", "Template 3", "Local News"],
              ["layoutfouth", "Template 4", "Editorial"],
            ].map(([key, title, sub]) => (
              <div className="col-md-3 mb-3" key={key}>
                <div
                  className="card cursor-pointer template-card"
                  onClick={() => handleSelectTemplate(key)}
                  style={{
                    border: selectedTemplate === key ? "2px solid #007bff" : "1px solid #ddd",
                    cursor: "pointer",
                  }}
                >
                  <div className="card-body text-center">
                    <h6>{title}</h6>
                    <p className="text-muted small mb-0">{sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      <div className="row">
        <div className="col-lg-9" ref={previewRef}>
          {visiblePages.map((page) => (
            <div key={page.id} className="mb-4">
              {renderTemplate(page)}
            </div>
          ))}
        </div>
        <div className="col-lg-3">
          <div className="card">
            <div className="card-header">
              <h5>Block Editor</h5>
            </div>
            <div className="card-body">
              <p className="small text-muted mb-2">
                {selectedPage && activeSection ? `${selectedPage.layoutName} / ${activeSection}` : "Select any newspaper block"}
              </p>
              <div className="mb-3 position-relative">
                <button
                  type="button"
                  className="btn btn-outline-primary w-100"
                  disabled={!activeSection}
                  onClick={() => setNewsPickerOpen((value) => !value)}
                >
                  <i className="fa fa-newspaper me-2" />
                  News Modules
                </button>
                {activeSection && newsPickerOpen && (
                  <div style={styles.newsDropdown}>
                    {newsOptions.map((news, index) => (
                      <button
                        type="button"
                        className="dropdown-item text-start"
                        key={`${news.id}-${index}`}
                        onClick={() => applyNewsToSelectedBlock(news)}
                      >
                        <strong>{news.userId ? `${news.userId} - ` : ""}{news.title}</strong>
                        <small className="d-block text-muted">{news.sub || news.reporter || "News module"}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="alert alert-light border py-2 small">
                <strong>Words:</strong> Heading {countWords(selectedBlock.title)} | Sub {countWords(selectedBlock.sub)} | Body {countWords(selectedBlock.body)}
              </div>
              {selectedBlock.type !== "image" && (
                <>
                  <label className="form-label small mb-1">Heading</label>
                  <input className="form-control mb-2" placeholder="Title" value={selectedBlock.title || ""} onChange={(event) => updateSelectedBlock("title", event.target.value)} disabled={!activeSection} />
                  <label className="form-label small mb-1">Subheading</label>
                  <input className="form-control mb-2" placeholder="Subtitle / Category" value={selectedBlock.sub || ""} onChange={(event) => updateSelectedBlock("sub", event.target.value)} disabled={!activeSection} />
                  <label className="form-label small mb-1">Body</label>
                  <div className="btn-group btn-group-sm w-100 mb-2" role="group">
                    <button type="button" className="btn btn-outline-secondary" disabled={!activeSection} onMouseDown={(event) => event.preventDefault()} onClick={() => applyRichTextCommand("bold")}>B</button>
                    <button type="button" className="btn btn-outline-secondary" disabled={!activeSection} onMouseDown={(event) => event.preventDefault()} onClick={() => applyRichTextCommand("italic")}>I</button>
                    <button type="button" className="btn btn-outline-secondary" disabled={!activeSection} onMouseDown={(event) => event.preventDefault()} onClick={() => applyRichTextCommand("underline")}>U</button>
                    <button type="button" className="btn btn-outline-secondary" disabled={!activeSection} onMouseDown={(event) => event.preventDefault()} onClick={() => applyRichTextCommand("fontSize", "2")}>A-</button>
                    <button type="button" className="btn btn-outline-secondary" disabled={!activeSection} onMouseDown={(event) => event.preventDefault()} onClick={() => applyRichTextCommand("fontSize", "4")}>A+</button>
                  </div>
                  <div
                    id="epaper-rich-body-editor"
                    key={`${activePageId}-${activeSection}`}
                    className="form-control mb-3"
                    contentEditable={!!activeSection}
                    suppressContentEditableWarning
                    style={styles.richEditor}
                    onInput={(event) => updateSelectedBlock("body", event.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: selectedBlock.body || "" }}
                  />
                </>
              )}

              <h6 className="mb-2">Text Style</h6>
              <select className="form-select form-select-sm mb-2" value={selectedBlock.design?.fontFamily || "roboto"} onChange={(event) => updateSelectedNested("design", "fontFamily", event.target.value)} disabled={!activeSection}>
                {fontOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <div style={styles.formGrid}>
               <label className="small">Sub size<input className="form-control form-control-sm" type="number" min="6" max="40" value={selectedBlock.design?.subFontSize || 9} onChange={(event) => updateSelectedNested("design", "subFontSize", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Body size<input className="form-control form-control-sm" type="number" min="7" max="32" value={selectedBlock.design?.bodyFontSize || 11} onChange={(event) => updateSelectedNested("design", "bodyFontSize", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Heading line gap<input className="form-control form-control-sm" type="number" min="8" max="90" value={selectedBlock.design?.titleLineHeight || 20} onChange={(event) => updateSelectedNested("design", "titleLineHeight", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Body line gap<input className="form-control form-control-sm" type="number" min="8" max="60" value={selectedBlock.design?.bodyLineHeight || 18} onChange={(event) => updateSelectedNested("design", "bodyLineHeight", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Heading text gap<input className="form-control form-control-sm" type="number" min="-2" max="12" step="0.25" value={selectedBlock.design?.titleLetterSpacing || 0} onChange={(event) => updateSelectedNested("design", "titleLetterSpacing", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Body text gap<input className="form-control form-control-sm" type="number" min="-2" max="12" step="0.25" value={selectedBlock.design?.bodyLetterSpacing || 0} onChange={(event) => updateSelectedNested("design", "bodyLetterSpacing", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Heading word gap<input className="form-control form-control-sm" type="number" min="-4" max="24" step="0.5" value={selectedBlock.design?.titleWordSpacing || 0} onChange={(event) => updateSelectedNested("design", "titleWordSpacing", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Body word gap<input className="form-control form-control-sm" type="number" min="-4" max="24" step="0.5" value={selectedBlock.design?.bodyWordSpacing || 0} onChange={(event) => updateSelectedNested("design", "bodyWordSpacing", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Padding<input className="form-control form-control-sm" type="number" min="0" max="30" value={selectedBlock.design?.blockPadding || 6} onChange={(event) => updateSelectedNested("design", "blockPadding", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Heading color<input className="form-control form-control-color w-100" type="color" value={selectedBlock.design?.titleColor || "#ffffff"} onChange={(event) => updateSelectedNested("design", "titleColor", event.target.value)} disabled={!activeSection} /></label>
           <label className="small">Sub bg<input className="form-control form-control-color w-100" type="color" value={selectedBlock.design?.subBgColor || "#ffffff"} onChange={(event) => updateSelectedNested("design", "subBgColor", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Body color<input className="form-control form-control-color w-100" type="color" value={selectedBlock.design?.bodyColor || "#222222"} onChange={(event) => updateSelectedNested("design", "bodyColor", event.target.value)} disabled={!activeSection} /></label>
                <label className="small">Block bg<input className="form-control form-control-color w-100" type="color" value={selectedBlock.design?.blockBgColor || "#ffffff"} onChange={(event) => updateSelectedNested("design", "blockBgColor", event.target.value)} disabled={!activeSection} /></label>
              </div>

              <hr />
              <h6 className="mb-2">Image</h6>
              <input className="form-control mb-2" placeholder="Image URL" value={selectedBlock.image || ""} onChange={(event) => updateSelectedBlock("image", event.target.value)} disabled={!activeSection} />
              <input className="form-control form-control-sm mb-2" type="file" accept="image/*" onChange={handleImageUpload} disabled={!activeSection} />
              <div style={styles.formGrid}>
                <label className="small">Position<select className="form-select form-select-sm" value={selectedBlock.imageSettings?.position || "top"} onChange={(event) => updateSelectedNested("imageSettings", "position", event.target.value)} disabled={!activeSection}><option value="top">Top</option><option value="bottom">Bottom</option></select></label>
                <label className="small">Align<select className="form-select form-select-sm" value={selectedBlock.imageSettings?.align || "left"} onChange={(event) => updateSelectedNested("imageSettings", "align", event.target.value)} disabled={!activeSection}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm" type="button" onClick={() => handleSave("Selected block saved")} disabled={!activeSection}>Save Block</button>
                <button className="btn btn-outline-primary btn-sm" type="button" onClick={toggleLock} disabled={!activeSection}>Lock / Unlock</button>
                <button className="btn btn-outline-danger btn-sm" type="button" onClick={removeBlock} disabled={!activeSection}>Remove</button>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  shell: {
    background: "#d9d9d9",
    padding: "12px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  },
  richEditor: {
    minHeight: "130px",
    maxHeight: "240px",
    overflow: "auto",
    fontSize: "13px",
    lineHeight: 1.45,
  },
  newsDropdown: {
    position: "absolute",
    zIndex: 20,
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: "280px",
    overflow: "auto",
    background: "#fff",
    border: "1px solid #d5d5d5",
    borderRadius: "6px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
  },
};

export default DigitalNewspaper;