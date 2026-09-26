import React from 'react';
import ArticleBlock from './ArticleBlock';
import FooterBlock from './FooterBlock';
import { getBlockConfig } from './newspaperLayouts';

const NEWSPAPER_WIDTH = 1056;
const NEWSPAPER_HEIGHT = 2112;

export default function LayoutThree({
  sections = {},
  activeSection,
  onSelectSection,
  onSectionChange,
}) {
  const sel = (id) => activeSection === id;
  const press = (id) => () => onSelectSection && onSelectSection(id);
  const cfg = (id) =>getBlockConfig('layoutThree', id) || {};
  const change = (id) => (updated) => onSectionChange && onSectionChange(id, updated);

  const Row1 = (
    <div key="row1" style={styles.row1}>
      <div className="clickable-section" style={{ ...styles.row1Cell, ...styles.borderRight }} onClick={press('row1_a')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.row1_a} blockConfig={cfg('row1_a')} isEditing={sel('row1_a')} onDataChange={change('row1_a')} />
      </div>
      <div className="clickable-section" style={{ ...styles.row1Cell, ...styles.borderRight }} onClick={press('row1_b')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.row1_b} blockConfig={cfg('row1_b')} isEditing={sel('row1_b')} onDataChange={change('row1_b')} />
      </div>
      <div className="clickable-section" style={styles.row1Cell} onClick={press('row1_c')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.row1_c} blockConfig={cfg('row1_c')} isEditing={sel('row1_c')} onDataChange={change('row1_c')} />
      </div>
    </div>
  );

  const Row2 = (
    <div key="row2" style={{ ...styles.row2, ...styles.borderTop }}>
      <div className="clickable-section" style={{ ...styles.row2Left, ...styles.borderRight }} onClick={press('left_big')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.left_big} blockConfig={cfg('left_big')} isEditing={sel('left_big')} onDataChange={change('left_big')} />
      </div>
      <div className="clickable-section" style={{ ...styles.row2Mid, ...styles.borderRight }} onClick={press('center_mid')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.center_mid} blockConfig={cfg('center_mid')} isEditing={sel('center_mid')} onDataChange={change('center_mid')} />
      </div>
      <div className="clickable-section" style={styles.row2Right} onClick={press('right')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.right} blockConfig={cfg('right')} isMain columns={2} isEditing={sel('right')} onDataChange={change('right')} />
      </div>
    </div>
  );

  const Row3 = (
    <div key="row3" style={{ ...styles.row3, ...styles.borderTop }}>
      <div className="clickable-section" style={{ ...styles.row3Big, ...styles.borderRight }} onClick={press('center_bottom')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.center_bottom} blockConfig={cfg('center_bottom')} isMain columns={3} isEditing={sel('center_bottom')} onDataChange={change('center_bottom')} />
      </div>
      <div className="clickable-section" style={styles.row3Small} onClick={press('bottom_right')} role="button" tabIndex={0}>
        <ArticleBlock data={sections.bottom_right} blockConfig={cfg('bottom_right')} isEditing={sel('bottom_right')} onDataChange={change('bottom_right')} />
      </div>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.scrollContainer}>
        <div style={styles.page}>
          <div style={styles.mainColumn}>
            {Row1}
            {Row2}
            {Row3}
          </div>

          <div className="clickable-section" onClick={press('footer')} role="button" tabIndex={0}>
            <FooterBlock data={sections.footer} isEditing={sel('footer')} onDataChange={change('footer')} />
          </div>
        </div>
      </div>

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
        .clickable-section:hover { opacity: 0.85; }
        .clickable-section:focus-visible { outline: 2px solid #ea580c; }
      `}</style>
    </div>
  );
}

const styles = {
  pageWrapper: { display: 'flex', flexDirection: 'column', backgroundColor: '#e8e4df', paddingTop: '20px', paddingBottom: '20px', width: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box' },
  scrollContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' },
  page: { position: 'relative', backgroundColor: '#fff', border: '1px solid #888', width: `${NEWSPAPER_WIDTH}px`, height: `${NEWSPAPER_HEIGHT}px`, boxSizing: 'border-box', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  mainColumn: { display: 'flex', flexDirection: 'column', flex: 1, width: '100%', boxSizing: 'border-box', minHeight: 0, overflow: 'hidden' },

  row1: { display: 'flex', flexDirection: 'row', flex: '0 0 300px', height: '300px', width: '100%', boxSizing: 'border-box', minHeight: 0, overflow: 'hidden' },
  row1Cell: { flex: 1, padding: '12px', boxSizing: 'border-box', minWidth: 0, minHeight: 0, overflow: 'hidden' },

  row2: { display: 'flex', flexDirection: 'row', flex: 55, width: '100%', boxSizing: 'border-box', minHeight: 0, overflow: 'hidden' },
  row2Left: { flex: 25, padding: '12px', boxSizing: 'border-box', minWidth: 0, minHeight: 0, overflow: 'hidden' },
  row2Mid: { flex: 35, padding: '12px', boxSizing: 'border-box', minWidth: 0, minHeight: 0, overflow: 'hidden' },
  row2Right: { flex: 40, padding: '12px', boxSizing: 'border-box', minWidth: 0, minHeight: 0, overflow: 'hidden' },

  row3: { display: 'flex', flexDirection: 'row', flex: 45, width: '100%', boxSizing: 'border-box', minHeight: 0, overflow: 'hidden' },
  row3Big: { flex: 60, padding: '12px', boxSizing: 'border-box', minWidth: 0, minHeight: 0, overflow: 'hidden' },
  row3Small: { flex: 40, padding: '12px', boxSizing: 'border-box', minWidth: 0, minHeight: 0, overflow: 'hidden' },

  borderRight: { borderRight: '1px solid #ccc' },
  borderTop: { borderTop: '1px solid #ccc' },
};