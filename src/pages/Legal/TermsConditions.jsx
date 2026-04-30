import React from 'react';
import LegalPage from './LegalPage';

const TermsConditions = () => {
  const content = (
    <>
      <h2>Agreement to Terms</h2>
      <p>By accessing or using the Shoraluxe website, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
      
      <h2>Use of the Site</h2>
      <p>This site is intended for personal, non-commercial use only. You must be at least 18 years old or under adult supervision to use our services.</p>

      <h2>Product Information</h2>
      <p>We attempt to be as accurate as possible with our product descriptions. However, we do not warrant that product descriptions or other content are error-free.</p>

      <h2>Intellectual Property</h2>
      <p>All content included on this site, such as text, graphics, logos, and images, is the property of Shoraluxe Private Limited and is protected by international copyright laws.</p>
    </>
  );

  return <LegalPage title="Terms & Conditions" content={content} />;
};

export default TermsConditions;
