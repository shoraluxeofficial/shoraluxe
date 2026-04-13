import React from 'react';
import { ShieldCheck, Heart, Leaf, FlaskConical, Globe } from 'lucide-react';
import './BrandPromise.css';

const promiseData = [
  {
    icon: <ShieldCheck size={32} />,
    title: 'Dermatologist Tested',
    desc: 'Formulated and tested by skin experts for total safety.'
  },
  {
    icon: <Heart size={32} />,
    title: 'Cruelty Free',
    desc: 'Proudly 100% cruelty-free. We never test on animals.'
  },
  {
    icon: <Leaf size={32} />,
    title: 'Vegan Formula',
    desc: 'Powered by 100% plant-based, high-performance ingredients.'
  },
  {
    icon: <FlaskConical size={32} />,
    title: 'Clean Beauty',
    desc: 'Zero parabens, sulfates, or artificial fragrances.'
  },
  {
    icon: <Globe size={32} />,
    title: 'Ethical Sourcing',
    desc: 'Ingredients sourced sustainably from around the globe.'
  }
];

const BrandPromise = () => {
  return (
    <section className="promise-section">
      <div className="promise-container">
        {promiseData.map((item, index) => (
          <div key={index} className="promise-card">
            <div className="promise-icon-wrap">
              {item.icon}
            </div>
            <h3 className="promise-title">{item.title}</h3>
            <p className="promise-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandPromise;
