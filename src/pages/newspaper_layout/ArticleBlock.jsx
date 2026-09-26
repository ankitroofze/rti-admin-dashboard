import React, { useEffect, useRef } from 'react';
import { estimateCharacterLimit } from './textCapacity';

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .trim();

const countWords = (value) => {
  const text = stripHtml(value);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
};

const fontFamilies = {
  roboto: 'Roboto, "Nirmala UI", Arial, sans-serif',
  arial: 'Arial, "Nirmala UI", sans-serif',
  nirmala: '"Nirmala UI", Arial, sans-serif',
  mangal: 'Mangal, "Nirmala UI", serif',
  times: '"Times New Roman", Times, serif',
  georgia: 'Georgia, "Times New Roman", serif',
  verdana: 'Verdana, Arial, sans-serif',
  tahoma: 'Tahoma, Arial, sans-serif',
};

export default function ArticleBlock({
  data = {},
  isMain = false,
  isEditing = false,
  columns = 1,
  allowImage = null,
  showColumnBorders = false,
  blockConfig: blockConfigProp = null,
  onDataChange,
}) {
  const articleData = data || {};
  const {
    title = articleData.headline || articleData.news_title || '',
    sub = articleData.subtitle || articleData.category || articleData.sub || '',
    body = articleData.body || articleData.description || articleData.content || articleData.news || '',
    reporter = articleData.reporter || articleData.author || articleData.created_by || '',
    location = articleData.city || '',
    date = articleData.date || articleData.publishDate || articleData.published_at || articleData.createdAt || '',
    image = articleData.image || articleData.image_url || articleData.thumbnail || articleData.photo || '',
  } = articleData;

   const blockConfig = blockConfigProp || articleData.blockConfig || {};
  const bodyColumns = blockConfig.columns || (isMain ? 3 : columns);
  const design = articleData.design || {};
  const imageSettings = articleData.imageSettings || {};
  const imageRemovedByUser = imageSettings.enabled === false;
  const shouldRenderImage = !imageRemovedByUser && allowImage !== false;
  const isImageOnly = articleData.type === 'image';
  const characterLimit = estimateCharacterLimit({
    blockHeight: blockConfig.blockHeight || 300,
    blockWidth: blockConfig.blockWidth || 300,
    columns: bodyColumns,
    padding: Number(design.blockPadding || (isMain ? 8 : 6)),
    bodyFontSize: Number(design.bodyFontSize || (isMain ? 12 : 11)),
    bodyLineHeight: Number(design.bodyLineHeight || (isMain ? 20 : 18)),
    hasTitle: !!title,
    titleLineHeight: Number(design.titleLineHeight || (isMain ? 25 : 20)),
    hasSub: !!sub,
    subFontSize: Number(design.subFontSize || 9),
    hasImage: shouldRenderImage && !!image,
    imageHeight: Number(imageSettings.height || 170),
    hasByline: !!(reporter || location || date),
  });
  const plainBody = stripHtml(body);
  const isLimitCrossed = plainBody.length > characterLimit;
  // Block me title/body/image kuch bhi nahi hai to ye poora khali maana jayega
  const hasVisibleContent = !!title || !!body || !!image;
  const imageFirst = (imageSettings.position || blockConfig.imagePosition || 'top') !== 'bottom';
   const imageWrapMode = imageRemovedByUser ? 'none' : (imageSettings.wrap || 'left');
  const titleWordCount = countWords(title);
  const subWordCount = countWords(sub);
  const bodyWordCount = countWords(body);
  const fontFamily = fontFamilies[design.fontFamily] || design.fontFamily || styles.article.fontFamily;
  const imageHeight = Number(imageSettings.height || 170);

    const articleRef = useRef(null);
  const [imageSelected, setImageSelected] = React.useState(false);

  // Sirf character-limit cross hone par truncate hota hai — container ki fixed height
  // aur "overflow: hidden" khud CSS (layout files) mein already handle hoti hai.
  const shouldTruncate = true;
  const displayBody = (isLimitCrossed && shouldTruncate)
    ? `${plainBody.slice(0, characterLimit).trim()}...`
    : body;

  const resizeHandlesNode = null;
  // ──────────────────────────────────────────────────────────────────

    const buildImageNode = (extraStyle = {}, imgExtraStyle = {}) => shouldRenderImage ? (
    <div
      onClick={(event) => {
        if (!isEditing) return;
        event.stopPropagation();
        setImageSelected(true);
      }}
      style={{
        ...styles.imageWrap,
        width: `${Number(imageSettings.width || 100)}%`,
        cursor: isEditing ? 'pointer' : 'default',
        alignSelf: imageSettings.align === 'center' ? 'center' : imageSettings.align === 'right' ? 'flex-end' : 'flex-start',
        outline: isEditing && imageSelected ? '2px solid #2563eb' : 'none',
        outlineOffset: '1px',
        ...extraStyle,
      }}
    >
      {image ? (
        <img
          src={image}
          alt="Article Visual Asset"
          style={{
            ...styles.image,
            height: `${imageHeight}px`,
            objectFit: imageSettings.fit || 'cover',
            ...imgExtraStyle,
          }}
        />
      ) : (
        <div style={{ ...styles.imagePlaceholder, height: `${imageHeight}px` }}>Image</div>
      )}
       {isEditing && imageSelected && (
        <button
          type="button"
          className="no-print"
          title="Remove image"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDataChange && onDataChange({
              ...articleData,
              imageSettings: { ...imageSettings, enabled: false },
            });
          }}
          style={styles.imageRemoveBtn}
        >
          x
        </button>
      )}
      {isEditing && imageSelected && imageWrapMode !== 'none' && (
        <button
          type="button"
          className="no-print"
          title="Flip to other side"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            const nextSide = imageWrapMode === 'left' ? 'right' : 'left';
            onDataChange && onDataChange({
              ...articleData,
              imageSettings: { ...imageSettings, wrap: nextSide },
            });
          }}
          style={styles.imageFlipBtn}
        >
          ⇄
        </button>
      )}
    </div>
  ) : null;
  const imageNode = buildImageNode();

    const galleryImages = Array.isArray(articleData.images) && articleData.images.length > 0
    ? articleData.images
    : (image ? [image] : []);

  const buildGalleryNode = () => {
    if (!shouldRenderImage || galleryImages.length === 0) return null;
    if (galleryImages.length === 1) return imageNode;
    const cols = galleryImages.length >= 4 ? 2 : galleryImages.length;
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '4px',
        marginBottom: '6px',
        width: '100%',
        flex: '0 0 auto',
      }}>
        {galleryImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Article Visual Asset ${i + 1}`}
            style={{
              width: '100%',
              height: `${Math.round(imageHeight / (galleryImages.length > 2 ? 1.6 : 1.3))}px`,
              objectFit: 'cover',
              display: 'block',
              border: '1px solid #777',
            }}
          />
        ))}
      </div>
    );
  };
  const wrappedImageNode = imageWrapMode !== 'none'
    ? buildImageNode({
        float: imageWrapMode,
        width: `${Number(imageSettings.width || 58)}%`,
        maxWidth: '100%',
        margin: imageWrapMode === 'left' ? '0 10px 6px 0' : '0 0 6px 10px',
        transform: 'none',
        display: 'block',
      })
    : null;

  if (isImageOnly) {
    return (
      <div
        ref={articleRef}
        style={{
          ...styles.article,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          padding: `${Number(design.blockPadding || 0)}px`,
          backgroundColor: design.blockBgColor || '#fff',
          ...(isEditing ? styles.editing : {}),
        }}
      >
        {imageNode || (
          <div style={{ ...styles.imagePlaceholder, height: '100%' }}>Image</div>
        )}
        {resizeHandlesNode}
      </div>
    );
  }

   return (
    <div
      ref={articleRef}
      onClick={() => imageSelected && setImageSelected(false)}
      style={{
        ...styles.article,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...(isMain ? styles.articleMain : {}),
        fontFamily,
        backgroundColor: design.blockBgColor || (isMain ? styles.articleMain.backgroundColor : styles.article.backgroundColor),
        padding: `${Number(design.blockPadding || (isMain ? 8 : 6))}px`,
        ...(isEditing ? styles.editing : {}),
      }}
    >
      {/* <div className="no-print" style={styles.wordBadge}>
        T {titleWordCount} / S {subWordCount} / B {bodyWordCount}
      </div> */}

      {!hasVisibleContent && (
        <div className="no-print" style={styles.emptyPlaceholder}>
          + Is block me content add karein
        </div>
      )}

      {!!title && (
        <div
          dangerouslySetInnerHTML={{ __html: title }}
          style={{
            ...styles.titleBar,
            backgroundColor: design.titleBgColor || styles.titleBar.backgroundColor,
            color: design.titleColor || styles.titleBar.color,
            fontSize: `${Number(design.titleFontSize || (isMain ? 19 : 15))}px`,
            lineHeight: `${Number(design.titleLineHeight || (isMain ? 25 : 20))}px`,
            letterSpacing: `${Number(design.titleLetterSpacing || 0)}px`,
            wordSpacing: `${Number(design.titleWordSpacing || 0)}px`,
            textAlign: isMain ? 'center' : 'left',
          }}
        />
      )}

          {!!sub && (
        <div
          dangerouslySetInnerHTML={{ __html: sub }}
          style={{
            fontSize: `${Number(design.subFontSize || 9)}px`,
            color: design.subColor || '#333',
            backgroundColor: design.subBgColor || 'transparent',
            display: 'inline-block',
            padding: design.subBgColor ? '2px 6px' : '0',
            marginBottom: '4px',
            fontWeight: 700,
            textAlign: isMain ? 'center' : 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        />
      )}

      {!title && <div style={styles.titleDivider} />}

      {imageWrapMode === 'none' && imageFirst && imageNode}

         {isEditing && !shouldRenderImage && (
        <button
          type="button"
          className="no-print"
          onClick={(event) => {
            event.stopPropagation();
            onDataChange && onDataChange({
              ...articleData,
              imageSettings: { ...imageSettings, enabled: true },
            });
          }}
          style={styles.imageAddBtn}
        >
          + Add Image
        </button>
      )}

           {!!body && (
        <div
          key={`col-${bodyColumns}-${plainBody.length}`}
          style={{
            columnCount: bodyColumns,
            columnGap: '16px',
            columnFill: 'auto',
            columnRule: bodyColumns > 1 ? '0.5px solid #d0d0d0' : 'none',
            WebkitColumnCount: bodyColumns,
            MozColumnCount: bodyColumns,
            fontSize: `${Number(design.bodyFontSize || (isMain ? 12 : 11))}px`,
            lineHeight: `${Number(design.bodyLineHeight || (isMain ? 20 : 18))}px`,
            letterSpacing: `${Number(design.bodyLetterSpacing || 0)}px`,
            wordSpacing: `${Number(design.bodyWordSpacing || 0)}px`,
            color: design.bodyColor || '#222',
            textAlign: 'justify',
            width: '100%',
            flex: shouldTruncate ? 1 : '0 0 auto',
            minHeight: 0,
            overflow: shouldTruncate ? 'hidden' : 'visible',
            boxSizing: 'border-box',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            ...(showColumnBorders && bodyColumns > 1 ? {
              borderLeft: '1px solid #ccc',
              borderRight: '1px solid #ccc',
              paddingLeft: '8px',
              paddingRight: '8px',
            } : {}),
          }}
        >
          {wrappedImageNode}
          <span dangerouslySetInnerHTML={{ __html: displayBody }} />
        </div>
      )}

      {!body && hasVisibleContent && (
        <div className="no-print" style={styles.bodyPlaceholder}>
          + Description add karein
        </div>
      )}

      {imageWrapMode === 'none' && !imageFirst && imageNode}

      {isLimitCrossed && isEditing && shouldTruncate && (
        <div style={styles.limitWarning}>Text limit is crossing for this newspaper block.</div>
      )}

      {(!!reporter || !!location || !!date) && (
        <div style={styles.byline}>
          {!!reporter && <span style={styles.bylineText}>{stripHtml(reporter)}</span>}
          {!!location && <span style={styles.bylineText}>{stripHtml(location)}</span>}
          {!!date && <span style={styles.bylineText}>{stripHtml(date)}</span>}
        </div>
      )}

      {resizeHandlesNode}
    </div>
  );
}

const styles = {
  article: {
    position: 'relative',
    padding: '6px',
    backgroundColor: '#fff',
    minHeight: '80px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    fontFamily: '"Noto Serif Devanagari", "Mangal", "Times New Roman", serif',
  },
  wordBadge: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    zIndex: 3,
    padding: '2px 5px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.92)',
    border: '1px solid #f59e0b',
    color: '#92400e',
    fontSize: '8px',
    fontWeight: 800,
    lineHeight: 1.2,
    pointerEvents: 'none',
  },
  articleMain: {
    backgroundColor: '#fffdf8',
    padding: '8px',
  },
  editing: {
    outline: '2px solid #ea580c',
    outlineOffset: '-2px',
  },
  titleBar: {
    backgroundColor: '#111',
    color: '#fff',
    padding: '4px 8px',
    marginBottom: '5px',
    borderTop: '1px solid #000',
    borderBottom: '1px solid #000',
    fontWeight: 900,
    letterSpacing: '0px',
    maxWidth: '100%',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
  titleDivider: {
    height: '1.5px',
    backgroundColor: '#111',
    marginBottom: '6px',
    width: '100%',
  },
  imageWrap: {
    marginBottom: '6px',
    border: '1px solid #777',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flex: '0 0 auto',
    resize: 'both',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    display: 'block',
  },
  imagePlaceholder: {
    width: '100%',
    height: '140px',
    backgroundColor: '#e5e5e5',
    color: '#777',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
  },
  byline: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '5px',
    paddingTop: '3px',
    borderTop: '0.5px solid #aaa',
    flexWrap: 'wrap',
    gap: '4px',
    width: '100%',
    boxSizing: 'border-box',
    flex: '0 0 auto',
    overflow: 'hidden',
  },
  bylineText: {
    fontSize: '8px',
    color: '#555',
    fontStyle: 'italic',
    fontFamily: 'inherit',
  },
  limitWarning: {
    marginTop: '4px',
    color: '#b00020',
    fontSize: '9px',
    fontWeight: 800,
    borderTop: '1px solid #b00020',
    paddingTop: '2px',
  },
   resizeHandleBase: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: '#ea580c',
    border: '1.5px solid #fff',
    borderRadius: '3px',
    zIndex: 10,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    zIndex: 11,
    width: '18px',
    height: '18px',
    border: '0',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: '11px',
    lineHeight: '18px',
    padding: 0,
    cursor: 'pointer',
  },
  imageFlipBtn: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    zIndex: 11,
    width: '18px',
    height: '18px',
    border: '0',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '11px',
    lineHeight: '18px',
    padding: 0,
    cursor: 'pointer',
  },
  emptyPlaceholder: {
    flex: 1,
    minHeight: '60px',
    border: '1.5px dashed #ea580c',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ea580c',
    fontSize: '11px',
    fontWeight: 700,
    textAlign: 'center',
    padding: '8px',
    boxSizing: 'border-box',
  },
  bodyPlaceholder: {
    marginTop: '6px',
    padding: '6px 8px',
    border: '1px dashed #f59e0b',
    borderRadius: '4px',
    color: '#92400e',
    fontSize: '10px',
    fontWeight: 700,
    textAlign: 'center',
  },
    imageAddBtn: {
    marginBottom: '6px',
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: 700,
    border: '1px dashed #ea580c',
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};