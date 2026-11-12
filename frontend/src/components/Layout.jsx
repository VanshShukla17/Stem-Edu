import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, BookOpen, CheckCircle2, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="top-header">
        <Link to="/dashboard" className="brand-logo">
          <Sparkles size={22} />
          <span>STEM Edu</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '4px 8px',
                borderRadius: '999px',
                fontWeight: '600'
              }}
            >
              Class {user.classLevel || 10} • {user.board || 'CBSE'}
            </span>
          )}
          <span
            style={{
              fontSize: '0.75rem',
              border: '1px solid var(--color-border)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '500',
              textTransform: 'uppercase'
            }}
          >
            {user?.language === 'hi' ? 'हिंदी' : 'EN'}
          </span>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile-First Bottom Navigation Bar (Task 4.6) */}
      <nav className="bottom-nav" aria-label="Main Navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/subjects"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Learn</span>
        </NavLink>

        <NavLink
          to="/results"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <CheckCircle2 size={20} />
          <span>Practice</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
