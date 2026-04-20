import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(query.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(query.toLowerCase())) ||
    (u.mobile && u.mobile.includes(query))
  );

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{users.length} registered users</span>
      </div>

      <div className="admin-card">
        <div className="admin-table-controls">
          <div className="admin-search-box">
            <Search size={18} color="#9ca3af" />
            <input type="text" placeholder="Search by name, email or mobile..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
            <Loader2 size={24} style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem' }}>Loading users...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isDummyMobile = u.mobile && u.mobile.startsWith('+9199') && u.mobile.length === 13;
                return (
                <tr key={u.id}>
                  <td><strong>{u.name || 'Anonymous User'}</strong></td>
                  <td style={{ color: '#000' }}>{u.email || '-'}</td>
                  <td style={{ color: '#6b7280' }}>
                    <span style={{ 
                      background: isDummyMobile ? '#e0e7ff' : '#f3f4f6', 
                      color: isDummyMobile ? '#4f46e5' : 'inherit',
                      padding: '0.2rem 0.5rem', 
                      borderRadius: 4, 
                      fontSize: '0.8rem',
                      fontWeight: isDummyMobile ? 600 : 400
                    }}>
                      {isDummyMobile ? 'Google OAuth' : (u.mobile || '-')}
                    </span>
                  </td>
                  <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                  </td>
                </tr>
              )})}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
