import { getLayoutBlocks, layoutSequence } from "./newspaperLayouts";

// HTML tags hata ke plain text ka actual length nikalta hai (best-fit matching ke liye)
const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

const normalizeArticle = (article = {}, index = 0) => ({
  id: article.id || article.news_id || article.newsId || `article-${index}`,
  title: article.title || article.headline || article.news_title || "",
  sub: article.sub || article.subtitle || article.category || "",
  body: article.body || article.description || article.content || article.news || "",
  reporter: article.reporter || article.author || article.created_by || "",
  location: article.location || article.city || "",
  date: article.date || article.publishDate || article.published_at || article.createdAt || "",
  image: article.image || article.image_url || article.thumbnail || article.photo || "",
  estimatedHeight: Number(article.estimatedHeight || article.estimated_height || 260),
  design: article.design || {},
  imageSettings: article.imageSettings || {},
  layoutSettings: article.layoutSettings || {},
  raw: article,
});

const createBaseSections = (baseSections = {}) => ({
  header: baseSections.header,
  headline: baseSections.headline,
  masthead: baseSections.masthead,
  footer: baseSections.footer,
  slogan: baseSections.slogan,
});

const applyAdminOverrides = (sections, overrides = {}) => {
  Object.entries(overrides).forEach(([blockId, override]) => {
    if (!override) return;
    if (override.removed) {
      sections[blockId] = null;
      return;
    }
    if (override.article) {
      if (!override.article.blockConfig) {
        sections[blockId] = override.article;
        return;
      }
      sections[blockId] = {
        ...normalizeArticle(override.article),
        blockConfig: override.article.blockConfig,
      };
    }
  });
};
// ─── DUPLICATE PROTECTION ────────────────────────────────────────────────────
// Ek news ko pehchanne ke 2 tareeke: (1) id, (2) title+body ka signature.
// Dono me se koi bhi match ho to wo "same news" maani jaayegi.
const articleSignature = (article = {}) => {
  const title = stripHtml(article.title || article.headline || article.news_title || "")
    .replace(/\s+/g, " ").toLowerCase();
  const body = stripHtml(article.body || article.description || article.content || article.news || "")
    .replace(/\s+/g, " ").toLowerCase().slice(0, 120);
  return title || body ? `${title}|${body}` : "";
};

export const getArticleKeys = (article = {}) => {
  const keys = [];
  const id = article.id ?? article.news_id ?? article.newsId;
  if (id !== undefined && id !== null && String(id) !== "") keys.push(`id:${id}`);
  const sig = articleSignature(article);
  if (sig) keys.push(`sig:${sig}`);
  return keys;
};

// Same news ek hi baar rakhta hai (pehli wali). Order same rehta hai.
export const dedupeArticles = (list = []) => {
  const seen = new Set();
  return list.filter((article) => {
    const keys = getArticleKeys(article);
    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
};

// existing me jo news already hai use chhodke baaki incoming news jodta hai
export const mergeUniqueArticles = (existing = [], incoming = []) =>
  dedupeArticles([...(existing || []), ...(incoming || [])]);

// Saare pages me jo bhi news kisi block me use ho rahi hai uski keys
export const collectUsedArticleKeys = (pages = []) => {
  const used = new Set();
  pages.forEach((page) => {
    Object.entries(page.sections || {}).forEach(([blockId, section]) => {
      if (!section || typeof section !== "object") return;
      if (["header", "headline", "masthead", "footer", "slogan", "heading"].includes(blockId)) return;
      getArticleKeys(section).forEach((key) => used.add(key));
    });
  });
  return used;
};

// AUTO-ALLOCATION (no repeat):
//  1. Pehle duplicate news hata di jaati hai.
//  2. Jo news admin ne manually kisi block me daal di (ya edit karke lock kar di)
//     wo auto-pool se nikal di jaati hai -> wo dusre block me dobara nahi aayegi.
//  3. Jo page abhi screen par selected hai (priorityLayout) use SABSE PEHLE bhara
//     jaata hai, taaki dikhne wale page ka har block News module ki news se bhare.
//     Phir baaki pages order se bharte hain.
//  4. Har page ke andar best-fit: bada article bade block ko, chhota chhote ko.
//  5. Har news sirf EK baar use hoti hai. News kam ho to extra blocks khali rahenge
//     (repeat nahi honge).
//
// Kam se kam layoutSequence.length (4) pages hamesha banenge taaki selectedTemplate
// hamesha ek REAL generated page se match kare.
export const allocateNewspaperPages = ({
  articles = [],
  baseSections = {},
  adminOverrides = {},
  startPageNumber = 1,
  priorityLayout = "",
} = {}) => {
  // manual/edited blocks ki news ki keys (ye auto pool me nahi jaayengi)
  const manualKeys = new Set();
  Object.values(adminOverrides || {}).forEach((pageOverrides) => {
    Object.values(pageOverrides || {}).forEach((override) => {
      if (override?.article) getArticleKeys(override.article).forEach((key) => manualKeys.add(key));
    });
  });

  const queue = dedupeArticles(articles.map(normalizeArticle)).filter(
    (article) => !getArticleKeys(article).some((key) => manualKeys.has(key))
  );

  // Step 1: pages + unke FREE slots collect karo
  const pageMetas = [];
  let cycleIndex = 0;
  let freeSlotCount = 0;

  while (freeSlotCount < queue.length || cycleIndex < layoutSequence.length) {
    const layoutName = layoutSequence[cycleIndex % layoutSequence.length];
    const pageKey = `${layoutName}-${pageMetas.length}`;
    const pageOverrides = adminOverrides[pageKey] || {};
    const freeSlots = [];

    getLayoutBlocks(layoutName).forEach((block) => {
      const override = pageOverrides[block.id];
      // Locked / manually-filled / removed blocks auto-fill pool mein nahi jaayenge
      if (override?.locked || override?.article || override?.removed) return;
      freeSlots.push({ blockId: block.id, block });
      freeSlotCount += 1;
    });

    pageMetas.push({ pageKey, layoutName, pageOverrides, freeSlots });
    cycleIndex += 1;
    if (pageMetas.length > 500) break; // safety guard
  }

  // Step 2: fill order — selected layout ka pehla page sabse pehle, phir baaki order se
  const priorityIndex = pageMetas.findIndex((meta) => meta.layoutName === priorityLayout);
  const fillOrder = pageMetas.map((_, index) => index);
  if (priorityIndex > 0) {
    fillOrder.splice(priorityIndex, 1);
    fillOrder.unshift(priorityIndex);
  }

  const assignments = new Map(); // pageKey -> { blockId: articleData }
  let cursor = 0;

  fillOrder.forEach((metaIndex) => {
    const meta = pageMetas[metaIndex];
    if (cursor >= queue.length || meta.freeSlots.length === 0) return;

    // is page ke liye agle N articles (N = free slots)
    const chunk = queue.slice(cursor, cursor + meta.freeSlots.length);
    cursor += chunk.length;

    const remainingSlots = [...meta.freeSlots];
    const pageAssignments = {};

    chunk
      .map((article) => ({ article, length: stripHtml(article.body).length }))
      .sort((a, b) => b.length - a.length)
      .forEach(({ article, length }) => {
        if (remainingSlots.length === 0) return;

        let bestIndex = -1;
        let bestCapacity = Infinity;
        remainingSlots.forEach((slot, index) => {
          const capacity = slot.block.characterLimit || 0;
          // jitne me pura text aaye, unme se sabse chhota block
          if (capacity >= length && capacity < bestCapacity) {
            bestCapacity = capacity;
            bestIndex = index;
          }
        });

        if (bestIndex === -1) {
          // koi block itna bada nahi — sabse bada available block do
          let maxCapacity = -1;
          remainingSlots.forEach((slot, index) => {
            const capacity = slot.block.characterLimit || 0;
            if (capacity > maxCapacity) {
              maxCapacity = capacity;
              bestIndex = index;
            }
          });
        }

        const [slot] = remainingSlots.splice(bestIndex, 1);
        pageAssignments[slot.blockId] = { ...article, blockConfig: slot.block };
      });

    assignments.set(meta.pageKey, pageAssignments);
  });

  // Step 3: har page ke final sections — admin overrides + auto assignments merge
  return pageMetas.map((meta, index) => {
    const sections = createBaseSections(baseSections);
    applyAdminOverrides(sections, meta.pageOverrides);

    const autoFilled = assignments.get(meta.pageKey) || {};
    Object.entries(autoFilled).forEach(([blockId, articleData]) => {
      sections[blockId] = articleData;
    });

    return {
      id: meta.pageKey,
      pageNumber: startPageNumber + index,
      layoutName: meta.layoutName,
      sections,
      adminOverrides: meta.pageOverrides,
    };
  });
};