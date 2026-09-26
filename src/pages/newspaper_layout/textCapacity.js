// Fixed font-size ke hisaab se ek block me kitna text (characters) fit hoga, yeh calculate karta hai
const CHAR_WIDTH_FACTOR = 0.58; // Devanagari/Nirmala/Mangal average glyph width ≈ 0.58x font-size (px)
const TITLE_BAR_PADDING = 8;    // titleBar ka top+bottom padding (ArticleBlock.jsx ke styles.titleBar se match)
const COLUMN_GAP = 16;          // ArticleBlock.jsx me columnGap: '16px' se match

export const estimateCharacterLimit = ({
  blockHeight,
  blockWidth,
  columns = 1,
  padding = 6,
  bodyFontSize = 11,
  bodyLineHeight = 18,
  hasTitle = true,
  titleLineHeight = 20,
  hasSub = false,
  subFontSize = 9,
  hasImage = false,
  imageHeight = 170,
  hasByline = true,
}) => {
  // 1) Block ke andar available width (padding minus)
  const innerWidth = Math.max(0, blockWidth - padding * 2);
  const perColumnWidth = Math.max(
    0,
    (innerWidth - (columns - 1) * COLUMN_GAP) / columns
  );

  // 2) Fixed font-size ke hisaab se ek line me kitne characters aayenge
  const avgCharWidth = bodyFontSize * CHAR_WIDTH_FACTOR;
  const charsPerLine = Math.floor(perColumnWidth / avgCharWidth);

  // 3) Title/Sub/Image/Byline jo space le lete hain, wo height se minus karo
  const reservedHeight =
    padding * 2 +
    (hasTitle ? titleLineHeight + TITLE_BAR_PADDING : 0) +
    (hasSub ? subFontSize + 6 : 0) +
    (hasImage ? imageHeight + 6 : 0) +
    (hasByline ? 16 : 0);

  const availableBodyHeight = Math.max(0, blockHeight - reservedHeight);

  // 4) Bache hue height me kitni lines aayengi (per column)
  const linesPerColumn = Math.floor(availableBodyHeight / bodyLineHeight);
  const totalLines = linesPerColumn * columns;

  return Math.max(0, charsPerLine * totalLines);
};