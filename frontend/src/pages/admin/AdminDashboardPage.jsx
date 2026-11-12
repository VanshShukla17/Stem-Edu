import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Eye,
  Settings,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getAdminStats } from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getAdminStats()
      .then((data) => {
        if (isMounted && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch admin stats');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const statItems = [
    { label: 'Total Students', value: stats?.users ?? '-', icon: Users, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'STEM Subjects', value: stats?.subjects ?? '-', icon: BookOpen, color: '#059669', bg: '#ECFDF5' },
    { label: 'Chapters', value: stats?.chapters ?? '-', icon: Layers, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Lessons', value: stats?.lessons ?? '-', icon: FileText, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Practice MCQs', value: stats?.questions ?? '-', icon: HelpCircle, color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Interactive Diagrams', value: stats?.diagrams ?? '-', icon: Sparkles, color: '#0284C7', bg: '#F0F9FF' },
    { label: '3D Virtual Labs', value: stats?.labs ?? '-', icon: Settings, color: '#4F46E5', bg: '#EEF2FF' }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* Admin Header */}
      <div
        className="card"
        style={{
          marginBottom: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#F8FAFC'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#DC2626', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', marginBottom: '6px' }}>
              <ShieldAlert size={14} /> Admin Control Center
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '2px 0 6px 0' }}>
              STEM Curriculum Administration
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0 }}>
              Manage CBSE Class 10 bilingual subjects, chapters, lesson blocks, and practice question banks.
            </p>
          </div>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#F8FAFC',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            <Eye size={16} /> Student View
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 12px 0', color: '#1E293B' }}>
        Curriculum & System Overview
      </h2>

      {loading ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
          Loading admin metrics...
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '16px', color: '#DC2626', backgroundColor: '#FEF2F2' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                    {item.label}
                  </span>
                  <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: item.bg, color: item.color }}>
                    <Icon size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A' }}>
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Management Shortcuts */}
      <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 12px 0', color: '#1E293B' }}>
        Management Modules
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {/* Content Manager */}
        <Link
          to="/admin/content"
          style={{ textDecoration: 'none' }}
        >
          <div className="card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                  <Layers size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#0F172A' }}>
                  Content Manager
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Create, update, and safely delete Subjects, Chapters, and Lessons with content blocks.
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontSize: '0.85rem', fontWeight: '600', marginTop: '12px' }}>
              Manage Content <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Question Bank */}
        <Link
          to="/admin/questions"
          style={{ textDecoration: 'none' }}
        >
          <div className="card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <HelpCircle size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#0F172A' }}>
                  MCQ Question Bank
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Author board-style MCQs with 4 bilingual options, answer key, and step-by-step explanations.
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '0.85rem', fontWeight: '600', marginTop: '12px' }}>
              Manage Questions <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* User Management */}
        <Link
          to="/admin/users"
          style={{ textDecoration: 'none' }}
        >
          <div className="card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#0F172A' }}>
                  User Management
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                View registered students, review accounts, and configure administrative roles.
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '0.85rem', fontWeight: '600', marginTop: '12px' }}>
              Manage Users <ArrowRight size={14} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

