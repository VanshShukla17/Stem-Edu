import React, { useState, useEffect } from 'react';
import { Info, X, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InteractiveDiagram({ diagramData, diagramId, subjectCode }) {
  const { user } = useAuth();
  const [diagram, setDiagram] = useState(diagramData || null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [loading, setLoading] = useState(!diagramData && !!(diagramId || subjectCode));
  const [error, setError] = useState('');

  const isHindi = user?.language === 'hi';

  useEffect(() => {
    if (diagramData) {
      setDiagram(diagramData);
      return;
    }

    const idToFetch = diagramId || subjectCode;
    if (!idToFetch) return;

    async function fetchDiagram() {
      try {
        setLoading(true);
        setError('');
        const data = await api.getDiagramById(idToFetch);
        setDiagram(data);
      } catch (err) {
        console.error('Failed to load diagram:', err);
        setError('Interactive diagram could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    fetchDiagram();
  }, [diagramData, diagramId, subjectCode]);

  const handleElementTap = (element) => {
    if (selectedElement && selectedElement.id === element.id) {
      setSelectedElement(null); // Toggle off if already selected
    } else {
      setSelectedElement(element);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '30px', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (error || !diagram) {
    return null;
  }

  const title = isHindi && diagram.titleHindi ? diagram.titleHindi : diagram.title;

  return (
    <div
      className="card"
      style={{
        margin: '16px 0',
        padding: '16px',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        overflow: 'hidden'
      }}
    >
      {/* Diagram Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '6px', borderRadius: '8px' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{title}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              {isHindi ? 'किसी भी भाग पर टैप करके सीखें' : 'Tap any labelled part to explore'}
            </span>
          </div>
        </div>

        {selectedElement && (
          <button
            onClick={() => setSelectedElement(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* SVG Canvas (Tasks 8.1, 8.3) */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          touchAction: 'manipulation'
        }}
      >
        <svg
          viewBox={diagram.svgViewBox || '0 0 600 400'}
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '340px' }}
        >
          {/* Wire path outlines for circuit if physics */}
          {diagram.subjectCode === 'physics' && (
            <path
              d="M 100 190 L 100 60 L 500 60 L 500 190 M 500 190 L 500 330 L 100 330 L 100 190"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeDasharray="8 4"
            />
          )}

          {/* Render interactive SVG shapes */}
          {diagram.elements && diagram.elements.map((elem) => {
            const isSelected = selectedElement && selectedElement.id === elem.id;
            const attrs = elem.attributes || {};

            const shapeProps = {
              key: elem.id,
              onClick: () => handleElementTap(elem),
              onTouchStart: () => handleElementTap(elem),
              style: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: isSelected ? 'drop-shadow(0 0 8px rgba(37,99,235,0.6))' : 'none'
              }
            };

            const strokeColor = isSelected ? '#2563EB' : (attrs.stroke || '#475569');
            const strokeWidth = isSelected ? (Number(attrs.strokeWidth || 3) + 3) : (attrs.strokeWidth || 3);
            const fillColor = isSelected ? '#DBEAFE' : (attrs.fill || '#EFF6FF');

            if (elem.shape === 'rect') {
              return (
                <g key={elem.id} {...shapeProps}>
                  <rect
                    x={attrs.x || 0}
                    y={attrs.y || 0}
                    width={attrs.width || 80}
                    height={attrs.height || 40}
                    rx={attrs.rx || 6}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={Number(attrs.x || 0) + Number(attrs.width || 80) / 2}
                    y={Number(attrs.y || 0) + Number(attrs.height || 40) / 2 + 5}
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="12"
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {isHindi && elem.labelHindi ? elem.labelHindi : elem.label}
                  </text>
                </g>
              );
            }

            if (elem.shape === 'circle') {
              return (
                <g key={elem.id} {...shapeProps}>
                  <circle
                    cx={attrs.cx || 50}
                    cy={attrs.cy || 50}
                    r={attrs.r || 30}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={attrs.cx || 50}
                    y={Number(attrs.cy || 50) + 4}
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="11"
                    fontWeight="700"
                    pointerEvents="none"
                  >
                    {isHindi && elem.labelHindi ? elem.labelHindi : elem.label}
                  </text>
                </g>
              );
            }

            // Fallback for paths
            return (
              <path
                key={elem.id}
                d={elem.pathData || 'M 0 0 L 10 10'}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                {...shapeProps}
              />
            );
          })}
        </svg>
      </div>

      {/* Explanation Drawer Panel (Task 8.3: Done when tapping a part shows its explanation) */}
      {selectedElement ? (
        <div
          style={{
            marginTop: '14px',
            padding: '14px 16px',
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--color-primary)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              {isHindi && selectedElement.labelHindi ? selectedElement.labelHindi : selectedElement.label}
            </h4>
            <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--color-surface)', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' }}>
              Selected Part
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--color-text)', margin: 0 }}>
            {isHindi && selectedElement.explanationHindi ? selectedElement.explanationHindi : selectedElement.explanation}
          </p>
        </div>
      ) : (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Info size={16} />
          <span>{isHindi ? 'जानकारी देखने के लिए ऊपर दिए गए किसी भी घटक पर क्लिक करें।' : 'Tap any component in the diagram above to read its function.'}</span>
        </div>
      )}
    </div>
  );
}
