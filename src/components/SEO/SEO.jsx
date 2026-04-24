import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, type = 'website', url = 'https://shoraluxe.com', image = 'https://shoraluxe.com/favicon.png', jsonLd = null }) => {
  const defaultTitle = "Shoraluxe | Premium Skincare & Luxury Beauty | Pan India Delivery";
  const defaultDescription = "Shop Shoraluxe for premium skincare and luxury beauty. Discover anti-aging serums, glowing face washes, and sunscreens. Enjoy fast Pan India Delivery all over India.";
  const defaultKeywords = "Shoraluxe, luxury skincare, premium beauty products, buy skincare online India, Pan India delivery, all over India shipping, face wash, vitamin C serum, anti-aging cream, sunscreen SPF 50, glowing skin, best skincare brand India";

  const seoTitle = title ? `${title} | Shoraluxe` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Standard SEO Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={image} />

      {/* Dynamic JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
