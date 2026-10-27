import React from "react";
import { allocateNewspaperPages } from "./allocationEngine";

import LayoutOne from "./layoutOne";
import LayoutTwo from "./layoutTwo";
import LayoutThree from "./layoutThree";
import Layoutfouth from "./layoutfouth";

// ─── Shared helpers ──────────────────────────────────────────────────────────
// Editor aur saved-list dono isi se base sections banate hain (taaki PDF = editor jaisa)
export const buildBaseSections = (newspaperData = {}) => ({
  header: newspaperData.header,
  headline: { title: newspaperData.title },
  masthead: {
    date: newspaperData.header?.date,
    title: newspaperData.header?.newspaperName,
    website: "www.rtinewsnetwork.com",
  },
  heading: { title: newspaperData.title },
  footer: newspaperData.footer,
  slogan: { text: "" },
});

export const LAYOUT_COMPONENTS = {
  layoutOne: LayoutOne,
  layoutTwo: LayoutTwo,
  layoutThree: LayoutThree,
  layoutfouth: Layoutfouth,
};

const safeFileName = (name = "e-paper") =>
  String(name).replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_").slice(0, 80) || "e-paper";

const waitForImages = (root, timeoutMs = 8000) =>
  new Promise((resolve) => {
    const images = Array.from(root.querySelectorAll("img"));
    const pending = images.filter((img) => !img.complete);
    if (pending.length === 0) return resolve();
    let left = pending.length;
    const done = () => {
      left -= 1;
      if (left <= 0) resolve();
    };
    pending.forEach((img) => {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
    setTimeout(resolve, timeoutMs);
  });

// Newspaper page ka asli element dhoondho (1056px wala page), nahi mile to wahi element
const findPageElement = (element) =>
  element.querySelector('[style*="width: 1056px"]') || element;

// ─── DOWNLOAD: element -> PDF file (browser me seedha download hota hai) ────
// Zaroori packages:  npm i html2canvas jspdf
export const downloadElementAsPdf = async (element, title = "e-paper") => {
  if (!element) throw new Error("Newspaper preview nahi mila.");

  const [{ default: html2canvas }, jsPdfModule] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const jsPDF = jsPdfModule.jsPDF || jsPdfModule.default;

  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
  await waitForImages(element);

  const target = findPageElement(element);
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: (clonedDoc) => {
      const style = clonedDoc.createElement("style");
      style.textContent = `
        .no-print { display: none !important; }
        .clickable-section, .clickable-section * { outline: none !important; }
        .manual-block-layer > .clickable-section { border: none !important; }
      `;
      clonedDoc.head.appendChild(style);
    },
  });

  const PAGE_WIDTH_MM = 297; // A3 portrait width (jaisa pehle tha)
  const pageHeightMm = (PAGE_WIDTH_MM * canvas.height) / canvas.width;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [PAGE_WIDTH_MM, pageHeightMm],
    compress: true,
  });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, PAGE_WIDTH_MM, pageHeightMm);
  pdf.save(`${safeFileName(title)}.pdf`);
};

// ─── DOWNLOAD: list page se (saved e-paper row) bina editor khole ───────────
// row.layoutData me jo draft save hua tha usi ko offscreen render karke PDF banata hai.
export const downloadSavedEPaper = async (row = {}) => {
  const layoutData = row.layoutData;
  if (!layoutData?.newspaperData) {
    throw new Error("Is e-paper ka layout saved nahi hai. Pehle editor me open karke Save karein.");
  }

  const { newspaperData, selectedTemplate = "layoutOne", adminOverrides = {} } = layoutData;
  const pages = allocateNewspaperPages({
    articles: newspaperData.articles || [],
    baseSections: buildBaseSections(newspaperData),
    adminOverrides,
    priorityLayout: selectedTemplate,
  });
  const page = pages.find((item) => item.layoutName === selectedTemplate) || pages[0];
  const LayoutComponent = LAYOUT_COMPONENTS[page.layoutName] || LayoutOne;

  const [{ createRoot }, { flushSync }] = await Promise.all([
    import("react-dom/client"),
    import("react-dom"),
  ]);

  // screen ke bahar (invisible) container
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-20000px;top:0;width:1200px;pointer-events:none;";
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    flushSync(() => {
      root.render(
        <LayoutComponent
          sections={page.sections}
          activeSection=""
          onSelectSection={() => {}}
          onSectionChange={() => {}}
        />
      );
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    await downloadElementAsPdf(host, row.title || newspaperData.title || "e-paper");
  } finally {
    root.unmount();
    host.remove();
  }
};