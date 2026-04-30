import React from 'react';
import './LegalPage.css';

const LegalPage = ({ title, content }) => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <h1>{title}</h1>
        <p>Last Updated: April 30, 2026</p>
      </div>
      <div className="legal-container">
        <div className="legal-content">
          {content}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
