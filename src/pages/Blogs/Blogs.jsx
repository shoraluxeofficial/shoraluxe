import React from 'react';
import './Blogs.css';
import SEO from '../../components/SEO/SEO';

const BLOG_POSTS = [
  {
    id: 1,
    category: "Serum",
    title: "Why Our Niacinamide Serum is a Must for Indian Skin",
    excerpt: "Indian skin often deals with high humidity and pollution, leading to enlarged pores and uneven texture. Our 10% Niacinamide serum is specifically formulated to refine pores and strengthen the skin barrier without feeling heavy.",
    image: "https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777232225/shoraluxe/products/0_fvberx.jpg", // Placeholder - will adjust to actual serum if found
    author: "Dr. Ananya Sharma",
    tips: ["Apply on damp skin for better absorption", "Follow with a lightweight moisturizer", "Use twice daily for best results"]
  },
  {
    id: 2,
    category: "Sunscreen",
    title: "The Science of SPF 50+++ in the Tropical Sun",
    excerpt: "Protecting your skin from UV rays is the most important step in any anti-aging routine. Our sunscreen offers broad-spectrum protection with a ultra-light, non-greasy finish that's perfect for the Indian climate.",
    image: "https://res.cloudinary.com/dfr0tlcdb/image/upload/w_800,q_90,f_auto/v1777485162/i79vwhurlkuvlrshykra.webp",
    author: "Rohan Mehra",
    tips: ["Apply two-finger lengths for full coverage", "Reapply every 3 hours outdoors", "Don't forget your ears and neck"]
  },
  {
    id: 3,
    category: "Moisturizer",
    title: "Hydration vs. Moisture: The Non-Sticky Secret",
    excerpt: "Many people skip moisturizer because they fear the stickiness in humid weather. Our Non-Sticky Moisturizer uses Hyaluronic Acid to hydrate deeply while leaving a velvet-matte finish that lasts all day.",
    image: "https://res.cloudinary.com/dfr0tlcdb/image/upload/w_500,q_90,f_auto/v1777485081/xtlfci5xezy4yjuf172l.webp",
    author: "Shoraluxe Team",
    tips: ["Focus on dry patches around the nose and mouth", "Use a pea-sized amount for the entire face", "Lock in your serum with this moisturizer"]
  },
  {
    id: 4,
    category: "Face Wash",
    title: "Deep Cleansing Without Stripping Your Glow",
    excerpt: "A good face wash should remove pollution and oil without damaging your natural moisture barrier. Our Charcoal Face Wash detoxifies while Ubtan extracts soothe and brighten your complexion instantly.",
    image: "https://res.cloudinary.com/dfr0tlcdb/image/upload/w_500,q_90,f_auto/v1777232225/shoraluxe/products/0_fvberx.jpg",
    author: "Beauty Expert",
    tips: ["Massage for at least 60 seconds", "Use lukewarm water, never hot", "Double cleanse in the evening if wearing makeup"]
  }
];

const Blogs = () => {
  return (
    <div className="blogs-page">
      <SEO 
        title="Shoraluxe Journals | Expert Skincare Science" 
        description="Learn about the best skincare rituals for Indian skin with our expert-led blog posts on serums, sunscreens, and more."
      />
      
      <header className="blogs-hero">
        <div className="blogs-hero-content">
          <span className="blogs-subtitle">THE SHORALUXE JOURNALS</span>
          <h1>Expert Skincare Rituals</h1>
          <p>Discover the perfect routine tailored for your skin's unique needs in the Indian climate.</p>
        </div>
      </header>

      <div className="blogs-container">
        <div className="blogs-zigzag-list">
          {BLOG_POSTS.map((post, index) => (
            <div key={post.id} className={`blog-zigzag-item ${index % 2 !== 0 ? 'reverse' : ''}`}>
              <div className="blog-zigzag-img">
                <img src={post.image} alt={post.title} />
                <div className="blog-category-tag">{post.category}</div>
              </div>
              <div className="blog-zigzag-content">
                <span className="blog-author">Expert Guide by {post.author}</span>
                <h2>{post.title}</h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                
                <div className="blog-tips">
                  <h4>Expert Tips:</h4>
                  <ul>
                    {post.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
                
                <button className="read-more-btn">Explore {post.category}</button>
              </div>
            </div>
          ))}
        </div>

        <section className="blogs-newsletter">
          <h2>Elevate Your Daily Ritual</h2>
          <p>Join 10,000+ others receiving our weekly skincare science and exclusive offers.</p>
          <div className="blogs-newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button>Join the Ritual</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blogs;
