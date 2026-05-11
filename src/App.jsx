import React, { useState, useMemo, useEffect, useRef } from 'react';

// ============================================================
// AUDIO ENGINE - Ambient memorial soundscape
// Note: For production, replace Web Speech API with ElevenLabs 
// or pre-recorded whispered audio files for better quality
// ============================================================

class MemorialAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.drones = [];
    this.whisperInterval = null;
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
  }

  createDrone(frequency, volume = 0.1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.value = frequency;
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    gain.gain.value = 0;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 2);
    
    return { osc, gain, filter };
  }

  // TODO: Replace with ElevenLabs API or pre-recorded files
  whisperName(name) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.rate = 0.7;
      utterance.pitch = 0.8;
      utterance.volume = 0.15;
      const voices = speechSynthesis.getVoices();
      const softVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.lang.startsWith('en'));
      if (softVoice) utterance.voice = softVoice;
      speechSynthesis.speak(utterance);
    }
  }

  playYahrzeitTone(intensity = 1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00];
    osc.frequency.value = frequencies[Math.floor(Math.random() * frequencies.length)];
    osc.type = 'sine';
    gain.gain.value = 0.2 * intensity;
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);
    osc.stop(this.ctx.currentTime + 3);
  }

  start(names, litNames) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    this.drones.push(this.createDrone(146.83, 0.08));
    this.drones.push(this.createDrone(220.00, 0.05));
    this.drones.push(this.createDrone(174.61, 0.04));
    
    let nameIndex = 0;
    this.whisperInterval = setInterval(() => {
      if (names.length > 0) {
        this.whisperName(names[nameIndex % names.length]);
        nameIndex++;
      }
    }, 8000);
    
    litNames.forEach((name, i) => {
      setTimeout(() => this.playYahrzeitTone(0.7), i * 2000);
    });
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    this.drones.forEach(({ osc, gain }) => {
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
      setTimeout(() => osc.stop(), 1500);
    });
    this.drones = [];
    
    if (this.whisperInterval) {
      clearInterval(this.whisperInterval);
      this.whisperInterval = null;
    }
  }
}

// ============================================================
// SVG ICONS
// ============================================================

const FlameIcon = ({ size = 20, intensity = 0 }) => {
  const glowing = intensity > 0;
  const opacity = Math.max(0.3, intensity);
  const id = `flame-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28" fill="none">
      <defs>
        {glowing && (
          <>
            <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={2 * intensity} result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id={`${id}-grad`} x1="10" y1="20" x2="10" y2="2">
              <stop offset="0%" stopColor={`rgba(255, 149, 0, ${opacity})`} />
              <stop offset="50%" stopColor={`rgba(255, 184, 77, ${opacity})`} />
              <stop offset="100%" stopColor={`rgba(255, 244, 214, ${opacity})`} />
            </linearGradient>
          </>
        )}
      </defs>
      <rect x="7" y="20" width="6" height="8" rx="1" fill="currentColor" opacity="0.4" />
      <path 
        d="M10 2C10 2 4 10 4 14C4 17.5 6.5 20 10 20C13.5 20 16 17.5 16 14C16 10 10 2 10 2Z" 
        fill={glowing ? `url(#${id}-grad)` : "currentColor"}
        opacity={glowing ? opacity : 0.5}
        filter={glowing ? `url(#${id}-glow)` : undefined}
      />
      {glowing && intensity > 0.5 && (
        <path d="M10 8C10 8 7 12 7 14C7 15.7 8.3 17 10 17C11.7 17 13 15.7 13 14C13 12 10 8 10 8Z" fill="#fff8e0" opacity={intensity * 0.9} />
      )}
    </svg>
  );
};

// Elegant sound wave icon
const SoundIcon = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill={active ? "#ffc870" : "currentColor"} opacity={active ? 1 : 0.5} />
    <path 
      d="M12 5C12 5 12 5 12 5C15.866 5 19 8.134 19 12C19 15.866 15.866 19 12 19" 
      stroke={active ? "#ffc870" : "currentColor"} 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity={active ? 0.8 : 0.3}
      fill="none"
    />
    <path 
      d="M12 1C12 1 12 1 12 1C18.075 1 23 5.925 23 12C23 18.075 18.075 23 12 23" 
      stroke={active ? "#ffc870" : "currentColor"} 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity={active ? 0.5 : 0.2}
      fill="none"
    />
  </svg>
);

const DecorativeLine = ({ width = 60, intensity = 0 }) => (
  <svg width={width} height="8" viewBox={`0 0 ${width} 8`}>
    <line x1="0" y1="4" x2={width} y2="4" stroke={intensity > 0 ? `rgba(255, 200, 120, ${0.3 + intensity * 0.3})` : "rgba(255,255,255,0.2)"} strokeWidth="1" />
    <circle cx={width/2} cy="4" r="2" fill={intensity > 0 ? `rgba(255, 200, 120, ${0.4 + intensity * 0.4})` : "rgba(255,255,255,0.3)"} />
  </svg>
);

// ============================================================
// SAMPLE DATA - with Hebrew names
// ============================================================

const sampleEntries = [
  { id: 1, name: "Ruth Goldberg", hebrewName: "רות בת אברהם", dateOfDeath: "1998-03-15", hebrewDate: "17 Adar 5758", relationship: "Grandmother", addedBy: "Sarah Goldberg", glowIntensity: 0 },
  { id: 2, name: "David Levine", hebrewName: "דוד בן יצחק", dateOfDeath: "2019-11-02", hebrewDate: "4 Cheshvan 5780", relationship: "Father", addedBy: "Michael Levine", glowIntensity: 0 },
  { id: 3, name: "Miriam Cohen", hebrewName: "מרים בת שמואל", dateOfDeath: "2005-06-22", hebrewDate: "15 Sivan 5765", relationship: "Mother", addedBy: "Rebecca Cohen", glowIntensity: 0 },
  { id: 4, name: "Samuel Rosen", hebrewName: "שמואל בן משה", dateOfDeath: "2022-02-13", hebrewDate: "12 Adar I 5782", relationship: "Husband", addedBy: "Hannah Rosen", glowIntensity: 0.25 },
  { id: 5, name: "Esther Shapiro", hebrewName: "אסתר בת יעקב", dateOfDeath: "1985-02-14", hebrewDate: "23 Shevat 5745", relationship: "Great-grandmother", addedBy: "Daniel Shapiro", glowIntensity: 0.2 },
  { id: 6, name: "Isaac Berkowitz", hebrewName: "יצחק בן אהרן", dateOfDeath: "2015-02-12", hebrewDate: "23 Shevat 5775", relationship: "Grandfather", addedBy: "Leah Berkowitz", glowIntensity: 0.5 },
  { id: 20, name: "Rebecca Stone", hebrewName: "רבקה בת דוד", dateOfDeath: "2008-02-12", hebrewDate: "6 Adar I 5768", relationship: "Aunt", addedBy: "David Stone", glowIntensity: 0.6 },
  { id: 21, name: "Helen Kaplan", hebrewName: "חנה בת מנחם", dateOfDeath: "2012-02-11", hebrewDate: "18 Shevat 5772", relationship: "Mother", addedBy: "Steven Kaplan", glowIntensity: 1.0 },
  { id: 22, name: "Morris Lieberman", hebrewName: "משה בן זאב", dateOfDeath: "1988-02-11", hebrewDate: "24 Shevat 5748", relationship: "Grandfather", addedBy: "Laura Lieberman", glowIntensity: 1.0 },
  { id: 23, name: "Yael Gutman", hebrewName: "יעל בת נתן", dateOfDeath: "2020-02-11", hebrewDate: "16 Shevat 5780", relationship: "Sister", addedBy: "Noa Gutman", glowIntensity: 1.0 },
  { id: 7, name: "Leah Friedman", hebrewName: "לאה בת שלמה", dateOfDeath: "2020-08-07", hebrewDate: "17 Av 5780", relationship: "Sister", addedBy: "Rachel Friedman", glowIntensity: 0 },
  { id: 8, name: "Abraham Katz", hebrewName: "אברהם בן יוסף", dateOfDeath: "2001-12-25", hebrewDate: "10 Tevet 5762", relationship: "Father", addedBy: "Jonah Katz", glowIntensity: 0 },
  { id: 9, name: "Sarah Weiss", hebrewName: "שרה בת בנימין", dateOfDeath: "2023-05-14", hebrewDate: "23 Iyyar 5783", relationship: "Wife", addedBy: "Nathan Weiss", glowIntensity: 0 },
  { id: 10, name: "Jacob Stern", hebrewName: "יעקב בן חיים", dateOfDeath: "1992-07-30", hebrewDate: "1 Av 5752", relationship: "Uncle", addedBy: "Lisa Stern", glowIntensity: 0 },
  { id: 11, name: "Hannah Adler", hebrewName: "חנה בת אליהו", dateOfDeath: "2018-02-04", hebrewDate: "19 Shevat 5778", relationship: "Mother", addedBy: "Josh Adler", glowIntensity: 0 },
  { id: 12, name: "Solomon Blum", hebrewName: "שלמה בן מאיר", dateOfDeath: "2010-10-11", hebrewDate: "3 Cheshvan 5771", relationship: "Father-in-law", addedBy: "Karen Blum", glowIntensity: 0 },
];

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const getYear = (dateStr) => new Date(dateStr + 'T12:00:00').getFullYear();

// ============================================================
// MEMORIAL PLAQUE - with Hebrew name
// ============================================================

function MemorialPlaque({ entry, onClick, zoom, onHover }) {
  const baseSize = zoom <= 0.6 ? 'compact' : zoom <= 1 ? 'normal' : 'large';
  const intensity = entry.glowIntensity || 0;
  const isLit = intensity > 0;
  
  const sizes = {
    compact: { width: '180px', height: '130px', nameFontSize: '15px', hebrewFontSize: '13px', detailFontSize: '11px', padding: '14px' },
    normal: { width: '260px', height: '175px', nameFontSize: '19px', hebrewFontSize: '16px', detailFontSize: '14px', padding: '20px' },
    large: { width: '340px', height: '220px', nameFontSize: '24px', hebrewFontSize: '20px', detailFontSize: '16px', padding: '26px' }
  };
  
  const s = sizes[baseSize];
  const glowOpacity = intensity * 0.4;
  const borderOpacity = 0.15 + (intensity * 0.25);
  const textGlow = intensity > 0.5 ? `0 0 ${20 * intensity}px rgba(255, 200, 120, ${intensity * 0.5})` : 'none';

  return (
    <div 
      style={{ position: 'relative', padding: '8px' }}
      onMouseEnter={() => onHover && onHover(entry)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      {isLit && (
        <>
          <div style={{
            position: 'absolute',
            inset: `${-25 * intensity}px`,
            background: `radial-gradient(ellipse at center, rgba(255, 200, 120, ${glowOpacity}) 0%, rgba(255, 180, 80, ${glowOpacity * 0.5}) 35%, transparent 70%)`,
            pointerEvents: 'none',
            animation: intensity === 1 ? 'softGlow 3s ease-in-out infinite' : 'none',
            filter: `blur(${15 * intensity}px)`,
            opacity: intensity
          }} />
          <div style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '6px',
            boxShadow: `0 0 ${30 * intensity}px rgba(255, 190, 100, ${0.3 + intensity * 0.3}), 0 0 ${60 * intensity}px rgba(255, 170, 70, ${intensity * 0.2})`,
            pointerEvents: 'none'
          }} />
        </>
      )}
      
      <div
        onClick={() => onClick(entry)}
        style={{
          width: s.width,
          height: s.height,
          background: isLit
            ? `linear-gradient(145deg, rgba(74, 69, 64, ${0.8 + intensity * 0.2}) 0%, rgba(58, 53, 48, ${0.8 + intensity * 0.2}) 40%, rgba(48, 43, 40, 0.9) 70%, rgba(40, 36, 32, 1) 100%)`
            : 'linear-gradient(145deg, #3d3a36 0%, #302d2a 40%, #282624 70%, #1f1e1c 100%)',
          borderRadius: '5px',
          padding: s.padding,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'all 0.4s ease, transform 0.2s ease',
          boxShadow: isLit
            ? `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,${0.05 + intensity * 0.1})`
            : '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: `1px solid rgba(${isLit ? '255, 200, 120' : '120, 110, 100'}, ${borderOpacity})`,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {/* English name */}
        <div style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: s.nameFontSize,
          fontWeight: '500',
          color: isLit ? '#fff' : '#f5f3f0',
          letterSpacing: '0.02em',
          lineHeight: '1.2',
          marginBottom: '4px',
          textShadow: textGlow
        }}>
          {entry.name}
        </div>

        {/* Hebrew name */}
        {entry.hebrewName && (
          <div style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: s.hebrewFontSize,
            color: isLit ? 'rgba(255, 230, 180, 0.9)' : 'rgba(255,255,255,0.6)',
            marginBottom: '8px',
            direction: 'rtl',
            letterSpacing: '0.02em'
          }}>
            {entry.hebrewName}
          </div>
        )}

        <DecorativeLine width={40} intensity={intensity} />

        {/* Hebrew date */}
        <div style={{
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: s.detailFontSize,
          fontWeight: '500',
          color: isLit ? `rgba(255, 230, 180, ${0.7 + intensity * 0.3})` : 'rgba(255,255,255,0.75)',
          marginTop: '8px'
        }}>
          {entry.hebrewDate}
        </div>
        
        {/* Gregorian date */}
        <div style={{
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: s.detailFontSize,
          color: isLit ? `rgba(255, 230, 180, ${0.6 + intensity * 0.25})` : 'rgba(255,255,255,0.55)',
          marginTop: '2px',
        }}>
          {formatDate(entry.dateOfDeath)}
        </div>

        {intensity > 0 && intensity < 1 && (
          <div style={{
            position: 'absolute',
            bottom: '6px',
            right: '8px',
            fontSize: '9px',
            color: `rgba(255, 200, 120, ${0.5 + intensity * 0.3})`,
            fontFamily: 'system-ui, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {intensity < 0.4 ? 'approaching' : 'tomorrow'}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DETAIL MODAL - with Hebrew name
// ============================================================

function DetailModal({ entry, onClose }) {
  if (!entry) return null;
  const intensity = entry.glowIntensity || 0;
  const isLit = intensity > 0;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.3s ease'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #3a3530 0%, #2a2520 50%, #1e1a18 100%)',
        borderRadius: '8px', padding: '56px 48px', maxWidth: '480px', width: '90%',
        textAlign: 'center', position: 'relative',
        border: isLit ? `1px solid rgba(255, 200, 120, ${0.2 + intensity * 0.2})` : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isLit ? `0 0 ${80 * intensity}px rgba(255, 180, 80, ${intensity * 0.25}), 0 25px 80px rgba(0,0,0,0.5)` : '0 25px 80px rgba(0,0,0,0.5)'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '32px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        
        <div style={{ marginBottom: '20px', color: isLit ? '#ffcc80' : 'rgba(255,255,255,0.3)' }}>
          <FlameIcon size={24} intensity={intensity} />
        </div>
        
        <h2 style={{
          fontFamily: '"Playfair Display", Georgia, serif', fontSize: '34px', fontWeight: '500',
          color: '#fff', marginBottom: '8px',
          textShadow: isLit ? `0 0 ${25 * intensity}px rgba(255, 200, 120, ${intensity * 0.4})` : 'none'
        }}>
          {entry.name}
        </h2>

        {entry.hebrewName && (
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: '22px',
            color: isLit ? 'rgba(255, 230, 180, 0.9)' : 'rgba(255,255,255,0.6)',
            marginBottom: '16px', direction: 'rtl'
          }}>
            {entry.hebrewName}
          </div>
        )}
        
        <div style={{ margin: '0 auto 20px', display: 'flex', justifyContent: 'center' }}>
          <DecorativeLine width={60} intensity={intensity} />
        </div>
        
        <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '20px', fontWeight: '500', color: isLit ? '#ffc870' : 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
          {entry.hebrewDate}
        </div>
        
        <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '17px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
          {formatDate(entry.dateOfDeath)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>Relationship</div>
            <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '17px', color: 'rgba(255,255,255,0.75)' }}>{entry.relationship}</div>
          </div>
        </div>

        <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
          Remembered by {entry.addedBy}
        </div>
        
        {intensity === 1 && (
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(255, 190, 100, 0.12) 0%, rgba(255, 160, 60, 0.06) 100%)', border: '1px solid rgba(255, 190, 100, 0.3)', borderRadius: '6px' }}>
            <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '19px', color: '#ffc870', marginBottom: '6px' }}>Today is the Yahrzeit</div>
            <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '15px', color: 'rgba(255, 220, 150, 0.75)' }}>This memorial is illuminated in their memory</div>
          </div>
        )}

        {intensity > 0 && intensity < 1 && (
          <div style={{ padding: '16px 20px', background: 'rgba(255, 190, 100, 0.08)', border: '1px solid rgba(255, 190, 100, 0.2)', borderRadius: '6px' }}>
            <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '16px', color: 'rgba(255, 200, 120, 0.8)' }}>
              Yahrzeit approaching {intensity < 0.4 ? 'in a few days' : 'tomorrow'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ADD ENTRY FORM - with optional Hebrew name
// ============================================================

function AddEntryForm({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  
  // Deceased info
  const [name, setName] = useState('');
  const [hebrewName, setHebrewName] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [timeOfDeath, setTimeOfDeath] = useState('');
  const [relationship, setRelationship] = useState('');
  
  // Submitter info
  const [yourName, setYourName] = useState('');
  const [yourEmail, setYourEmail] = useState('');
  
  // Consent
  const [consentReminders, setConsentReminders] = useState(true);
  const [consentNewsletter, setConsentNewsletter] = useState(false);
  
  const [submitted, setSubmitted] = useState(false);

  const relationships = ['Mother', 'Father', 'Grandmother', 'Grandfather', 'Wife', 'Husband', 'Sister', 'Brother', 'Son', 'Daughter', 'Aunt', 'Uncle', 'Friend', 'Other'];
  
  const timesOfDeath = [
    { value: 'morning', label: 'Morning (sunrise to noon)' },
    { value: 'afternoon', label: 'Afternoon (noon to sunset)' },
    { value: 'evening', label: 'Evening/Night (after sunset)' },
    { value: 'unknown', label: "I don't know" }
  ];

  const handleSubmit = () => {
    if (name && dateOfDeath && relationship && yourName && yourEmail) {
      onAdd({
        id: Date.now(),
        name,
        hebrewName: hebrewName || null,
        dateOfDeath,
        timeOfDeath,
        relationship,
        hebrewDate: '—', // Will be calculated from date + time
        addedBy: yourName,
        addedByEmail: yourEmail,
        consentReminders,
        consentNewsletter,
        glowIntensity: 0
      });
      setSubmitted(true);
    }
  };

  const isStep1Valid = name && dateOfDeath && timeOfDeath && relationship;
  const isStep2Valid = yourName && yourEmail && yourEmail.includes('@');

  const inputStyle = {
    width: '100%', padding: '14px 16px', fontSize: '16px',
    fontFamily: '"EB Garamond", Georgia, serif',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '5px', color: '#fff', boxSizing: 'border-box', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontFamily: 'system-ui, sans-serif', fontSize: '11px',
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.5)', marginBottom: '8px'
  };
  
  const checkboxLabelStyle = {
    display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer',
    fontFamily: '"EB Garamond", Georgia, serif', fontSize: '15px',
    color: 'rgba(255,255,255,0.75)', lineHeight: '1.4'
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)',
      overflowY: 'auto'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #3a3530 0%, #2a2520 50%, #1e1a18 100%)',
        borderRadius: '8px', padding: '40px 44px', maxWidth: '540px', width: '100%',
        position: 'relative', border: '1px solid rgba(255,255,255,0.1)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '28px', cursor: 'pointer' }}>×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ marginBottom: '24px', color: '#ffcc80' }}><FlameIcon size={40} intensity={1} /></div>
            <h3 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '16px' }}>Name Inscribed</h3>
            <p style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              {name} has been added to the Wall.
            </p>
            {consentReminders && (
              <p style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '16px', color: 'rgba(255, 200, 120, 0.7)' }}>
                We'll send reminders to {yourEmail} for shloshim, yizkor, and yahrzeit.
              </p>
            )}
            <button onClick={onClose} style={{ marginTop: '28px', padding: '14px 32px', background: 'rgba(255, 190, 100, 0.12)', border: '1px solid rgba(255, 190, 100, 0.35)', borderRadius: '5px', color: '#ffc870', fontSize: '17px', cursor: 'pointer' }}>Return to Wall</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ marginBottom: '12px', color: 'rgba(255, 200, 120, 0.6)' }}><FlameIcon size={24} intensity={0} /></div>
              <h3 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '8px' }}>Inscribe a Name</h3>
              <p style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '15px', color: 'rgba(255,255,255,0.5)' }}>
                Step {step} of 2: {step === 1 ? 'About your loved one' : 'Your information'}
              </p>
            </div>
            
            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255, 190, 100, 0.6)' }} />
              <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= 2 ? 'rgba(255, 190, 100, 0.6)' : 'rgba(255,255,255,0.15)' }} />
            </div>

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>Full Name of Deceased</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter their full name" style={inputStyle} />
                </div>
                
                <div>
                  <label style={labelStyle}>
                    Hebrew Name <span style={{ opacity: 0.5, fontWeight: '400', textTransform: 'none' }}>(optional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={hebrewName} 
                    onChange={e => setHebrewName(e.target.value)} 
                    placeholder="e.g., משה בן אברהם" 
                    style={{ ...inputStyle, direction: 'rtl', textAlign: 'right' }} 
                  />
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px', lineHeight: '1.5' }}>
                    Type the Hebrew name, or{' '}
                    <span style={{ color: 'rgba(255, 200, 120, 0.7)', cursor: 'pointer', borderBottom: '1px solid rgba(255, 200, 120, 0.3)' }}>
                      upload a photo
                    </span>
                    {' '}of the name from a siddur, ketubah, or headstone.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Date of Passing</label>
                    <input type="date" value={dateOfDeath} onChange={e => setDateOfDeath(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Time of Passing</label>
                    <select value={timeOfDeath} onChange={e => setTimeOfDeath(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Select...</option>
                      {timesOfDeath.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '-10px', lineHeight: '1.5' }}>
                  Time of passing helps calculate the correct Hebrew date for yahrzeit.
                </p>
                
                <div>
                  <label style={labelStyle}>Your Relationship to Them</label>
                  <select value={relationship} onChange={e => setRelationship(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select...</option>
                    {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                
                <button 
                  onClick={() => setStep(2)} 
                  disabled={!isStep1Valid} 
                  style={{
                    marginTop: '8px', padding: '16px 32px',
                    background: isStep1Valid ? 'linear-gradient(135deg, rgba(255, 190, 100, 0.18) 0%, rgba(255, 160, 60, 0.1) 100%)' : 'rgba(255,255,255,0.03)',
                    border: isStep1Valid ? '1px solid rgba(255, 190, 100, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '5px', color: isStep1Valid ? '#ffe0a0' : 'rgba(255,255,255,0.3)',
                    fontFamily: '"EB Garamond", Georgia, serif', fontSize: '17px', cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>Your Name</label>
                  <input type="text" value={yourName} onChange={e => setYourName(e.target.value)} placeholder="Enter your name" style={inputStyle} />
                </div>
                
                <div>
                  <label style={labelStyle}>Your Email</label>
                  <input type="email" value={yourEmail} onChange={e => setYourEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
                </div>
                
                {/* Consent checkboxes */}
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={checkboxLabelStyle}>
                    <input 
                      type="checkbox" 
                      checked={consentReminders} 
                      onChange={e => setConsentReminders(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#ffc870', marginTop: '2px', flexShrink: 0 }}
                    />
                    <span>
                      <strong style={{ color: '#fff' }}>Send me remembrance reminders</strong><br />
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
                        Receive email reminders before shloshim (30 days), each yizkor, and the annual yahrzeit.
                      </span>
                    </span>
                  </label>
                  
                  <label style={checkboxLabelStyle}>
                    <input 
                      type="checkbox" 
                      checked={consentNewsletter} 
                      onChange={e => setConsentNewsletter(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#ffc870', marginTop: '2px', flexShrink: 0 }}
                    />
                    <span>
                      <strong style={{ color: '#fff' }}>Join our Loss & Mourning series</strong><br />
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
                        Receive thoughtful content on grief, healing, and Jewish mourning traditions.
                      </span>
                    </span>
                  </label>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button 
                    onClick={() => setStep(1)} 
                    style={{
                      padding: '16px 24px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px', color: 'rgba(255,255,255,0.6)',
                      fontFamily: '"EB Garamond", Georgia, serif', fontSize: '16px', cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={!isStep2Valid} 
                    style={{
                      flex: 1, padding: '16px 32px',
                      background: isStep2Valid ? 'linear-gradient(135deg, rgba(255, 190, 100, 0.18) 0%, rgba(255, 160, 60, 0.1) 100%)' : 'rgba(255,255,255,0.03)',
                      border: isStep2Valid ? '1px solid rgba(255, 190, 100, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '5px', color: isStep2Valid ? '#ffe0a0' : 'rgba(255,255,255,0.3)',
                      fontFamily: '"Playfair Display", Georgia, serif', fontSize: '17px', cursor: isStep2Valid ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Inscribe on the Wall
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// FLOATING SOUND TOGGLE
// ============================================================

function SoundToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={enabled ? 'Sound on — click to mute' : 'Enable ambient soundscape'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: enabled 
          ? 'linear-gradient(135deg, rgba(255, 190, 100, 0.25) 0%, rgba(255, 160, 60, 0.15) 100%)'
          : 'rgba(30, 26, 21, 0.9)',
        border: enabled 
          ? '1px solid rgba(255, 190, 100, 0.5)'
          : '1px solid rgba(255,255,255,0.15)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: enabled
          ? '0 4px 20px rgba(255, 180, 80, 0.3), 0 8px 32px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        zIndex: 100,
        color: enabled ? '#ffc870' : 'rgba(255,255,255,0.5)'
      }}
    >
      <SoundIcon size={24} active={enabled} />
    </button>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [entries, setEntries] = useState(sampleEntries);
  const [sortBy, setSortBy] = useState('name');
  const [showLitOnly, setShowLitOnly] = useState(false);
  const [showApproaching, setShowApproaching] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState(null);
  
  const audioRef = useRef(null);

  const rememberingCount = entries.filter(e => e.glowIntensity === 1).length;
  const approachingCount = entries.filter(e => e.glowIntensity > 0 && e.glowIntensity < 1).length;

  useEffect(() => {
    audioRef.current = new MemorialAudio();
    return () => { if (audioRef.current) audioRef.current.stop(); };
  }, []);

  const toggleSound = async () => {
    if (!audioRef.current) return;
    if (soundEnabled) {
      audioRef.current.stop();
      setSoundEnabled(false);
    } else {
      await audioRef.current.init();
      const names = entries.map(e => e.name);
      const litNames = entries.filter(e => e.glowIntensity === 1).map(e => e.name);
      audioRef.current.start(names, litNames);
      setSoundEnabled(true);
    }
  };

  useEffect(() => {
    if (soundEnabled && hoveredEntry && hoveredEntry.glowIntensity > 0 && audioRef.current) {
      audioRef.current.playYahrzeitTone(hoveredEntry.glowIntensity);
    }
  }, [hoveredEntry, soundEnabled]);

  const sortedEntries = useMemo(() => {
    let filtered = entries;
    if (showLitOnly) {
      filtered = entries.filter(e => e.glowIntensity === 1);
    } else if (showApproaching) {
      filtered = entries.filter(e => e.glowIntensity > 0 && e.glowIntensity < 1);
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        const lastA = a.name.split(' ').pop() || '';
        const lastB = b.name.split(' ').pop() || '';
        return lastA.localeCompare(lastB);
      } else if (sortBy === 'year') {
        return getYear(a.dateOfDeath) - getYear(b.dateOfDeath);
      } else {
        const dA = new Date(a.dateOfDeath);
        const dB = new Date(b.dateOfDeath);
        return (dA.getMonth() * 31 + dA.getDate()) - (dB.getMonth() * 31 + dB.getDate());
      }
    });
  }, [entries, sortBy, showLitOnly, showApproaching]);

  const handleAdd = (newEntry) => setEntries(prev => [...prev, newEntry]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400&family=EB+Garamond:wght@400;500&family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');
        
        @keyframes softGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus, select:focus { border-color: rgba(255, 190, 100, 0.4) !important; background: rgba(255,255,255,0.08) !important; }
        option { background: #2a2520; color: #fff; }
        
        /* Range slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          height: 4px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #ffc870 0%, #ffa040 100%);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(255, 180, 80, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #ffc870 0%, #ffa040 100%);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 12px rgba(255, 180, 80, 0.5);
        }
      `}</style>

      {/* BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #2d2520 0%, #252018 50%, #1e1a15 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, rgba(90, 70, 50, 0.12) 0px, rgba(90, 70, 50, 0.12) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(0deg, rgba(70, 55, 40, 0.08) 0px, rgba(70, 55, 40, 0.08) 1px, transparent 1px, transparent 23px)` }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, transparent 0%, rgba(0,0,0,0.3) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* MJL TOP BAR */}
        <div style={{ padding: '12px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            My Jewish Learning
          </div>
          <a
            href="https://kaddish-hub.vercel.app"
            style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", fontSize: 13, color: '#B8976A', textDecoration: 'none', opacity: 0.85 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
          >
            ← Back to Kaddish Hub
          </a>
        </div>

        {/* HEADER */}
        <header style={{ padding: '32px 48px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant", Georgia, serif', fontSize: '48px', fontWeight: '400', fontStyle: 'italic', color: '#fff', letterSpacing: '-0.01em', lineHeight: '1.1', marginBottom: '6px' }}>
              Wall of Remembrance
            </h1>
            
            <p style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: '17px', color: 'rgba(255,255,255,0.6)' }}>
              {entries.length} names inscribed
              {rememberingCount > 0 && (
                <span 
                  onClick={() => { setShowLitOnly(!showLitOnly); setShowApproaching(false); }}
                  style={{ 
                    color: showLitOnly ? '#ffdd99' : '#ffc870', 
                    marginLeft: '12px', 
                    fontWeight: '500', 
                    cursor: 'pointer', 
                    borderBottom: showLitOnly ? '2px solid #ffc870' : '1px solid rgba(255, 200, 100, 0.4)', 
                    paddingBottom: '1px' 
                  }}
                >
                  · {rememberingCount} remembering with you today
                </span>
              )}
              {approachingCount > 0 && (
                <span 
                  onClick={() => { setShowApproaching(!showApproaching); setShowLitOnly(false); }}
                  style={{ 
                    color: showApproaching ? 'rgba(255, 220, 150, 0.9)' : 'rgba(255, 200, 120, 0.6)', 
                    marginLeft: '12px',
                    cursor: 'pointer',
                    borderBottom: showApproaching ? '2px solid rgba(255, 200, 120, 0.7)' : '1px solid rgba(255, 200, 120, 0.25)',
                    paddingBottom: '1px'
                  }}
                >
                  · {approachingCount} approaching
                </span>
              )}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, rgba(255, 190, 100, 0.15) 0%, rgba(255, 160, 60, 0.08) 100%)',
                border: '1px solid rgba(255, 190, 100, 0.4)',
                borderRadius: '5px',
                color: '#ffe0a0',
                fontFamily: '"EB Garamond", Georgia, serif',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <FlameIcon size={14} intensity={0} />
              <span>Inscribe a Name</span>
            </button>
            <a 
              href="https://www.myjewishlearning.com/article/say-kaddish-online-with-mjl/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                fontSize: '15px',
                color: 'rgba(255, 200, 120, 0.7)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255, 200, 120, 0.3)',
                paddingBottom: '1px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffc870'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 200, 120, 0.7)'}
            >
              Join daily Kaddish minyan →
            </a>
          </div>
        </header>

        {/* CONTROLS BAR */}
        <div style={{ padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>Sort by:</span>
            {[{ id: 'name', label: 'Last Name' }, { id: 'year', label: 'Year' }, { id: 'day', label: 'Calendar Day' }].map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)} style={{
                padding: '10px 20px',
                background: sortBy === s.id ? 'rgba(255, 190, 100, 0.12)' : 'rgba(255,255,255,0.04)',
                border: sortBy === s.id ? '1px solid rgba(255, 190, 100, 0.35)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '5px',
                color: sortBy === s.id ? '#ffc870' : 'rgba(255,255,255,0.7)',
                fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              }}>{s.label}</button>
            ))}
            
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 12px' }} />
            
            <button onClick={() => { setShowLitOnly(!showLitOnly); setShowApproaching(false); }} style={{
              padding: '10px 20px',
              background: showLitOnly ? 'rgba(255, 190, 100, 0.18)' : 'rgba(255,255,255,0.04)',
              border: showLitOnly ? '1px solid rgba(255, 190, 100, 0.45)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '5px',
              color: showLitOnly ? '#ffcc70' : 'rgba(255,255,255,0.7)',
              fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <FlameIcon size={12} intensity={showLitOnly ? 1 : 0} />
              <span>Today Only</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>Zoom:</span>
            <button onClick={() => setZoom(Math.max(0.4, zoom - 0.2))} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <input 
              type="range" 
              min="0.4" 
              max="1.6" 
              step="0.1" 
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ 
                width: '120px', 
                height: '4px', 
                appearance: 'none',
                WebkitAppearance: 'none',
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '2px',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
            <button onClick={() => setZoom(Math.min(1.6, zoom + 0.2))} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>

        {/* THE WALL */}
        <div style={{ padding: '40px 48px' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
            padding: '32px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.04)', minHeight: '450px'
          }}>
            {sortedEntries.map((entry, i) => (
              <div key={entry.id} style={{ animation: `fadeIn 0.4s ease ${Math.min(i * 0.04, 0.35)}s both` }}>
                <MemorialPlaque entry={entry} onClick={setSelectedEntry} zoom={zoom} onHover={setHoveredEntry} />
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ padding: '40px 48px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: '"Cormorant", Georgia, serif', fontSize: '22px', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', maxWidth: '600px', margin: '0 auto 10px', lineHeight: '1.5' }}>
            "As long as we live, they too will live, for they are now a part of us, as we remember them."
          </p>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginBottom: '32px' }}>— Gates of Prayer</p>
          
          {/* Powered by - subtle, below quote */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px',
          }}>
            <span style={{ 
              fontFamily: 'system-ui, sans-serif', 
              fontSize: '10px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.25)'
            }}>
              powered by
            </span>
            <a 
              href="https://70facesmedia.org" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <svg height="16" viewBox="0 0 140 28" fill="none" style={{ opacity: 0.5, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
                <text x="0" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="800" fill="rgba(255, 220, 170, 0.8)" letterSpacing="-1">70</text>
                <text x="32" y="14" fontFamily="system-ui, -apple-system, sans-serif" fontSize="9" fontWeight="600" fill="rgba(255, 220, 170, 0.7)" letterSpacing="0.5">FACES</text>
                <text x="32" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="9" fontWeight="600" fill="rgba(255, 220, 170, 0.7)" letterSpacing="0.5">MEDIA</text>
              </svg>
            </a>
          </div>
        </footer>
      </div>

      {/* FLOATING SOUND TOGGLE */}
      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />

      {selectedEntry && <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
      {showAddForm && <AddEntryForm onClose={() => setShowAddForm(false)} onAdd={handleAdd} />}
    </div>
  );
}
