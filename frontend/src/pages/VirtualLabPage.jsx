import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

export default function VirtualLabPage() {
  const { labId } = useParams();

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', marginBottom: '12px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="card">
        <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: '600' }}>
          3D VIRTUAL SIMULATION • {labId?.toUpperCase()}
        </span>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '4px 0 12px 0' }}>
          Simple Pendulum Experiment (सरल लोलक प्रयोग)
        </h1>

        {/* 3D Simulation Viewport Placeholder */}
        <div
          style={{
            height: '240px',
            backgroundColor: '#0F172A',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#94A3B8',
            marginBottom: '16px'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⏱️</div>
          <p style={{ fontSize: '0.9rem' }}>Three.js 3D Physics Canvas</p>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>T = 2π√(L/g)</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" style={{ padding: '10px' }}>
            <Play size={16} /> Start Oscillation
          </button>
          <button className="btn btn-secondary" style={{ padding: '10px' }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
