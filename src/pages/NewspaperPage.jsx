import React, { useState, useEffect, useRef } from 'react';
import { useTemplateStore, useEditorStore, usePdfStore } from '../store/newspaperStore';
import LayoutOne from '../components/newspaper/LayoutOne';
import LayoutTwo from '../components/newspaper/LayoutTwo';
import TemplateSelector from '../components/newspaper/TemplateSelector';
import ImageBlock from '../components/newspaper/ImageBlock';
import RichField from '../components/newspaper/RichField';
import { exportToPdf, printDirectly } from '../components/newspaper/PDFExporter';

// ─── Section definitions ───────────────────────────────────────────────────────
const T1_SECTIONS = [
  { id: 'header',        label: 'Header',               type: 'header' },
  { id: 'headline',      label: 'Main Headline',         type: 'headline', hidden: true },
  { id: 'left_big',      label: 'Left Story (25%)',       type: 'article' },
  { id: 'left_small',    label: 'Left Story (25%)',       type: 'article' },
  { id: 'center_top',    label: 'Center Story (50%)',     type: 'article', isMain: true },
  { id: 'center_mid',    label: 'Center Mid',             type: 'article' },
  { id: 'center_bottom', label: 'Center Bottom',          type: 'article' },
  { id: 'right',         label: 'Right Story (25%)',      type: 'article' },
  { id: 'footer',        label: 'Footer',               type: 'footer' },
];

const T2_SECTIONS = [
  { id: 'masthead',  label: 'Masthead Strip',         type: 'masthead' },
  { id: 'top_left',  label: 'Top Left Article',       type: 'article', isMain: true },
  { id: 'top_right', label: 'Top Right Article',      type: 'article', isMain: true },
  { id: 'mid_left',  label: 'Middle Left Article',    type: 'article' },
  { id: 'mid_right', label: 'Middle Right Article',   type: 'article' },
  { id: 'bot_main',  label: 'Bottom Main Article',    type: 'article', isMain: true },
  { id: 'bot_side',  label: 'Bottom Side Article',    type: 'article' },
  { id: 'footer',    label: 'Footer',                 type: 'footer' },
  { id: 'slogan',    label: 'Slogan Bar',             type: 'slogan' },
];

// ─── Field limits ──────────────────────────────────────────────────────────────
const FIELD_LIMITS = {
  contact1: 15, contact2: 15,
  govtText1: 40, govtText2: 40,
  regNo: 60,
  titleRegNo: 60,
  rtiAll: 20, rtiIndia: 20, rtiRti: 20, rtiNetwork: 40,
  newspaperName: 40,
  tagline: 80,
  website: 50, extra: 50,
  editorName: 30, editorTitle: 40,
  officeInfo: 100,
  date: 80,
  title: 80, sub: 60,
  reporter: 30, location: 30,
  text: 200,
};

// ─── Plain Field ──────────────────────────────────────────────────────────────
function Field({ label, fieldKey, data, update, multiline = false }) {
  const maxChars = FIELD_LIMITS[fieldKey] || null;
  const val = String(data[fieldKey] || '');
  const isOver = maxChars ? val.length > maxChars : false;

  return (
    <div style={ep.fieldGroup}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={ep.label}>{label}</label>
        {maxChars && (
          <span style={{ fontSize: 10, fontWeight: '600', color: isOver ? '#ef4444' : '#555' }}>
            {val.length}/{maxChars}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          style={{ ...ep.input, ...ep.textarea, ...(isOver && ep.inputError) }}
          value={val}
          onChange={(e) => {
            const v = e.target.value;
            if (maxChars && v.length > maxChars) return;
            update(fieldKey, v);
          }}
          rows={4}
          placeholderTextColor="#666"
        />
      ) : (
        <input
          type="text"
          style={{ ...ep.input, ...(isOver && ep.inputError) }}
          value={val}
          onChange={(e) => {
            const v = e.target.value;
            if (maxChars && v.length > maxChars) return;
            update(fieldKey, v);
          }}
          placeholderTextColor="#666"
        />
      )}
    </div>
  );
}

// ─── RichField with char limit counter ──────────────────────────────────────
function LimitedRichField({ label, fieldKey, data, update }) {
  const maxChars = FIELD_LIMITS[fieldKey] || null;
  const rawVal = data[fieldKey] || '';
  const plainText = String(rawVal).replace(/<[^>]*>/g, '');
  const isOver = maxChars ? plainText.length > maxChars : false;

  return (
    <div style={{ marginBottom: 0 }}>
      <RichField
        label={label}
        value={rawVal}
        onChange={(html) => {
          if (maxChars) {
            const plain = html.replace(/<[^>]*>/g, '');
            if (plain.length > maxChars) return;
          }
          update(fieldKey, html);
        }}
      />
    </div>
  );
}

// ─── Phone Field with number validation ──────────────────────────────────────
function PhoneField({ label, fieldKey, data, update }) {
  const maxChars = FIELD_LIMITS[fieldKey] || 15;
  const val = String(data[fieldKey] || '').replace(/<[^>]*>/g, '');
  const isValid = val === '' || /^[0-9+\-\s()]{0,15}$/.test(val);
  const isOver = val.length > maxChars;

  return (
    <div style={ep.fieldGroup}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={ep.label}>{label}</label>
        <span style={{ fontSize: 10, fontWeight: '600', color: (isOver || !isValid) ? '#ef4444' : '#555' }}>
          {val.length}/{maxChars}
        </span>
      </div>
      <input
        type="tel"
        style={{ ...ep.input, ...((isOver || !isValid) && ep.inputError) }}
        value={val}
        onChange={(e) => {
          const v = e.target.value;
          if (!/^[0-9+\-\s()]*$/.test(v)) return;
          if (v.length > maxChars) return;
          update(fieldKey, v);
        }}
        placeholderTextColor="#666"
        placeholder="e.g. +91 9876543210"
        maxLength={15}
      />
      {!isValid && <span style={{ color: '#ef4444', fontSize: 9, marginTop: 2 }}>Sirf numbers allowed hain</span>}
    </div>
  );
}

// ─── ColorPicker row helper ──────────────────────────────────────────────────
function ColorRow({ label, fieldKey, data, update }) {
  return (
    <div style={{ marginRight: 16 }}>
      <label style={ep.label}>{label}</label>
      <input
        type="color"
        value={data[fieldKey] || '#111111'}
        onChange={(e) => update(fieldKey, e.target.value)}
        style={{ width: 44, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }}
      />
    </div>
  );
}

// ─── EditPanel ────────────────────────────────────────────────────────────────
function EditPanel({ sectionId, sectionDef }) {
  const { sections, updateSection } = useEditorStore();
  const data = sections[sectionId] || {};
  const update = (key, val) => updateSection(sectionId, key, val);
  const headlineData = sections['headline'] || {};
  const updateHeadline = (key, val) => updateSection('headline', key, val);

  if (!sectionDef) {
    return (
      <div style={ep.empty}>
        <span style={ep.emptyText}>No section selected</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1 }}>
      <div style={ep.scroll}>
        <h3 style={ep.panelTitle}>{sectionDef.label}</h3>

        {/* ══════════════════════════════════════
            HEADER SECTION
        ══════════════════════════════════════ */}
        {sectionDef.type === 'header' && (
          <>
            <h4 style={ep.sectionHeading}>📞 Top Row</h4>
            <PhoneField label="Contact 1" fieldKey="contact1" data={data} update={update} />
            <PhoneField label="Contact 2" fieldKey="contact2" data={data} update={update} />
            <LimitedRichField label="Govt Info 1" fieldKey="govtText1" data={data} update={update} />
            <LimitedRichField label="Govt Info 2" fieldKey="govtText2" data={data} update={update} />

            <h4 style={ep.sectionHeading}>🔢 Registration & RTI</h4>
            <LimitedRichField label="Reg Number"        fieldKey="regNo"      data={data} update={update} />
            <LimitedRichField label="Title Reg Number"  fieldKey="titleRegNo" data={data} update={update} />
            <LimitedRichField label="RTI - All / India"  fieldKey="rtiAll"     data={data} update={update} />
            <LimitedRichField label="RTI - INDIA"        fieldKey="rtiIndia"   data={data} update={update} />
            <LimitedRichField label="RTI - RTi"          fieldKey="rtiRti"     data={data} update={update} />
            <LimitedRichField label="RTI - NEWS NETWORK" fieldKey="rtiNetwork" data={data} update={update} />

            <h4 style={ep.sectionHeading}>🗞️ Black Banner</h4>
            <LimitedRichField label="Newspaper Name" fieldKey="newspaperName" data={data} update={update} />
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Logo</label>
              <ImageBlock
                uri={data.logoUri || ''}
                onPick={(uri) => update('logoUri', uri)}
                onRemove={() => update('logoUri', '')}
              />
            </div>
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Banner Colors</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 6 }}>
                <ColorRow label="BG Color"   fieldKey="bannerBgColor"   data={data} update={update} />
                <ColorRow label="Text Color" fieldKey="bannerTextColor" data={data} update={update} />
              </div>
            </div>

            <h4 style={ep.sectionHeading}>✍️ Tagline</h4>
            <LimitedRichField label="Tagline" fieldKey="tagline" data={data} update={update} />

            <h4 style={ep.sectionHeading}>🌐 Info Row</h4>
            <LimitedRichField label="Website"      fieldKey="website"     data={data} update={update} />
            <LimitedRichField label="Email"        fieldKey="extra"       data={data} update={update} />
            <LimitedRichField label="Editor Name"  fieldKey="editorName"  data={data} update={update} />
            <LimitedRichField label="Editor Title" fieldKey="editorTitle" data={data} update={update} />

            <h4 style={ep.sectionHeading}>🏢 Office / Address</h4>
            <LimitedRichField label="Office Info" fieldKey="officeInfo" data={data} update={update} />

            <h4 style={ep.sectionHeading}>📅 Date Strip</h4>
            <LimitedRichField label="Date / Subscription" fieldKey="date" data={data} update={update} />
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Date Strip Colors</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 6 }}>
                <ColorRow label="Strip BG"   fieldKey="dateBgColor"   data={data} update={update} />
                <ColorRow label="Text Color" fieldKey="dateTextColor" data={data} update={update} />
              </div>
            </div>

            <h4 style={ep.sectionHeading}>📰 Main Headline</h4>
            <RichField
              label="Title"
              value={headlineData.title || ''}
              onChange={(html) => updateHeadline('title', html)}
            />
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Subtitle</label>
              <input
                style={ep.input}
                type="text"
                value={String(headlineData.sub || '')}
                onChange={(e) => updateHeadline('sub', e.target.value)}
                placeholderTextColor="#666"
              />
            </div>
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Sub Subtitle</label>
              <input
                style={ep.input}
                type="text"
                value={String(headlineData.subsub || '')}
                onChange={(e) => updateHeadline('subsub', e.target.value)}
                placeholderTextColor="#666"
              />
            </div>
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Headline BG Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 6 }}>
                <ColorRow label="BG Color" fieldKey="headlineBgColor" data={headlineData} update={(k, v) => updateHeadline(k, v)} />
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════
            FOOTER SECTION
        ══════════════════════════════════════ */}
        {sectionDef.type === 'footer' && (
          <>
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Footer Colors</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 6 }}>
                <ColorRow label="BG Color"   fieldKey="bgColor"   data={data} update={update} />
                <ColorRow label="Text Color" fieldKey="textColor" data={data} update={update} />
              </div>
            </div>
            <RichField
              label="Footer Content"
              value={data.content || ''}
              onChange={(html) => update('content', html)}
            />
          </>
        )}

        {sectionDef.type === 'lawyer' && (
          <Field label="Legal Notice" fieldKey="text" multiline data={data} update={update} />
        )}

        {sectionDef.type === 'masthead' && (
          <>
            <Field label="Date"    fieldKey="date"    data={data} update={update} />
            <Field label="Title"   fieldKey="title"   data={data} update={update} />
            <Field label="Website" fieldKey="website" data={data} update={update} />
          </>
        )}

        {sectionDef.type === 'slogan' && (
          <Field label="Slogan" fieldKey="text" multiline data={data} update={update} />
        )}

        {sectionDef.type === 'article' && (
          <>
            <LimitedRichField label="Title"    fieldKey="title"    data={data} update={update} />
            <LimitedRichField label="Subtitle" fieldKey="sub"      data={data} update={update} />
            <RichField
              label="Article Content"
              value={data.body || ''}
              onChange={(html) => update('body', html)}
            />
            <LimitedRichField label="Reporter" fieldKey="reporter" data={data} update={update} />
            <LimitedRichField label="Location" fieldKey="location" data={data} update={update} />
            <LimitedRichField label="Date"     fieldKey="date"     data={data} update={update} />
            <div style={ep.fieldGroup}>
              <label style={ep.label}>Image</label>
              <ImageBlock
                uri={data.image || ''}
                onPick={(uri) => update('image', uri)}
                onRemove={() => update('image', '')}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ep = {
  scroll:         { flex: 1, padding: 14, overflowY: 'auto' },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText:      { color: '#666', fontSize: 12, textAlign: 'center', lineHeight: 20 },
  panelTitle:     { color: '#ffd700', fontSize: 13, fontWeight: '700', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #333' },
  fieldGroup:     { marginBottom: 14 },
  label:          { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 5, letterSpacing: 0.5, display: 'block' },
  input:          { backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: 6, color: '#fff', padding: 9, fontSize: 12, width: '100%', boxSizing: 'border-box' },
  textarea:       { minHeight: 88, resize: 'vertical' },
  inputError:     { borderColor: '#ef4444', borderWidth: 1.5 },
  sectionHeading: { color: '#ffd700', fontSize: 11, fontWeight: '800', marginTop: 16, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #333', letterSpacing: 0.5 },
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NewspaperPage({ route, navigation }) {
  const { reporterName, reporterLocation, publishDate } = route?.params || {};
  const { templateId } = useTemplateStore();
  const { sections, activeSection, setActiveSection: _setActiveSection, resetAll, updateSection } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);

  const { loadLayout } = route?.params || {};

  // Set templateId synchronously BEFORE first render so correct Layout component is picked
  if (loadLayout?.templateId && useTemplateStore.getState().templateId !== loadLayout.templateId) {
    useTemplateStore.getState().setTemplateId(loadLayout.templateId);
  }

  useEffect(() => {
    if (loadLayout?.sections) {
      resetAll();
      Object.entries(loadLayout.sections).forEach(([sectionId, sectionData]) => {
        Object.entries(sectionData || {}).forEach(([key, val]) => {
          updateSection(sectionId, key, val);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (reporterName || reporterLocation || publishDate) {
      const sectionList = templateId === 'layout1' ? T1_SECTIONS : T2_SECTIONS;
      sectionList.filter(s => s.type === 'article').forEach(sec => {
        if (reporterName)     updateSection(sec.id, 'reporter', reporterName);
        if (reporterLocation) updateSection(sec.id, 'location', reporterLocation);
        if (publishDate)      updateSection(sec.id, 'date',     publishDate);
      });
      if (publishDate) updateSection('header', 'date', publishDate);
    }
  }, [reporterName, reporterLocation, publishDate, templateId]);

  const layoutScrollRef = useRef(null);
  const sectionRefs = useRef({});

  const setActiveSection = (id) => {
    _setActiveSection(id === 'headline' ? 'header' : id);
    setTimeout(() => {
      if (layoutScrollRef.current) {
        const SECTION_SCROLL_Y = {
          header: 0, headline: 0,
          left_big: 420, left_small: 900,
          center_top: 420, center_mid: 900,
          center_bottom: 1300, right: 420,
          footer: 1800,
        };
        const resolvedId = id === 'headline' ? 'header' : id;
        const y = SECTION_SCROLL_Y[resolvedId] || 0;
        layoutScrollRef.current.scrollTop = y;
      }
    }, 50);
  };
  const { generating } = usePdfStore();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const sectionList = templateId === 'layout1' ? T1_SECTIONS : T2_SECTIONS;
  const activeDef   = sectionList.find((s) => s.id === activeSection) || null;
  const Layout      = templateId === 'layout1' ? LayoutOne : LayoutTwo;

  const handleExport = async () => {
    try {
      window.print();
    } catch (e) {
      alert('Export failed: ' + e.message);
    }
  };

  const handleSavePublish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // UserStore implementation for web
      const user = await UserStore.getCurrentUser();
      if (!user) {
        alert('Please login again to save articles.');
        setIsSaving(false);
        return;
      }

      const sectionList = templateId === 'layout1' ? T1_SECTIONS : T2_SECTIONS;
      const articleSections = sectionList.filter(s => s.type === 'article');
      const today = new Date().toISOString().slice(0, 10);
      const newItems = [];

      for (const sec of articleSections) {
        const data = sections[sec.id] || {};
        const title = String(data.title || '').replace(/<[^>]*>/g, '').trim();
        const body  = String(data.body  || '').replace(/<[^>]*>/g, '').trim();
        if (!title || !body || body.length < 10) continue;
        newItems.push({
          id: `epaper-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${sec.id}`,
          title,
          description: String(data.body || data.sub || '').replace(/<[^>]*>/g, '').trim(),
          status: 'pending',
          state: String(data.location || '').trim(),
          publishDate: String(data.date || today),
          createdAt: new Date().toISOString(),
          createdBy: user.email,
          images: data.image ? [data.image] : [],
          views: 0, downloads: 0,
          reporter: String(data.reporter || '').trim(),
        });
      }

      if (newItems.length === 0) {
        alert('No articles found. Please fill in article title and body first.');
        setIsSaving(false);
        return;
      }

      const existing   = Array.isArray(user.epapers) ? user.epapers : [];
      const publishDay = newItems[0]?.publishDate || today;
      const filtered   = existing.filter(e => !(e.publishDate === publishDay && e.createdBy === user.email));
      const layoutSnapshot = {
        publishDate: publishDay,
        templateId: templateId,
        sections: useEditorStore.getState().sections,
        savedAt: new Date().toISOString(),
      };
      const existingLayouts = Array.isArray(user.newspaper_layouts) ? user.newspaper_layouts : [];
      const filteredLayouts = existingLayouts.filter(l => l.publishDate !== publishDay);
      const updatedUser = await UserStore.updateUser(user.email, {
        epapers: [...newItems, ...filtered],
        newspaper_layouts: [layoutSnapshot, ...filteredLayouts],
      });
      if (!updatedUser) throw new Error('Failed to update user');

      alert(`${newItems.length} article(s) saved successfully!`);
      setIsSaving(false);
      navigation.goBack();
    } catch (e) {
      alert('Save failed: ' + (e.message || 'Unknown error'));
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('All data will be reset. Are you sure?')) {
      resetAll();
    }
  };

  // ── WEB layout ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#111' }}>
      <style>{`
        @media print {
          .no-print { display:none !important; }
          * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
          body { margin:0 !important; padding:0 !important; }
          .newspaper-preview-wrap { box-shadow:none !important; }
          @page { size:A4 landscape; margin:5mm; }
        }
      `}</style>

      <div className="no-print" style={{
        background: '#111', borderBottom: '2px solid #ea580c',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ color: '#ffd700', fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>📰 Newspaper Designer</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => navigation.goBack()} style={webBtn('#444','#ccc')}>← Back</button>
          <button onClick={handleSavePublish} style={webBtn('#ea580c','#fff')} disabled={isSaving}>
            {isSaving ? '⏳ Saving...' : '💾 Save & Publish'}
          </button>
          <button onClick={() => setShowTemplateSelector(v => !v)} style={webBtn('#444','#ffd700')}>Add Pages</button>
          <button onClick={() => navigation.navigate('NewspaperPreview')} style={webBtn('#444','#ccc')}>👁 Preview</button>
          <button onClick={handleExport} style={webBtn('#16a34a','#fff')}>🖨️ Print</button>
          <button onClick={handleReset} style={webBtn('#444','#f87171')}>Reset</button>
        </div>
      </div>

      {showTemplateSelector && <TemplateSelector onSelect={() => setShowTemplateSelector(false)} />}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="no-print" style={{ width: 150, background: '#1a1a1a', borderRight: '1px solid #333', overflowY: 'auto', padding: '10px 0' }}>
          <div style={{ color: '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '0 12px 8px', textTransform: 'uppercase' }}>Sections</div>
          {sectionList.filter(sec => !sec.hidden).map(sec => (
            <div key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', cursor: 'pointer',
              borderLeft: `3px solid ${activeSection === sec.id ? '#ffd700' : 'transparent'}`,
              background: activeSection === sec.id ? '#1c1000' : 'transparent',
              color: activeSection === sec.id ? '#ffd700' : '#888',
              fontSize: 11,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: 4, background: activeSection === sec.id ? '#ffd700' : '#444', flexShrink: 0 }} />
              {sec.label}
            </div>
          ))}
        </div>

        <div ref={layoutScrollRef} style={{ flex: 1, background: '#e8e4df', overflowY: 'auto', padding: 20 }}>
          <div className="newspaper-preview-wrap" style={{ maxWidth: 1050, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            <Layout
              sections={sections}
              activeSection={activeSection}
              onSelectSection={setActiveSection}
              onSectionChange={(key, val) => useEditorStore.getState().updateSection(key, val)}
            />
          </div>
        </div>

        <div className="no-print" style={{ width: 280, background: '#1a1a1a', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <EditPanel sectionId={activeSection} sectionDef={activeDef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function webBtn(bg, color) {
  return { 
    background: bg, 
    color, 
    border: '1.5px solid ' + bg, 
    padding: '6px 14px', 
    borderRadius: 6, 
    fontSize: 11, 
    fontWeight: 700, 
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      opacity: 0.8
    }
  };
}