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

      <h2>Return & Refund Policy</h2>
      <p>Due to the nature of our products, we only accept returns for items that are damaged or defective upon arrival.</p>
      <ul>
        <li>Please notify us within 48 hours of delivery if you receive a damaged product.</li>
        <li>Items must be unused and in their original packaging.</li>
        <li>Refunds will be processed to the original payment method within 7-10 business days.</li>
      </ul>

      <h2>Privacy Policy</h2>
      <p>Your privacy is of utmost importance to us. We collect minimal information required to process your orders and provide a personalized experience.</p>
    </>
  );

  return <LegalPage title="Our Policies" content={content} />;
};

export default Policies;
