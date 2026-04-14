import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Activity, Terminal, Trash2 } from 'lucide-react';
import { useNotify } from '../../../components/common/Notification/Notification';
import './AdminSecurity.css';

const AdminSecurity = () => {
  const [logs, setLogs] = useState([]);
  const [isFirewallActive, setIsFirewallActive] = useState(true);
  const { notify } = useNotify();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const storedLogs = JSON.parse(localStorage.getItem('shoraluxe_security_logs') || '[]');
    setLogs(storedLogs.reverse());
  };

  const clearLogs = () => {
    notify('This will permanently clear all security audit logs. Continue?', 'confirm', {
      onConfirm: () => {
        localStorage.setItem('shoraluxe_security_logs', '[]');
        setLogs([]);
        notify('Security logs cleared.', 'success');
      }
    });
  };

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Firewall & Security Monitor</h1>
          <p className="admin-page-subtitle">Real-time threat detection and security audit logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="admin-btn-secondary" onClick={clearLogs}>
             <Trash2 size={16}/> Clear Logs
          </button>
          <div className={`security-status-pill ${isFirewallActive ? 'active' : ''}`}>
             {isFirewallActive ? <ShieldCheck size={16}/> : <ShieldAlert size={16}/>}
             {isFirewallActive ? 'vWAF ACTIVE' : 'vWAF DISABLED'}
          </div>
        </div>
      </div>

      <div className="security-grid">
        {/* STATS */}
        <div className="admin-card stats-card">
          <Activity size={24} color="#6d0e2c" />
          <div className="stat-val">{logs.length}</div>
          <div className="stat-label">Detected Events</div>
        </div>

        <div className="admin-card stats-card">
          <ShieldAlert size={24} color="#dc2626" />
          <div className="stat-val">{logs.filter(l => l.type === 'INJECTION_THREAT').length}</div>
          <div className="stat-label">Blocked Injections</div>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={20}/> Security Audit Trail
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Details</th>
                <th>Origin (User Agent)</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>No security threats detected. System secure.</td></tr>
              ) : logs.map((log, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`security-tag ${log.type.toLowerCase()}`}>
                      {log.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <code style={{ background: '#f1f1f1', padding: '2px 4px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {JSON.stringify(log.details)}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.userAgent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
