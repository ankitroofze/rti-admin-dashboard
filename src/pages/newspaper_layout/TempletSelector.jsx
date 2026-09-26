import React from 'react';
import { useTemplateStore } from '../../store/newspaperStore'; // Apne store ke path ke hisab se ise check kar lein

const TEMPLATES = [
  {
    id: 'layout1',
    name: 'June Layout',
    desc: 'Header · Headline · 25|50|25 · 50|50 · Footer',
    grid: [
      ['████████████████████'],
      ['████████████████████'],
      ['████', '████████████', '████'],
      ['██████████', '██████████'],
      ['████████████████████'],
    ],
  },
  {
    id: 'layout2',
    name: 'March Layout',
    desc: 'Header · Headline · 35|40|25 · Lawyer · 33|33|34 · Footer',
    grid: [
      ['████████████████████'],
      ['████████████████████'],
      ['███████', '████████', '█████'],
      ['━━━━━━━━━━━━━━━━━━━━'],
      ['██████', '██████', '████████'],
      ['████████████████████'],
    ],
  },
  {
    id: 'layout3',
    name: 'Traditional Layout',
    desc: 'Header · 50|50 Top · 50|50 Mid · Black Strip · Slogan',
    grid: [
      ['████████████████████'],
      ['██████████', '██████████'],
      ['██████████', '██████████'],
      ['██████████', '██████████'],
      ['████████████████████'],
    ],
  },
  {
    id: 'layout4',
    name: 'Broadsheet Layout',
    desc: 'Header · 33|33|33 Top · 33|33|33 Mid · 70|30 Feature · Footer',
    grid: [
      ['████████████████████'],
      ['██████', '██████', '████████'],
      ['██████', '██████', '████████'],
      ['██████████████', '██████'],
      ['████████████████████'],
    ],
  },
];

export default function TemplateSelector({ onSelect }) {
  const { templateId, setTemplate } = useTemplateStore();

  return (
    <div style={styles.container}>
      <div style={styles.heading}>Template choose</div>
      
      {/* Horizontal Scroll Wrapper */}
      <div style={styles.list} className="hide-scrollbar">
        {TEMPLATES.map((tpl) => {
          const selected = templateId === tpl.id;
          return (
            <div
              key={tpl.id}
              role="button"
              tabIndex={0}
              style={{
                ...styles.card,
                ...(selected ? styles.cardSelected : {}),
              }}
              onClick={() => {
                setTemplate(tpl.id);
                onSelect && onSelect(tpl.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setTemplate(tpl.id);
                  onSelect && onSelect(tpl.id);
                }
              }}
            >
              {/* Mini grid preview */}
              <div style={styles.gridPreview}>
                {tpl.grid.map((row, ri) => (
                  <div key={ri} style={styles.gridRow}>
                    {row.map((cell, ci) => (
                      <div
                        key={ci}
                        style={{
                          ...styles.gridCell,
                          flex: cell.length,
                          ...(selected ? styles.gridCellSelected : {}),
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Template Meta Info */}
              <div style={{
                ...styles.cardTitle,
                ...(selected ? styles.cardTitleSelected : {}),
              }}>
                {tpl.name}
              </div>
              <div style={styles.cardDesc}>{tpl.desc}</div>
              
              {/* Selected Badge */}
              {selected && (
                <div style={styles.selectedBadge}>
                  <span style={styles.selectedBadgeText}>✓ Selected</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional CSS to hide default scrollbars on web */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// ─── Pure Web Inline Styles Object ──────────────────────────────────────────
const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    padding: '14px 16px',
    borderBottom: '2px solid #ea580c',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
  },
  heading: {
    color: '#ffd700',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1px',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    paddingBottom: '4px',
    overflowX: 'auto',
    overflowY: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
  },
  card: {
    width: '180px',
    minWidth: '180px', // Prevents shrinking inside flex container
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    border: '2px solid #444',
    padding: '12px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  cardSelected: {
    borderColor: '#ffd700',
    backgroundColor: '#2d2400',
  },
  gridPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    marginBottom: '10px',
  },
  gridRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2px',
    height: '10px',
  },
  gridCell: {
    backgroundColor: '#555',
    borderRadius: '1px',
    height: '100%',
  },
  gridCellSelected: {
    backgroundColor: '#ffd700',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ccc',
    marginBottom: '3px',
  },
  cardTitleSelected: {
    color: '#ffd700',
  },
  cardDesc: {
    fontSize: '10px',
    color: '#666',
    lineHeight: '14px',
    whiteSpace: 'normal', // Allows description text to wrap correctly
  },
  selectedBadge: {
    marginTop: '8px',
    backgroundColor: '#ffd700',
    borderRadius: '4px',
    padding: '3px 8px',
    display: 'inline-block',
  },
  selectedBadgeText: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#111',
  },
};