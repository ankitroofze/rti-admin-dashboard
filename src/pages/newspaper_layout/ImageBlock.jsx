import React, { useRef } from 'react';

export default function ImageBlock({ uri = '', onPick, onRemove }) {
  const fileInputRef = useRef(null);

  // Web native file picker logic (Handles Base64 transformation directly)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Direct format validation check for client safety
    if (!file.type.startsWith('image/')) {
      alert('Kripya sirf images (JPG, PNG) hi select karein.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && onPick) {
        onPick(reader.result); // Pass base64 dataUri back
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (uri) {
    return (
      <div style={styles.container}>
        {/* Hidden input element for file streaming */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        <img src={uri} alt="Preview" style={styles.preview} />
        
        <div style={styles.actions}>
          <button 
            type="button" 
            className="image-action-btn" 
            style={styles.actionBtn} 
            onClick={triggerPicker}
          >
            Replace
          </button>
          <button 
            type="button" 
            className="image-action-btn remove-btn" 
            style={{ ...styles.actionBtn, ...styles.removeBtn }} 
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden input element for raw canvas uploading */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      
      <div 
        role="button"
        tabIndex={0}
        className="web-upload-area" 
        style={styles.uploadArea} 
        onClick={triggerPicker}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerPicker(); }}
      >
        <span style={styles.uploadIcon}>📷</span>
        <span style={styles.uploadText}>Image upload karein</span>
        <span style={styles.uploadHint}>JPG, PNG support</span>
      </div>

      {/* Global pseudo CSS for pure browser layout interactivity */}
      <style>{`
        .image-action-btn {
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.15s ease;
          outline: none;
        }
        .image-action-btn:hover {
          background-color: #3f3f46 !important;
        }
        .image-action-btn.remove-btn:hover {
          border-color: #ef4444 !important;
          background-color: #1e1b4b !important;
        }
        .web-upload-area {
          cursor: pointer;
          transition: border-color 0.15s ease, background-color 0.15s ease;
          outline: none;
        }
        .web-upload-area:hover {
          border-color: #666 !important;
          background-color: #f4f4f5;
        }
        .web-upload-area:focus-visible {
          border-color: #ea580c !important;
        }
      `}</style>
    </div>
  );
}

// ─── Pure Web Semantic CSS-in-JS Styles ──────────────────────────────────────
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
    width: '100%',
    boxSizing: 'border-box',
  },
  preview: {
    width: '100%',
    height: '120px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    objectFit: 'cover',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    marginTop: '6px',
    width: '100%',
    boxSizing: 'border-box',
  },
  actionBtn: {
    flex: 1,
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#ccc',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  removeBtn: {
    borderColor: '#f87171',
    color: '#f87171',
  },
  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #444',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '10px',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    width: '100%',
  },
  uploadIcon: {
    fontSize: '28px',
    marginBottom: '4px',
    userSelect: 'none',
  },
  uploadText: {
    fontSize: '12px',
    color: '#888',
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: '10px',
    color: '#555',
    marginTop: '2px',
  },
};