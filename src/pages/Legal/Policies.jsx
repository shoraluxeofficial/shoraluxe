import React from 'react';
import LegalPage from './LegalPage';

const Policies = () => {
  const content = (
    <>
      <h2>Shipping Policy</h2>
      <p>At Shoraluxe, we strive to deliver your luxury skincare products as quickly as possible. All orders are processed within 1-2 business days.</p>
      <ul>
        <li>Free standard shipping on all orders above ₹999.</li>
        <li>Estimated delivery time: 3-5 business days for metro cities, 5-7 days for other regions.</li>
        <li>Express shipping options available at checkout.</li>
      </ul>
      <h2>Privacy Policy</h2>
      <p>Your privacy is of utmost importance to us. We collect minimal information required to process your orders and provide a personalized experience.</p>
    </>
  );

  return <LegalPage title="Our Policies" content={content} />;
};

export default Policies;
