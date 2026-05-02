import React from 'react';
import './Blogs.css';
import SEO from '../../components/SEO/SEO';

const BLOG_POSTS = [
  {
    id: 1,
    title: "The Ultimate Guide to Salicylic Acid for Indian Skin",
    excerpt: "Discover why Salicylic acid is a game-changer for oily and acne-prone skin in the Indian climate.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800",
    date: "May 15, 2024",
    author: "Dr. Ananya Sharma"
  },
  {
    id: 2,
    title: "Morning Skincare Ritual for a Luminous Glow",
    excerpt: "Learn the step-by-step ritual to achieve that radiant, glass-skin look every morning.",
    image: "https://images.unsplash.com/photo-1598440499033-547b19fc162e?q=80&w=800",
    date: "May 10, 2024",
    author: "Shoraluxe Beauty Team"
  },
  {
    id: 3,
    title: "Understanding SPF: Why You Need it Even Indoors",
    excerpt: "Sunscreen is not just for the beach. Here is why SPF 50 is your best friend in the Indian sun.",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=800",
    date: "May 05, 2024",
    author: "Rohan Mehra"
  }
];

const Blogs = () => {
  return (
    <div className="blogs-page">
      <SEO 
        title="Shoraluxe Journals | Skincare Tips & Beauty Science" 
        description="Explore the Shoraluxe blog for expert skincare advice, product guides, and beauty rituals tailored for Indian skin."
      />
      
      <header className="blogs-hero">
        <div className="blogs-hero-content">
          <span className="blogs-subtitle">THE SHORALUXE JOURNALS</span>
          <h1>Expert Advice for Radiant Skin</h1>
          <p>Discover the science behind beauty and the rituals that transform your skin.</p>
        </div>
      </header>

      <div className="blogs-container">
        <div className="blogs-grid">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-img">
                <img src={post.image} alt={post.title} />
                <div className="blog-date">{post.date}</div>
              </div>
              <div className="blog-card-content">
                <span className="blog-author">By {post.author}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button className="read-more-btn">Read Full Article</button>
              </div>
            </article>
          ))}
        </div>

        <section className="blogs-newsletter">
          <h2>Never Miss a Beauty Update</h2>
          <p>Join our community for exclusive skincare tips and early access to new launches.</p>
          <div className="blogs-newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button>Subscribe</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blogs;
