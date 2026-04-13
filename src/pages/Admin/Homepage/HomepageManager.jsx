import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Layout, MoveUp, MoveDown, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './HomepageManager.css';

const HomepageManager = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hero');
    const [sections, setSections] = useState({
        hero: [],
        cta: { heading: '', text: '', tag: '', buttonText: '', bgImage: '' },
        quiz: { heading: '', text: '', buttonText: '' },
        brandPromise: [],
        testimonials: []
    });

    useEffect(() => {
        fetchHomepageData();
    }, []);

    const fetchHomepageData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('homepage_sections')
                .select('*');

            if (error) throw error;

            if (data) {
                const formattedData = { ...sections };
                data.forEach(item => {
                    formattedData[item.section_name] = item.content;
                });
                setSections(formattedData);
            }
        } catch (error) {
            console.error('Error fetching homepage data:', error);
            // If table doesn't exist, we might want to handle it or just use defaults
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (sectionName) => {
        try {
            const { error } = await supabase
                .from('homepage_sections')
                .upsert({ 
                    section_name: sectionName, 
                    content: sections[sectionName],
                    updated_at: new Date()
                }, { onConflict: 'section_name' });

            if (error) throw error;
            alert(`${sectionName.toUpperCase()} section updated successfully!`);
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Failed to save. Make sure "homepage_sections" table exists in Supabase.');
        }
    };

    // Helper to update state
    const updateSection = (name, value) => {
        setSections(prev => ({
            ...prev,
            [activeTab]: name === null ? value : { ...prev[activeTab], [name]: value }
        }));
    };

    if (loading) return <div className="admin-loader">Loading CMS...</div>;

    return (
        <div className="admin-page-wrap">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Homepage CMS</h1>
                    <p className="admin-page-subtitle">Manage every section of your storefront homepage</p>
                </div>
                <button className="admin-btn-primary" onClick={() => handleSave(activeTab)}>
                    <Save size={18} /> Save {activeTab.toUpperCase()} Section
                </button>
            </div>

            <div className="cms-container">
                <div className="cms-tabs">
                    {['hero', 'cta', 'quiz', 'brandPromise', 'testimonials'].map(tab => (
                        <button 
                            key={tab} 
                            className={`cms-tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="cms-content-card">
                    {activeTab === 'hero' && (
                        <div className="cms-section-editor">
                            <h3>Hero Banner Slides</h3>
                            <div className="hero-items-list">
                                {sections.hero.map((banner, index) => (
                                    <div key={index} className="admin-card cms-item-card">
                                        <div className="cms-item-index">{index + 1}</div>
                                        <div className="cms-fields">
                                            <input 
                                                type="text" 
                                                placeholder="Image URL" 
                                                value={banner.img} 
                                                onChange={(e) => {
                                                    const newHero = [...sections.hero];
                                                    newHero[index].img = e.target.value;
                                                    setSections(prev => ({ ...prev, hero: newHero }));
                                                }}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Link URL" 
                                                value={banner.url} 
                                                onChange={(e) => {
                                                    const newHero = [...sections.hero];
                                                    newHero[index].url = e.target.value;
                                                    setSections(prev => ({ ...prev, hero: newHero }));
                                                }}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Alt Text" 
                                                value={banner.alt} 
                                                onChange={(e) => {
                                                    const newHero = [...sections.hero];
                                                    newHero[index].alt = e.target.value;
                                                    setSections(prev => ({ ...prev, hero: newHero }));
                                                }}
                                            />
                                        </div>
                                        <button className="delete-btn" onClick={() => {
                                            setSections(prev => ({ ...prev, hero: prev.hero.filter((_, i) => i !== index) }));
                                        }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="admin-btn-secondary" onClick={() => {
                                setSections(prev => ({ ...prev, hero: [...prev.hero, { img: '', url: '', alt: '' }] }));
                            }}>
                                <Plus size={16} /> Add New Slide
                            </button>
                        </div>
                    )}

                    {activeTab === 'cta' && (
                        <div className="cms-section-editor">
                            <h3>Call to Action Section</h3>
                            <div className="cms-form-grid">
                                <div className="cms-field-group">
                                    <label>Tagline</label>
                                    <input type="text" value={sections.cta.tag} onChange={(e) => updateSection('tag', e.target.value)} />
                                </div>
                                <div className="cms-field-group">
                                    <label>Main Heading</label>
                                    <input type="text" value={sections.cta.heading} onChange={(e) => updateSection('heading', e.target.value)} />
                                </div>
                                <div className="cms-field-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Description Text</label>
                                    <textarea value={sections.cta.text} onChange={(e) => updateSection('text', e.target.value)} />
                                </div>
                                <div className="cms-field-group">
                                    <label>Button Text</label>
                                    <input type="text" value={sections.cta.buttonText} onChange={(e) => updateSection('buttonText', e.target.value)} />
                                </div>
                                <div className="cms-field-group">
                                    <label>Background Image URL</label>
                                    <input type="text" value={sections.cta.bgImage} onChange={(e) => updateSection('bgImage', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="cms-section-editor">
                            <h3>Quiz / Recommendation Section</h3>
                            <div className="cms-form-grid">
                                <div className="cms-field-group">
                                    <label>Heading</label>
                                    <input type="text" value={sections.quiz.heading} onChange={(e) => updateSection('heading', e.target.value)} />
                                </div>
                                <div className="cms-field-group">
                                    <label>Button Text</label>
                                    <input type="text" value={sections.quiz.buttonText} onChange={(e) => updateSection('buttonText', e.target.value)} />
                                </div>
                                <div className="cms-field-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Description Text</label>
                                    <textarea value={sections.quiz.text} onChange={(e) => updateSection('text', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add more sections as needed */}
                </div>
            </div>
        </div>
    );
};

export default HomepageManager;
