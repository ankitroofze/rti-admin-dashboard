import React, { useRef } from 'react';
import ArticleBlock from './ArticleBlock';

const rectsOverlap = (a, b) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export default function ManualBlocksLayer({
  blocks = [],
  activeBlockId = '',
  onSelectBlock,
  onChangeBlock,
  onRemoveBlock,
}) {
    const layerRef = useRef(null);

  const getObstacleRects = (currentBlockEl) => {
    const layerEl = layerRef.current;
    if (!layerEl) return [];
    const pageEl = layerEl.parentElement;
    if (!pageEl) return [];
    const pageRect = pageEl.getBoundingClientRect();
    const allSections = Array.from(pageEl.querySelectorAll('.clickable-section'));
    return allSections
      .filter((el) => el !== currentBlockEl)
      .filter((el) => layerEl.contains(el) ? true : true) // grid + other manual blocks dono
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - pageRect.left,
          top: r.top - pageRect.top,
          right: r.right - pageRect.left,
          bottom: r.bottom - pageRect.top,
        };
      });
  };

  if (!blocks.length) return null;

  return (
    <div ref={layerRef} className="manual-block-layer no-print-outline" style={styles.layer}>
      {blocks.map((block) => {
        const isActive = activeBlockId === block.id;
        const layout = {
          x: Number(block.layoutSettings?.x || 24),
          y: Number(block.layoutSettings?.y || 360),
          width: Number(block.layoutSettings?.width || 260),
          height: Number(block.layoutSettings?.height || 220),
        };
             const startDrag = (event, mode) => {
          event.preventDefault();
          event.stopPropagation();
          onSelectBlock && onSelectBlock(block.id);
          const blockEl = event.currentTarget;
          const obstacles = getObstacleRects(blockEl);
          const start = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            ...layout,
          };
          const move = (moveEvent) => {
            const dx = moveEvent.clientX - start.pointerX;
            const dy = moveEvent.clientY - start.pointerY;
            const next = mode === 'move'
              ? {
                  ...start,
                  x: Math.max(0, Math.min(1056 - start.width, start.x + dx)),
                  y: Math.max(0, Math.min(2112 - start.height, start.y + dy)),
                }
              : {
                  ...start,
                  width: Math.max(90, Math.min(1056 - start.x, start.width + dx)),
                  height: Math.max(90, Math.min(2112 - start.y, start.height + dy)),
                };

            const candidateRect = {
              left: next.x,
              top: next.y,
              right: next.x + next.width,
              bottom: next.y + next.height,
            };
            const collides = obstacles.some((o) => rectsOverlap(candidateRect, o));
            if (collides) return; // is position pe koi block already hai — move/resize yahin rok do

            onChangeBlock && onChangeBlock(block.id, {
              ...block,
              layoutSettings: {
                ...(block.layoutSettings || {}),
                x: Math.round(next.x),
                y: Math.round(next.y),
                width: Math.round(next.width),
                height: Math.round(next.height),
              },
            });
          };
          const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
          };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
        };

        return (
          <div
            key={block.id}
            className="clickable-section"
            role="button"
            tabIndex={0}
            onPointerDown={(event) => startDrag(event, 'move')}
            onClick={(event) => {
              event.stopPropagation();
              onSelectBlock && onSelectBlock(block.id);
            }}
            style={{
              ...styles.block,
              left: `${layout.x}px`,
              top: `${layout.y}px`,
              width: `${layout.width}px`,
              height: `${layout.height}px`,
            }}
          >
            {isActive && (
              <button
                type="button"
                className="no-print"
                style={styles.removeButton}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveBlock && onRemoveBlock(block.id);
                }}
              >
                x
              </button>
            )}
            <ArticleBlock
              data={block}
              isEditing={isActive}
              allowImage={block.imageSettings?.enabled !== false}
              blockConfig={{
                characterLimit: Number(block.blockConfig?.characterLimit || 900),
                columns: Number(block.blockConfig?.columns || 1),
                imagePosition: block.imageSettings?.position || 'top',
                manualBlock: true,
              }}
              onDataChange={(updated) => onChangeBlock && onChangeBlock(block.id, updated)}
            />
            {isActive && (
              <span
                className="no-print"
                style={styles.resizeHandle}
                onPointerDown={(event) => startDrag(event, 'resize')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  layer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 5,
  },
  block: {
    position: 'absolute',
    pointerEvents: 'auto',
    border: '1px dashed #ea580c',
    backgroundColor: '#fff',
    overflow: 'hidden',
    boxSizing: 'border-box',
    cursor: 'move',
    userSelect: 'none',
  },
  resizeHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '16px',
    height: '16px',
    backgroundColor: '#ea580c',
    cursor: 'nwse-resize',
    zIndex: 6,
  },
  removeButton: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    zIndex: 7,
    width: '22px',
    height: '22px',
    border: '0',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: '13px',
    lineHeight: '22px',
    padding: 0,
    cursor: 'pointer',
  },
};
