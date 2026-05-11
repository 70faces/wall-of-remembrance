import React, { useState, useMemo, useCallback } from 'react';

// ============================================================
// DATA & HELPERS
// ============================================================

const sampleEntries = [
  { id: 1, name: "Ruth Goldberg", dateOfDeath: "1998-03-15", timeOfDeath: "morning", relationship: "Grandmother", hebrewDate: "17 Adar 5758", addedBy: "Sarah Goldberg" },
  { id: 2, name: "David Levine", dateOfDeath: "2019-11-02", timeOfDeath: "afternoon", relationship: "Father", hebrewDate: "4 Cheshvan 5780", addedBy: "Michael Levine" },
  { id: 3, name: "Miriam Cohen", dateOfDeath: "2005-06-22", timeOfDeath: "morning", relationship: "Mother", hebrewDate: "15 Sivan 5765", addedBy: "Rebecca Cohen" },
  { id: 4, name: "Samuel Rosen", dateOfDeath: "2022-01-10", timeOfDeath: "afternoon", relationship: "Husband", hebrewDate: "8 Shevat 5782", addedBy: "Hannah Rosen" },
  { id: 5, name: "Esther Shapiro", dateOfDeath: "1985-09-03", timeOfDeath: "morning", relationship: "Great-grandmother", hebrewDate: "17 Elul 5745", addedBy: "Daniel Shapiro" },
  { id: 6, name: "Isaac Berkowitz", dateOfDeath: "2015-04-18", timeOfDeath: "afternoon", relationship: "Grandfather", hebrewDate: "29 Nisan 5775", addedBy: "Leah Berkowitz" },
  { id: 7, name: "Leah Friedman", dateOfDeath: "2020-08-07", timeOfDeath: "morning", relationship: "Sister", hebrewDate: "17 Av 5780", addedBy: "Rachel Friedman" },
  { id: 8, name: "Abraham Katz", dateOfDeath: "2001-12-25", timeOfDeath: "afternoon", relationship: "Father", hebrewDate: "10 Tevet 5762", addedBy: "Jonah Katz" },
  { id: 9, name: "Sarah Weiss", dateOfDeath: "2023-05-14", timeOfDeath: "morning", relationship: "Wife", hebrewDate: "23 Iyyar 5783", addedBy: "Nathan Weiss" },
  { id: 10, name: "Jacob Stern", dateOfDeath: "1992-07-30", timeOfDeath: "afternoon", relationship: "Uncle", hebrewDate: "1 Av 5752", addedBy: "Lisa Stern" },
  { id: 11, name: "Hannah Adler", dateOfDeath: "2018-02-04", timeOfDeath: "morning", relationship: "Mother", hebrewDate: "19 Shevat 5778", addedBy: "Josh Adler" },
  { id: 12, name: "Solomon Blum", dateOfDeath: "2010-10-11", timeOfDeath: "afternoon", relationship: "Father-in-law", hebrewDate: "3 Cheshvan 5771", addedBy: "Karen Blum" },
  { id: 13, name: "Naomi Greenberg", dateOfDeath: "2024-03-22", timeOfDeath: "morning", relationship: "Grandmother", hebrewDate: "12 Adar II 5784", addedBy: "Ari Greenberg" },
  { id: 14, name: "Benjamin Schwartz", dateOfDeath: "1979-06-15", timeOfDeath: "afternoon", relationship: "Grandfather", hebrewDate: "20 Sivan 5739", addedBy: "Emily Schwartz" },
  { id: 15, name: "Rachel Horowitz", dateOfDeath: "2016-09-28", timeOfDeath: "morning", relationship: "Aunt", hebrewDate: "25 Elul 5776", addedBy: "David Horowitz" },
  { id: 16, name: "Eli Marcus", dateOfDeath: "2021-07-19", timeOfDeath: "afternoon", relationship: "Son", hebrewDate: "10 Av 5781", addedBy: "Jonathan Marcus" },
  { id: 17, name: "Deborah Singer", dateOfDeath: "2003-11-08", timeOfDeath: "morning", relationship: "Mother", hebrewDate: "13 Cheshvan 5764", addedBy: "Amy Singer-Roth" },
  { id: 18, name: "Joseph Zimmerman", dateOfDeath: "2025-01-15", timeOfDeath: "afternoon", relationship: "Brother", hebrewDate: "15 Tevet 5785", addedBy: "Mark Zimmerman" },
  { id: 19, name: "Rivka Baum", dateOfDeath: "1996-04-02", timeOfDeath: "morning", relationship: "Grandmother", hebrewDate: "13 Nisan 5756", addedBy: "Talia Baum" },
  { id: 20, name: "Max Feldman", dateOfDeath: "2017-08-21", timeOfDeath: "afternoon", relationship: "Husband", hebrewDate: "29 Av 5777", addedBy: "Judith Feldman" },
  // Entries with today's date (Feb 4) across different years for demo
  { id: 21, name: "Helen Kaplan", dateOfDeath: "2012-02-04", timeOfDeath: "morning", relationship: "Mother", hebrewDate: "11 Shevat 5772", addedBy: "Steven Kaplan" },
  { id: 22, name: "Morris Lieberman", dateOfDeath: "1988-02-04", timeOfDeath: "afternoon", relationship: "Grandfather", hebrewDate: "17 Shevat 5748", addedBy: "Laura Lieberman" },
  { id: 23, name: "Yael Gutman", dateOfDeath: "2020-02-04", timeOfDeath: "morning", relationship: "Sister", hebrewDate: "9 Shevat 5780", addedBy: "Noa Gutman" },
  { id: 24, name: "Chaim Rosenberg", dateOfDeath: "2007-02-04", timeOfDeath: "afternoon", relationship: "Father", hebrewDate: "16 Shevat 5767", addedBy: "Aaron Rosenberg" },
];

function isYahrzeitToday(dateOfDeath) {
  const d = new Date(dateOfDeath);
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getYear(dateStr) {
  return new Date(dateStr + 'T12:00:00').getFullYear();
}

// ============================================================
// MEMORIAL PLAQUE COMPONENT
// ============================================================

function MemorialPlaque({ entry, isLit, onClick, zoom }) {
  const baseSize = zoom <= 0.6 ? 'compact' : zoom <= 1 ? 'normal' : 'large';
  
  const sizes = {
    compact: { width: '140px', height: '100px', nameFontSize: '11px', detailFontSize: '0px', showDetails: false, padding: '10px' },
    normal: { width: '200px', height: '160px', nameFontSize: '15px', detailFontSize: '11px', showDetails: true, padding: '16px' },
    large: { width: '280px', height: '220px', nameFontSize: '20px', detailFontSize: '13px', showDetails: true, padding: '24px' }
  };
  
  const s = sizes[baseSize];

  return (
    <div
      onClick={() => onClick(entry)}
      style={{
        width: s.width,
        height: s.height,
        background: isLit
          ? 'linear-gradient(145deg, #d4a84b 0%, #c49a3c 30%, #b8892f 60%, #a67824 100%)'
          : 'linear-gradient(145deg, #8b7355 0%, #7a6548 30%, #6d5a3f 60%, #5c4d36 100%)',
        borderRadius: '2px',
        padding: s.padding,
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.4s ease',
        boxShadow: isLit
          ? '0 0 30px rgba(212, 168, 75, 0.5), 0 0 60px rgba(212, 168, 75, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: isLit
          ? '1px solid rgba(255, 215, 140, 0.6)'
          : '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden'
      }}
    >
      {/* Texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none'
      }} />

      {/* Candle flame for lit plaques */}
      {isLit && baseSize !== 'compact' && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '10px',
          fontSize: baseSize === 'large' ? '16px' : '12px',
          animation: 'flicker 2s ease-in-out infinite'
        }}>
          🕯️
        </div>
      )}

      {/* Decorative line top */}
      <div style={{
        position: 'absolute',
        top: baseSize === 'compact' ? '6px' : '10px',
        left: '15%',
        right: '15%',
        height: '1px',
        background: isLit ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'
      }} />

      {/* Star of David - only on normal and large */}
      {baseSize !== 'compact' && (
        <div style={{
          fontSize: baseSize === 'large' ? '14px' : '10px',
          color: isLit ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
          marginBottom: '6px',
          letterSpacing: '0.1em'
        }}>
          ✡
        </div>
      )}

      {/* Name */}
      <div style={{
        fontFamily: '"Cormorant Garamond", "Palatino", Georgia, serif',
        fontSize: s.nameFontSize,
        fontWeight: '600',
        color: isLit ? '#fff' : 'rgba(255,255,255,0.75)',
        letterSpacing: '0.04em',
        lineHeight: '1.2',
        marginBottom: s.showDetails ? '6px' : '0',
        position: 'relative',
        zIndex: 1
      }}>
        {entry.name}
      </div>

      {/* Date */}
      {s.showDetails && (
        <div style={{
          fontFamily: '"EB Garamond", "Palatino", Georgia, serif',
          fontSize: s.detailFontSize,
          color: isLit ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)',
          letterSpacing: '0.03em',
          position: 'relative',
          zIndex: 1
        }}>
          {entry.hebrewDate}
        </div>
      )}
      {s.showDetails && (
        <div style={{
          fontFamily: '"EB Garamond", "Palatino", Georgia, serif',
          fontSize: s.detailFontSize,
          color: isLit ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
          marginTop: '2px',
          position: 'relative',
          zIndex: 1
        }}>
          {formatDate(entry.dateOfDeath)}
        </div>
      )}

      {/* Decorative line bottom */}
      <div style={{
        position: 'absolute',
        bottom: baseSize === 'compact' ? '6px' : '10px',
        left: '15%',
        right: '15%',
        height: '1px',
        background: isLit ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'
      }} />
    </div>
  );
}

// ============================================================
// DETAIL MODAL
// ============================================================

function DetailModal({ entry, isLit, onClose }) {
  if (!entry) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #2a2218 0%, #1f1912 100%)',
          borderRadius: '4px',
          padding: '48px 40px',
          maxWidth: '440px',
          width: '100%',
          position: 'relative',
          border: '1px solid rgba(212, 168, 75, 0.3)',
          boxShadow: isLit
            ? '0 0 60px rgba(212, 168, 75, 0.3), 0 20px 60px rgba(0,0,0,0.5)'
            : '0 20px 60px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        {/* Candle */}
        {isLit && (
          <div style={{
            fontSize: '32px',
            marginBottom: '16px',
            animation: 'flicker 2s ease-in-out infinite'
          }}>
            🕯️
          </div>
        )}

        {/* Star of David */}
        <div style={{
          fontSize: '18px',
          color: isLit ? 'rgba(212, 168, 75, 0.8)' : 'rgba(255,255,255,0.25)',
          marginBottom: '20px'
        }}>
          ✡
        </div>

        {/* Decorative line */}
        <div style={{
          width: '60px',
          height: '1px',
          background: isLit ? 'rgba(212, 168, 75, 0.6)' : 'rgba(255,255,255,0.2)',
          margin: '0 auto 24px'
        }} />

        {/* Name */}
        <h2 style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: '32px',
          fontWeight: '600',
          color: isLit ? '#d4a84b' : 'rgba(255,255,255,0.85)',
          marginBottom: '8px',
          letterSpacing: '0.02em'
        }}>
          {entry.name}
        </h2>

        {/* Hebrew date */}
        <div style={{
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: '16px',
          color: isLit ? 'rgba(212, 168, 75, 0.7)' : 'rgba(255,255,255,0.5)',
          marginBottom: '4px'
        }}>
          {entry.hebrewDate}
        </div>

        {/* Gregorian date */}
        <div style={{
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: '15px',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '24px'
        }}>
          {formatDate(entry.dateOfDeath)}
        </div>

        {/* Decorative line */}
        <div style={{
          width: '40px',
          height: '1px',
          background: 'rgba(255,255,255,0.15)',
          margin: '0 auto 24px'
        }} />

        {/* Details */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{
              fontFamily: '"Source Sans Pro", sans-serif',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '4px'
            }}>
              Relationship
            </div>
            <div style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)'
            }}>
              {entry.relationship}
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: '"Source Sans Pro", sans-serif',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '4px'
            }}>
              Time of Passing
            </div>
            <div style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'capitalize'
            }}>
              {entry.timeOfDeath}
            </div>
          </div>
        </div>

        {/* Remembered by */}
        <div style={{
          fontFamily: '"Source Sans Pro", sans-serif',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.35)'
        }}>
          Remembered by {entry.addedBy}
        </div>

        {/* Yahrzeit banner */}
        {isLit && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(212, 168, 75, 0.1)',
            border: '1px solid rgba(212, 168, 75, 0.25)',
            borderRadius: '4px'
          }}>
            <div style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '16px',
              fontWeight: '600',
              color: '#d4a84b',
              marginBottom: '4px'
            }}>
              Today is the Yahrzeit
            </div>
            <div style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: '14px',
              color: 'rgba(212, 168, 75, 0.7)'
            }}>
              This plaque is illuminated in their memory
            </div>
          </div>
        )}

        {/* Upcoming dates */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '4px'
        }}>
          <div style={{
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '12px'
          }}>
            Remembrance Schedule
          </div>
          {[
            { label: 'Next Yahrzeit', date: 'Feb 4, 2027', type: 'Annual observance' },
            { label: 'Next Yizkor', date: 'Apr 24, 2026 (Pesach)', type: 'Communal remembrance' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <div style={{
                  fontFamily: '"EB Garamond", Georgia, serif',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.65)'
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.3)'
                }}>
                  {item.type}
                </div>
              </div>
              <div style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                {item.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ADD ENTRY FORM
// ============================================================

function AddEntryForm({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [timeOfDeath, setTimeOfDeath] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const relationships = ['Mother', 'Father', 'Grandmother', 'Grandfather', 'Wife', 'Husband', 'Sister', 'Brother', 'Son', 'Daughter', 'Aunt', 'Uncle', 'Friend', 'Other'];

  const handleSubmit = () => {
    if (name && dateOfDeath && timeOfDeath && relationship) {
      onAdd({
        id: Date.now(),
        name,
        dateOfDeath,
        timeOfDeath,
        relationship,
        hebrewDate: '—',
        addedBy: 'You'
      });
      setSubmitted(true);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    fontFamily: '"EB Garamond", Georgia, serif',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px',
    color: 'rgba(255,255,255,0.85)',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontFamily: '"Source Sans Pro", sans-serif',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '8px'
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #2a2218 0%, #1f1912 100%)',
          borderRadius: '4px',
          padding: '40px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(212, 168, 75, 0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🕯️</div>
            <h2 style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '28px',
              fontWeight: '600',
              color: '#d4a84b',
              marginBottom: '12px'
            }}>
              Zichronam Livracha
            </h2>
            <p style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '8px'
            }}>
              May their memory be a blessing.
            </p>
            <p style={{
              fontFamily: '"Source Sans Pro", sans-serif',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '32px'
            }}>
              {name} has been added to the Wall of Remembrance. We will send you reminders for shloshim, yizkor, and yahrzeit.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '14px 32px',
                background: '#d4a84b',
                color: '#1a1510',
                border: 'none',
                borderRadius: '4px',
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Return to the Wall
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                fontSize: '16px',
                color: 'rgba(212, 168, 75, 0.6)',
                marginBottom: '16px'
              }}>
                ✡
              </div>
              <h2 style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: '28px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '8px'
              }}>
                Remember a Loved One
              </h2>
              <p style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                fontSize: '15px',
                color: 'rgba(255,255,255,0.45)'
              }}>
                Add them to our Wall of Remembrance and receive reminders for shloshim, yizkor, and yahrzeit.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Name of Your Loved One *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Date of Passing *</label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={e => setDateOfDeath(e.target.value)}
                  style={{
                    ...inputStyle,
                    colorScheme: 'dark'
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Time of Passing *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['morning', 'afternoon'].map(time => (
                    <button
                      key={time}
                      onClick={() => setTimeOfDeath(time)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: timeOfDeath === time ? 'rgba(212, 168, 75, 0.15)' : 'rgba(255,255,255,0.06)',
                        border: timeOfDeath === time ? '1px solid rgba(212, 168, 75, 0.5)' : '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '4px',
                        color: timeOfDeath === time ? '#d4a84b' : 'rgba(255,255,255,0.6)',
                        fontFamily: '"EB Garamond", Georgia, serif',
                        fontSize: '16px',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {time === 'morning' ? '☀️' : '🌙'} {time}
                      <div style={{
                        fontSize: '11px',
                        fontFamily: '"Source Sans Pro", sans-serif',
                        color: 'rgba(255,255,255,0.35)',
                        marginTop: '4px'
                      }}>
                        {time === 'morning' ? 'Before sunset' : 'After sunset'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Your Relationship *</label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center'
                  }}
                >
                  <option value="" style={{ background: '#1f1912' }}>Select relationship</option>
                  {relationships.map(r => (
                    <option key={r} value={r} style={{ background: '#1f1912' }}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Your Email (for reminders)</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
                <div style={{
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.3)',
                  marginTop: '6px'
                }}>
                  We'll send reminders for shloshim, yizkor, and yahrzeit
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name || !dateOfDeath || !timeOfDeath || !relationship}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: (name && dateOfDeath && timeOfDeath && relationship) ? '#d4a84b' : 'rgba(255,255,255,0.1)',
                  color: (name && dateOfDeath && timeOfDeath && relationship) ? '#1a1510' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: '"Source Sans Pro", sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (name && dateOfDeath && timeOfDeath && relationship) ? 'pointer' : 'not-allowed',
                  marginTop: '8px'
                }}
              >
                Add to Wall of Remembrance
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TODAY'S YAHRZEITS BANNER
// ============================================================

function TodayBanner({ entries }) {
  const todayEntries = entries.filter(e => isYahrzeitToday(e.dateOfDeath));
  if (todayEntries.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(212, 168, 75, 0.12) 0%, rgba(212, 168, 75, 0.06) 100%)',
      borderBottom: '1px solid rgba(212, 168, 75, 0.2)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '16px', animation: 'flicker 2s ease-in-out infinite' }}>🕯️</span>
      <span style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: '15px',
        color: '#d4a84b',
        fontWeight: '600'
      }}>
        Today's Yahrzeits:
      </span>
      <span style={{
        fontFamily: '"EB Garamond", Georgia, serif',
        fontSize: '15px',
        color: 'rgba(212, 168, 75, 0.8)'
      }}>
        {todayEntries.map(e => e.name).join(' · ')}
      </span>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function WallOfRemembrance() {
  const [entries, setEntries] = useState(sampleEntries);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [zoom, setZoom] = useState(1);
  const [showLitOnly, setShowLitOnly] = useState(false);

  const sortedEntries = useMemo(() => {
    let filtered = showLitOnly ? entries.filter(e => isYahrzeitToday(e.dateOfDeath)) : entries;
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'year': return new Date(b.dateOfDeath) - new Date(a.dateOfDeath);
        case 'day': {
          const aDate = new Date(a.dateOfDeath);
          const bDate = new Date(b.dateOfDeath);
          const aDay = aDate.getMonth() * 31 + aDate.getDate();
          const bDay = bDate.getMonth() * 31 + bDate.getDate();
          return aDay - bDay;
        }
        default: return 0;
      }
    });
  }, [entries, sortBy, showLitOnly]);

  const handleAdd = useCallback((entry) => {
    setEntries(prev => [...prev, entry]);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1510 0%, #0f0d0a 100%)',
      color: 'white'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:wght@400;500;600&family=Source+Sans+Pro:wght@400;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0d0a; }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.85; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
          75% { opacity: 0.9; transform: scale(0.99); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(212, 168, 75, 0.3); }
          50% { box-shadow: 0 0 50px rgba(212, 168, 75, 0.5); }
        }
        
        select option { background: #1f1912; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '28px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.02em'
          }}>
            Wall of Remembrance
          </h1>
          <p style={{
            fontFamily: '"EB Garamond", Georgia, serif',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '4px'
          }}>
            {entries.length} names remembered · {entries.filter(e => isYahrzeitToday(e.dateOfDeath)).length} yahrzeit{entries.filter(e => isYahrzeitToday(e.dateOfDeath)).length !== 1 ? 's' : ''} today
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '12px 24px',
            background: '#d4a84b',
            color: '#1a1510',
            border: 'none',
            borderRadius: '4px',
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🕯️ Remember a Loved One
        </button>
      </header>

      {/* Today's Yahrzeits Banner */}
      <TodayBanner entries={entries} />

      {/* Controls Bar */}
      <div style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.35)'
          }}>
            Sort by:
          </span>
          {[
            { id: 'name', label: 'Last Name' },
            { id: 'year', label: 'Year' },
            { id: 'day', label: 'Calendar Day' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              style={{
                padding: '6px 14px',
                background: sortBy === s.id ? 'rgba(212, 168, 75, 0.15)' : 'rgba(255,255,255,0.04)',
                border: sortBy === s.id ? '1px solid rgba(212, 168, 75, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                color: sortBy === s.id ? '#d4a84b' : 'rgba(255,255,255,0.5)',
                fontFamily: '"Source Sans Pro", sans-serif',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {s.label}
            </button>
          ))}
          <span style={{ color: 'rgba(255,255,255,0.1)', margin: '0 4px' }}>|</span>
          <button
            onClick={() => setShowLitOnly(!showLitOnly)}
            style={{
              padding: '6px 14px',
              background: showLitOnly ? 'rgba(212, 168, 75, 0.15)' : 'rgba(255,255,255,0.04)',
              border: showLitOnly ? '1px solid rgba(212, 168, 75, 0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px',
              color: showLitOnly ? '#d4a84b' : 'rgba(255,255,255,0.5)',
              fontFamily: '"Source Sans Pro", sans-serif',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🕯️ Today Only
          </button>
        </div>

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.35)'
          }}>
            Zoom:
          </span>
          <button
            onClick={() => setZoom(Math.max(0.4, zoom - 0.2))}
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            −
          </button>
          <div style={{
            width: '100px',
            height: '4px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: `${((zoom - 0.4) / 1.2) * 100}%`,
              top: '-4px',
              width: '12px',
              height: '12px',
              background: '#d4a84b',
              borderRadius: '50%',
              transform: 'translateX(-50%)'
            }} />
          </div>
          <button
            onClick={() => setZoom(Math.min(1.6, zoom + 0.2))}
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* The Wall */}
      <div style={{
        padding: '32px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        {/* Subtle wall texture */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.04)'
        }}>
          {sortedEntries.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                animation: `fadeIn 0.4s ease ${Math.min(i * 0.03, 0.5)}s both`
              }}
            >
              <MemorialPlaque
                entry={entry}
                isLit={isYahrzeitToday(entry.dateOfDeath)}
                onClick={setSelectedEntry}
                zoom={zoom}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '32px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <p style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: '18px',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '8px'
        }}>
          "As long as we live, they too will live, for they are now a part of us, as we remember them."
        </p>
        <p style={{
          fontFamily: '"Source Sans Pro", sans-serif',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.2)'
        }}>
          Gates of Prayer
        </p>
      </footer>

      {/* Modals */}
      {selectedEntry && (
        <DetailModal
          entry={selectedEntry}
          isLit={isYahrzeitToday(selectedEntry.dateOfDeath)}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {showAddForm && (
        <AddEntryForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
