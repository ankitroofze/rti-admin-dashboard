import React, { useState, useRef } from 'react';

// सही import paths - ../../assets/images/ का use करें
import logoImg from '../../assets/images/rti.png';
import allIndiaRtiImg from '../../assets/images/all-india-rti.png';
import ePaperImg from '../../assets/images/e-paper-h.png';

const LOGO_SIZE = 160;

export default function HeaderBlock({ data = {}, isEditing = false, onDataChange }) {
  const [localLogoUri, setLocalLogoUri] = useState(data.logoUri || '');
  const fileInputRef = useRef(null);

  const handleWebLogoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLocalLogoUri(reader.result);
      if (onDataChange) onDataChange({ ...data, logoUri: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.container}>
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleWebLogoPick} />
      
      <div style={styles.header}>
        {/* 1. Top Row */}
        <div style={styles.topRow}>
          <div style={styles.contactSection}>
            <div style={styles.contactText}>M. 8484029332</div>
            <div style={styles.contactTextS}>7020667971</div>
          </div>
          
          {/* PRESS Box - छोटा किया गया */}
          <div style={styles.pressBox}>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#fff', marginBottom: '2px' }}></div>
            <span style={styles.pressText}>PRESS</span>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#fff', marginTop: '2px' }}></div>
          </div>
          
          <div style={styles.rightColumn}>
            <div style={styles.govtText}></div>
            <div style={styles.govtText}></div>
          </div>
        </div>

        {/* 2. Reg & All India Icon Row - RTI Icon ऊपर और Reg Number single line में */}
        <div style={styles.regSection}>
          <div style={styles.regInfo}>
            <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              REG. NO. : RNIMAH/MUL/2014/66399 | TITLE REGN. NO. : MAH/MUL/03200/13/1/2013-TC
            </span>
          </div>
          <div style={styles.rtiIconBox}>
            <img src={allIndiaRtiImg} alt="RTI Icon" style={{height: '87px', marginTop: '-25px', marginLeft: '-84px'}} />
          </div>
        </div>

        {/* 3. Black Banner with Image */}
        <div style={styles.logoBannerWrapper}>
          <div style={styles.blackBanner}>
            <img src={ePaperImg} alt="E-paper" style={{height: '93px', width: '800px', marginLeft: '150px'}} />
          </div>
          <div 
            style={{...styles.logoContainer, cursor: isEditing ? 'pointer' : 'default'}} 
            onClick={() => isEditing && fileInputRef.current?.click()}
            className="editable-logo-ring"
          >
            {localLogoUri ? (
              <img src={localLogoUri} alt="Logo" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
            ) : (
              <img src={logoImg} alt="Logo" style={{width:'100%', height:'100%'}}/>
            )}
          </div>
        </div>

        {/* 4. Tagline */}
        <div style={styles.taglineSection}>मराठी, हिंदी व इंग्रजी भाषेमध्ये सर्वत्र प्रसिद्ध होणारे एकमेव असे न्यूजपेपर</div>

        {/* 5. Website & Editor - Border सिर्फ इसी section तक */}
        <div style={styles.infoSection}>
          <div style={styles.webEmail}>web : www.rtinewsnetwork.com | e-mail : rticheck@gmail.com</div>
          <div style={styles.editorName}>मा. शौकत अब्दुलकलाम नायकवडी</div>
        </div>
        
        {/* Address Section - बिना border के */}
        <div style={styles.addressSection}>
          <div style={styles.officeInfo}><b>●</b> क्षेत्रीय कार्यालय : व्हीनस कॉर्नर, स्टेशन रोड, केव्हिज प्लाझा, कोल्हापूर.</div>
          <div style={styles.editorTitle}>मुख्य संपादक, संस्थापक, अध्यक्ष, प्रकाशक, मालक</div>
        </div>

        {/* 6. Date Strip */}
        <div style={styles.dateSection}>
          वर्ष : ६ वे ● महिना : मार्च २०१९ ● १२ अंक साठी वार्षिक वर्गणी : फक्त १५०/- ● Web : www.rtinewsnetwork.com
        </div>
      </div>

      <style>{`
        .editable-logo-ring:hover { transform: scale(1.05); transition: 0.3s; }
      `}</style>
    </div>
  );
}

const styles = {
  container: { width: '100%', backgroundColor: '#fff', padding: '10px', boxSizing: 'border-box', overflow: 'hidden' },
  header: { display: 'flex', flexDirection: 'column' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  contactSection: { display: 'flex', flexDirection: 'column', gap: '2px' },
  contactText: { fontSize: '24px', fontWeight: '800', color: '#000', lineHeight: '24px' },
  
  // PRESS Box - छोटा किया गया
  pressBox: { 
    backgroundColor: '#dd0000', 
    padding: '1px 15px',  // padding कम किया
    borderRadius: '30px',  // radius कम किया
    border: '2px solid #fff', 
    marginRight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  contactTextS: { fontSize: '24px', fontWeight: '800', color: '#000', lineHeight: '18px', marginLeft:'40px' },
  pressText: { fontSize: '35px', fontWeight: '900', color: '#fff', letterSpacing: '2px' }, // font थोड़ा छोटा
  rightColumn: { textAlign: 'right', fontSize: '13px', color: '#333' },
  govtText: { fontWeight: '600' },
  
  // Reg Section - RTI Icon ऊपर, Reg Number single line में
  regSection: { 
    display: 'flex', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    marginTop: '15px',
    position: 'relative'
  },
  
  regInfo: { 
    fontSize: '17px', 
    fontWeight: '700', 
    color: '#000', 
    marginLeft: '190px',
    marginTop: '10px',
    whiteSpace: 'nowrap'  // Single line में रखने के लिए
  },
  
  rtiIconBox: { 
    marginLeft: 'auto',
    marginTop: '-90px'  // RTI Icon को ऊपर
  },
  
  logoBannerWrapper: { position: 'relative', marginTop: '10px', height: '100px' },
  blackBanner: { backgroundColor: '#111', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoContainer: { position: 'absolute', top: '-27px', left: '20px', width: '160px', height: '160px', borderRadius: '50%', border: '12px solid #111', overflow: 'hidden', backgroundColor: '#fff' },
  taglineSection: { textAlign: 'center', fontSize: '20px', fontWeight: '800', marginTop: '10px' },
  
  // Info Section - Border सिर्फ इसी तक
  infoSection: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '10px', 
    borderBottom: '2px solid #000', 
    paddingBottom: '5px' 
  },
  
  webEmail: { fontSize: '20px', fontWeight: '700', color: '#000' },
  editorName: { fontSize: '22px', fontWeight: '900' },
  
  // Address Section - बिना border के
  addressSection: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '8px' 
  },
  
  officeInfo: { fontSize: '16px', color: '#000', paddingLeft: '20px', fontWeight: '500' },
  editorTitle: { fontSize: '15px', fontWeight: '900' },
  dateSection: { backgroundColor: '#111', color: '#fff', padding: '10px', marginTop: '10px', fontSize: '19px', textAlign: 'center', fontWeight: '700', letterSpacing: '1px' }
};
