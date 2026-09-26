import React from 'react';
import HeaderBlock from './HeaderBlock';
import HeadlineBlock from './HeadlineBlock';
import ArticleBlock from './ArticleBlock';
import FooterBlock from './FooterBlock';
import { getBlockConfig } from './newspaperLayouts';

const NEWSPAPER_WIDTH = 1056;
const NEWSPAPER_HEIGHT = 2112;

export default function LayoutOne({
  sections = {},
  activeSection,
  onSelectSection,
  onSectionChange,
}) {
  const sel = (id) => activeSection === id;
  const press = (id) => () => onSelectSection && onSelectSection(id);
  const cfg = (id) => getBlockConfig('layoutOne', id) || {};

  return (
    <div style={styles.pageWrapper}>



      {/* Web Centered Scroll Container */}
      <div style={styles.scrollContainer}>
        <div style={styles.page}>




          {/* ── Header ── */}
          <div 
            className="clickable-section"
            onClick={press('header')}
            role="button"
            tabIndex={0}
          >
            <HeaderBlock
              data={sections.header}
              isEditing={sel('header')}
              onDataChange={(updated) => onSectionChange && onSectionChange('header', updated)}
            />
          </div>




          {/* ── Full Width Heading Block ── */}
          <div 
            className="clickable-section"
            style={styles.fullWidthHeading}
            onClick={press('heading')}
            role="button"
            tabIndex={0}
          >
            <div
              className="no-print"
              style={styles.headingWordCount}
            >
              {String(sections.heading?.title || 'Section Title').trim().split(/\s+/).filter(Boolean).length} words
            </div>
            <div
              style={{
                ...styles.headingContent,
                backgroundColor: sections.heading?.design?.titleBgColor || 'transparent',
                color: sections.heading?.design?.titleColor || styles.headingContent.color,
                fontSize: `${Number(sections.heading?.design?.titleFontSize || 54)}px`,
                fontFamily: sections.heading?.design?.fontFamily || styles.headingContent.fontFamily,
              }}
            >
              {sections.heading?.title || 'Section Title'}
            </div>
          </div>



        
          <div style={styles.mainRow}>

            
            <div style={{ ...styles.colLeft, ...styles.borderRight }}>

              {/* Left Big Article ~65% height */}
              <div
                className="clickable-section"
                style={{ ...styles.leftBig, ...styles.borderBottom }}
                onClick={press('left_big')}
                role="button"
                tabIndex={0}
              >
                <ArticleBlock
                  data={sections.left_big}
                  blockConfig={cfg('left_big')}
                  isEditing={sel('left_big')}
                  onDataChange={(updated) => onSectionChange && onSectionChange('left_big', updated)}
                />
              </div>




              {/* Left Small — bordered box ~35% height */}
              <div
                className="clickable-section"
                style={styles.leftSmallWrapper}
                onClick={press('left_small')}
                role="button"
                tabIndex={0}
              >
                <div style={styles.leftSmallBox}>
                  <ArticleBlock
                    data={sections.left_small}
                    blockConfig={cfg('left_small')}
                    isEditing={sel('left_small')}
                    onDataChange={(updated) => onSectionChange && onSectionChange('left_small', updated)}
                  />
                </div>
              </div>


            </div>




            {/* ══ COL CENTER + RIGHT (~73%) ══ */}
            <div style={styles.colCenterRight}>

              {/* Center Top — full width, ~45% */}
              <div
                className="clickable-section"
                style={{ ...styles.centerTop, ...styles.borderBottom }}
                onClick={press('center_top')}
                role="button"
                tabIndex={0}
              >
                <ArticleBlock
                  data={sections.center_top}
                  blockConfig={cfg('center_top')}
                  isMain
                  isEditing={sel('center_top')}
                  onDataChange={(updated) => onSectionChange && onSectionChange('center_top', updated)}
                />
              </div>





              {/* Mid Row: left side (center_mid + center_bottom) + right side (soyabin full height) */}
              <div style={styles.midRow}>

                {/* Left side of mid row */}
                <div style={styles.midLeft}>
                  <div
                    className="clickable-section"
                    style={{ ...styles.centerMid, ...styles.centerMidBorder }}
                    onClick={press('center_mid')}
                    role="button"
                    tabIndex={0}
                  >
                    <ArticleBlock
                      data={sections.center_mid}
                      blockConfig={cfg('center_mid')}
                      isEditing={sel('center_mid')}
                      onDataChange={(updated) => onSectionChange && onSectionChange('center_mid', updated)}
                    />
                  </div>




                  {/* Center Bottom — bordered box, under center_mid */}
                  <div
                    className="clickable-section"
                    style={styles.centerBottomWrapper}
                    onClick={press('center_bottom')}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.centerBottomBox}>
                      <ArticleBlock
                        data={sections.center_bottom}
                        blockConfig={cfg('center_bottom')}
                        isEditing={sel('center_bottom')}
                        onDataChange={(updated) => onSectionChange && onSectionChange('center_bottom', updated)}
                      />
                    </div>
                  </div>
                </div>




                {/* Right side - soyabin full height */}
                <div
                  className="clickable-section"
                  style={styles.midRight}
                  onClick={press('right')}
                  role="button"
                  tabIndex={0}
                >
                  <ArticleBlock
                    data={sections.right}
                    blockConfig={cfg('right')}
                    isEditing={sel('right')}
                    columns={2}
                    onDataChange={(updated) => onSectionChange && onSectionChange('right', updated)}
                  />
                </div>


              </div>

            </div>
          </div>



          {/* ── Footer ── */}
          <div 
            className="clickable-section"
            onClick={press('footer')}
            role="button"
            tabIndex={0}
          >
            <FooterBlock
              data={sections.footer}
              isEditing={sel('footer')}
              onDataChange={(updated) => onSectionChange && onSectionChange('footer', updated)}
            />
          </div>

        </div>
      </div>

      {/* Global CSS handles for interactive section clicks */}
      <style>{`
        .clickable-section {
          cursor: pointer;
          outline: none;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          box-sizing: border-box;
          transition: opacity 0.15s ease-in-out;
        }
        .clickable-section:hover {
          opacity: 0.85;
        }
        .clickable-section:focus-visible {
          outline: 2px solid #ea580c;
        }
      `}</style>
    </div>
  );
}

// ─── Pure Web Inline Styles ──────────────────────────────────────────────────
const styles = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#e8e4df',
    paddingTop: '20px',
    paddingBottom: '20px',
    width: '100%',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
  },
  scrollContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  page: {
    position: 'relative',
    backgroundColor: '#fff',
    border: '1px solid #888',
    width: `${NEWSPAPER_WIDTH}px`,
    height: `${NEWSPAPER_HEIGHT}px`,
    boxSizing: 'border-box',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  // Full Width Heading Block
  fullWidthHeading: {
    position: 'relative',
    width: '100%',
    padding: '0 20px',
    borderBottom: '2px solid #333',
    borderTop: '2px solid #333',
    marginBottom: '4px',
    backgroundColor: '#000000',
    boxSizing: 'border-box',
    flex: '0 0 auto',
    overflow: 'hidden',
  },
  headingContent: {
    fontFamily: '"Noto Serif Devanagari", "Mangal", "Nirmala UI", serif',
    fontSize: '54px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headingWordCount: {
    position: 'absolute',
    right: '8px',
    top: '4px',
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    border: '1px solid #f59e0b',
    color: '#92400e',
    borderRadius: '4px',
    padding: '2px 5px',
    fontSize: '9px',
    fontWeight: 800,
  },

  // True 3-column row
  mainRow: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 0,
    overflow: 'hidden',
  },

  // Left col ~27%
  colLeft: {
    flex: 27,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Left big ~65% of left col height
  leftBig: {
    padding: '12px',
    boxSizing: 'border-box',
    flex: 25,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Left small wrapper ~35%
  leftSmallWrapper: {
    padding: '10px',
    flex: 25,
    display: 'flex',
    boxSizing: 'border-box',
    minHeight: 0,
    overflow: 'hidden',
  },

  // Bordered box for left_small
  leftSmallBox: {
    flex: 1,
    border: '1.5px solid #444',
    padding: '10px',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Center col ~43% (Used as configuration variable helper)
  colCenter: {
    flex: 43,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Center + Right combined col ~73%
  colCenterRight: {
    flex: 73,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Mid row: center_mid + right side by side
  midRow: {
    display: 'flex',
    flexDirection: 'row',
    flex: 55,
    marginLeft: '-1px',
    boxSizing: 'border-box',
    minHeight: 0,
    overflow: 'hidden',
  },
  // Left side of mid row
  midLeft: {
    flex: 52,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '-1px',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  // center_mid in mid row
  centerMid: {
    padding: '12px',
    boxSizing: 'border-box',
    flex: 58,
    minHeight: 0,
    overflow: 'hidden',
  },
  // right/soyabin in mid row ~48%
  midRight: {
    flex: 48,
    padding: '12px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Center top ~45%
  centerTop: {
    padding: '12px',
    boxSizing: 'border-box',
    flex: 45,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Center bottom wrapper ~70%
  centerBottomWrapper: {
    padding: '10px',
    flex: 42,
    display: 'flex',
    boxSizing: 'border-box',
    minHeight: 0,
    overflow: 'hidden',
  },

  // Bordered box for center_bottom
  centerBottomBox: {
    flex: 1,
    border: '1.5px solid #444',
    padding: '10px',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  // Right col ~30% — full height
  colRight: {
    flex: 30,
    padding: '12px',
    borderLeft: '1px solid #ccc',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  // Center mid — top + bottom only, left open, right open
  centerMidBorder: {
    borderTop: '1px solid #ccc',
    borderBottom: '1px solid #ccc',
  },

  // Dividers
  borderRight: {
    borderRight: '1px solid #ccc',
  },
  borderBottom: {
    borderBottom: '1px solid #ccc',
  },
};