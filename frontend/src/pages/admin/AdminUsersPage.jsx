import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { getAdminUsers, updateUserRole } from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers();
      setUsers(res.users || []);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to load users: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole.toUpperCase()}?`)) return;

    try {
      await updateUserRole(user._id, newRole);
      setAlertMsg({ type: 'success', text: `Updated ${user.name}'s role to ${newRole}.` });
      loadUsers();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to update user role: ' + err.message });
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>
      </div>

      {/* Banner Alert */}
      {alertMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm, 6px)',
            marginBottom: '14px',
            backgroundColor: alertMsg.type === 'success' ? '#DCFCE7' : '#FEF2F2',
            color: alertMsg.type === 'success' ? '#15803D' : '#991B1B',
            border: `1px solid ${alertMsg.type === 'success' ? '#86EFAC' : '#FECACA'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{alertMsg.text}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#F0FDF4', color: '#16A34A', padding: '2px 8px', borderRadius: '4px' }}>
            User Directory
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {users.length} Registered Accounts
          </span>
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '2px 0 0 0', color: '#0F172A' }}>
          Registered Students & Administrators
        </h1>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
            Loading users...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email / Identifier</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Class / Board</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.88rem' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {u.email || u.phone || '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: isAdmin ? '#FEF2F2' : '#EFF6FF',
                          color: isAdmin ? '#DC2626' : '#2563EB',
                          textTransform: 'uppercase'
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>
                      Class {u.classLevel || 10} • {u.board || 'CBSE'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleRole(u)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: isAdmin ? '#2563EB' : '#DC2626',
                          cursor: 'pointer'
                        }}
                      >
                        {isAdmin ? 'Make Student' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
