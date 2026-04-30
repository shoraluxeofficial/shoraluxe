import React from 'react';
import LegalPage from './LegalPage';

const TermsService = () => {
  const content = (
    <>
      <h2>Service Description</h2>
      <p>Shoraluxe provides a luxury skincare e-commerce platform. We reserve the right to modify or discontinue the service at any time without notice.</p>
      
      <h2>User Responsibilities</h2>
      <p>You are responsible for maintaining the confidentiality of your account and PIN. You agree to accept responsibility for all activities that occur under your account.</p>

      <h2>Payment Terms</h2>
      <p>We accept various payment methods including Credit/Debit cards, UPI, and Net Banking. All transactions are secure and encrypted.</p>

      <h2>Termination</h2>
      <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever.</p>
    </>
  );

  return <LegalPage title="Terms of Service" content={content} />;
};

export default TermsService;
