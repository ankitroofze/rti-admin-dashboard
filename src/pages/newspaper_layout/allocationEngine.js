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
// BEST-FIT AUTO-ALLOCATION: articles ko unke incoming array order mein nahi, balki
// unke text-size ke hisaab se sabse sahi-fit block ko diya jaata hai — bada article
// bade block ko, chhota article chhote block ko. Isse block me na text jyada cut hota
// hai, na hi bahut zyada khali jagah bachti hai.
//
// PURANA FIX (abhi bhi zinda hai): loop hamesha kam se kam layoutSequence.length (4)
// pages banayega — matlab layoutOne, layoutTwo, layoutThree, layoutfouth sabki ek-ek
// page hamesha exist karegi, chahe articles 0 hi kyun na hon. Isse selectedTemplate
// hamesha ek REAL generated page se match karta hai.
export const allocateNewspaperPages = ({
  articles = [],
  baseSections = {},
  adminOverrides = {},
  startPageNumber = 1,
} = {}) => {
  const queue = articles.map(normalizeArticle);

  // Step 1: kam se kam 4 pages + jitne bhi extra pages articles adjust karne ke liye
  // chahiye, unke saare FREE (locked/manual/removed nahi) block-slots collect karo
  const pageMetas = [];
  const freeSlots = [];
  let cycleIndex = 0;
  let freeSlotCount = 0;

  while (freeSlotCount < queue.length || cycleIndex < layoutSequence.length) {
    const layoutName = layoutSequence[cycleIndex % layoutSequence.length];
    const pageKey = `${layoutName}-${pageMetas.length}`;
    const pageOverrides = adminOverrides[pageKey] || {};

    getLayoutBlocks(layoutName).forEach((block) => {
      const override = pageOverrides[block.id];
      // Locked / manually-filled / removed blocks auto-fill pool mein nahi jaayenge
      if (override?.locked || override?.article || override?.removed) return;
      freeSlots.push({ pageKey, blockId: block.id, block });
      freeSlotCount += 1;
    });

    pageMetas.push({ pageKey, layoutName, pageOverrides });
    cycleIndex += 1;
    if (pageMetas.length > 500) break; // safety guard
  }

  // Step 2: sabse bade article ko pehle sabse chhote-fitting block do (best-fit
  // decreasing) — taaki bade blocks chhote articles ke paas na chale jaayein
  const sortedArticles = queue
    .map((article) => ({ article, length: stripHtml(article.body).length }))
    .sort((a, b) => b.length - a.length);

  const remainingSlots = [...freeSlots];
  const assignments = new Map(); // pageKey -> { blockId: articleData }

  sortedArticles.forEach(({ article, length }) => {
    if (remainingSlots.length === 0) return;

    let bestIndex = -1;
    let bestCapacity = Infinity;
    remainingSlots.forEach((slot, index) => {
      const capacity = slot.block.characterLimit || 0;
      // is article ka text jitne me pura aa jaaye, unme se sabse chhota block chuno
      if (capacity >= length && capacity < bestCapacity) {
        bestCapacity = capacity;
        bestIndex = index;
      }
    });

    if (bestIndex === -1) {
      // koi bhi block itna bada nahi mila jo pura text le sake — jo sabse bada
      // available block hai wahi do (taaki cut kam se kam ho)
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
    if (!assignments.has(slot.pageKey)) assignments.set(slot.pageKey, {});
    assignments.get(slot.pageKey)[slot.blockId] = { ...article, blockConfig: slot.block };
  });

  // Step 3: har page ke final sections banao — admin overrides + best-fit assignments merge
  const pages = pageMetas.map((meta, index) => {
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

  return pages;
};