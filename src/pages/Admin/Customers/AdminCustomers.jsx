import React, { useState } from 'react';
import { Search } from 'lucide-react';

const customers = [
  { id: 1, name: 'Priya Sharma', email: 'priya@email.com', orders: 4, spent: 3200, joined: 'Jan 2026' },
  { id: 2, name: 'Meena Reddy', email: 'meena@email.com', orders: 2, spent: 1400, joined: 'Feb 2026' },
  { id: 3, name: 'Anjali Kapoor', email: 'anjali@email.com', orders: 7, spent: 6100, joined: 'Dec 2025' },
  { id: 4, name: 'Rohit Verma', email: 'rohit@email.com', orders: 1, spent: 490, joined: 'Mar 2026' },
  { id: 5, name: 'Sneha Patel', email: 'sneha@email.com', orders: 3, spent: 2500, joined: 'Feb 2026' },
];

const AdminCustomers = () => {
  const [query, setQuery] = useState('');
  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || c.email.includes(query)
  );

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Customers</h1>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{customers.length} total customers</span>
      </div>

      <div className="admin-card">
        <div className="admin-table-controls">
          <div className="admin-search-box">
            <Search size={18} color="#9ca3af" />
            <input type="text" placeholder="Search by name or email..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Member Since</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td style={{ color: '#6b7280' }}>{c.email}</td>
                <td><span style={{ fontWeight: 700 }}>{c.orders}</span></td>
                <td style={{ fontWeight: 700, color: '#111' }}>₹{c.spent.toLocaleString('en-IN')}</td>
                <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
