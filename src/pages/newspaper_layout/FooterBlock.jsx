import React from 'react';

export default function FooterBlock({ data = {}, isEditing = false }) {
  const {
    left = '© भारतीय माहिती अधिकार',
    right = 'www.rtinewsnetwork.com',
    content = '',
    bgColor = '#fafafa',
    textColor = '#444444',
  } = data;

  return (
    <div 
      style={{ 
        ...styles.footer, 
        backgroundColor: bgColor,
        ...(isEditing ? styles.editing : {})
      }}
    >
      {/* ── Top Double Borders ── */}
      <div style={styles.borderTop1} />
      <div style={styles.borderTop2} />

      {content ? (
        /* ── Rich Text / HTML Dynamic Content Editor View ── */
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            padding: '6px 12px',
            fontSize: '9px',
            color: textColor,
            backgroundColor: bgColor,
            lineHeight: 1.4,
            wordBreak: 'break-word',
            boxSizing: 'border-box'
          }}
        />
      ) : (
        /* ── Standard 3-Column Footer Layout ── */
        <div style={{ ...styles.inner, backgroundColor: bgColor }}>
          <span style={{ ...styles.text, color: textColor, textAlign: 'left' }}>
            {left}
          </span>
          <span style={{ ...styles.center, color: textColor }}>
            {'सर्वसामान्य जनतेत भारतीय कायद्याचे प्रबोधन करणारे एकमेव न्यूज पेपर!'}
          </span>
          <span style={{ ...styles.text, color: textColor, textAlign: 'right' }}>
            {right}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Pure Web Fluid CSS-in-JS Configurations ─────────────────────────
const styles = {
  footer: {
    backgroundColor: '#fafafa',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  editing: {
    outline: '2px solid #ea580c',
    outlineOffset: '-2px',
  },
  borderTop1: {
    height: '2px',
    backgroundColor: '#111',
    width: '100%',
  },
  borderTop2: {
    height: '1px',
    backgroundColor: '#111',
    marginTop: '2px',
    width: '100%',
  },
  inner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '6px',
    paddingBottom: '6px',
    boxSizing: 'border-box',
    width: '100%',
    gap: '8px',
  },
  text: {
    fontSize: '9px',
    color: '#444',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  center: {
    fontSize: '9px',
    color: '#222',
    fontWeight: '700',
    textAlign: 'center',
    flex: 2,
    fontStyle: 'italic',
  },
};