import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Mail, Download, Trash2, RefreshCw, Users } from 'lucide-react';
import './AdminNewsletter.css';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (!error && data) setSubscribers(data);
    setLoading(false);
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Remove ${email} from subscribers?`)) return;
    setDeleting(id);
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubscribers(prev => prev.filter(s => s.id !== id));
    setDeleting(null);
  };

  const handleExportCSV = () => {
    const headers = ['Email', 'Subscribed At', 'Source', 'Active'];
    const rows = filtered.map(s => [
      s.email,
      new Date(s.subscribed_at).toLocaleString('en-IN'),
      s.source,
      s.is_active ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shoraluxe-newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="anl-page">
      {/* Header */}
      <div className="anl-header">
        <div className="anl-title-row">
          <div className="anl-icon-box"><Mail size={22} /></div>
          <div>
            <h1 className="anl-title">Newsletter Subscribers</h1>
            <p className="anl-subtitle">Manage all email signups from your storefront</p>
          </div>
        </div>
        <div className="anl-actions">
          <button className="anl-btn-refresh" onClick={fetchSubscribers}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="anl-btn-export" onClick={handleExportCSV} disabled={filtered.length === 0}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="anl-stats">
        <div className="anl-stat-card">
          <Users size={20} className="anl-stat-icon" />
          <div>
            <span className="anl-stat-num">{subscribers.length}</span>
            <span className="anl-stat-label">Total Subscribers</span>
          </div>
        </div>
        <div className="anl-stat-card">
          <Mail size={20} className="anl-stat-icon" />
          <div>
            <span className="anl-stat-num">
              {subscribers.filter(s => {
                const d = new Date(s.subscribed_at);
                const now = new Date();
                return (now - d) < 7 * 24 * 60 * 60 * 1000;
              }).length}
            </span>
            <span className="anl-stat-label">This Week</span>
          </div>
        </div>
        <div className="anl-stat-card">
          <span className="anl-stat-num anl-active-pct">
            {subscribers.length > 0
              ? Math.round((subscribers.filter(s => s.is_active).length / subscribers.length) * 100)
              : 0}%
          </span>
          <span className="anl-stat-label">Active Rate</span>
        </div>
      </div>

      {/* Search */}
      <div className="anl-search-row">
        <div className="anl-search-wrap">
          <Mail size={15} className="anl-search-icon" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="anl-search"
          />
        </div>
        <span className="anl-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="anl-table-wrap">
        {loading ? (
          <div className="anl-loading">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="anl-empty">
            <Mail size={40} opacity={0.2} />
            <p>{search ? 'No subscribers match your search.' : 'No subscribers yet. Share your store to get signups!'}</p>
          </div>
        ) : (
          <table className="anl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Source</th>
                <th>Subscribed On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, i) => (
                <tr key={sub.id}>
                  <td className="anl-num">{i + 1}</td>
                  <td className="anl-email">{sub.email}</td>
                  <td><span className="anl-source-tag">{sub.source}</span></td>
                  <td className="anl-date">
                    {new Date(sub.subscribed_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <span className={`anl-badge ${sub.is_active ? 'active' : 'inactive'}`}>
                      {sub.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="anl-del-btn"
                      onClick={() => handleDelete(sub.id, sub.email)}
                      disabled={deleting === sub.id}
                      title="Remove subscriber"
                    >
                      {deleting === sub.id ? '...' : <Trash2 size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;
