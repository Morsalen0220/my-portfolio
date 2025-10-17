// src/views/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSnapshot, getSectionsQuery, saveSection, deletePortfolioItem, getCollectionQuery, saveCollectionItem, deleteCollectionItem, getSiteSettings, saveSiteSettings, updateSection, deleteSection } from '../firebase/utils';
import { motion } from 'framer-motion';

// --- Icon List (Full list for selects) ---
const availableIcons = [
    'FilmIcon', 'UsersIcon', 'VideoIcon', 'SparklesIcon', 'MicIcon', 'PlayIcon', 'DownloadIcon', 'MailIcon', 'XIcon', 'CameraIcon',
    'EditIcon', 'ScissorsIcon', 'ImageIcon', 'MusicIcon', 'GlobeIcon', 'MonitorIcon', 'CpuIcon', 'PenToolIcon', 'PaletteIcon', 'CodeIcon',
    'ShareIcon', 'StarIcon', 'HeartIcon', 'ClockIcon', 'SettingsIcon', 'CheckCircleIcon', 'FolderIcon', 'LayersIcon', 'BrushIcon',
    'CloudIcon', 'TrendingUpIcon', 'LightbulbIcon', 'BriefcaseIcon', 'FileVideoIcon', 'CameraOffIcon', 'UploadIcon', 'EyeIcon',
    'MessageSquareIcon', 'SendIcon', 'FacebookIcon', 'LinkedinIcon', 'WhatsappIcon', 'PhoneIcon', 'SocialIcon', 'PencilAltIcon', 'QuestionMarkCircleIcon', 'HomeIcon', 'ChevronLeftIcon', 'ChevronRightIcon', 'ChevronDownIcon'
];

// --- Sub-Component: Input/Textarea Components ---
const InputGroup = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm p-2 text-sm focus:border-red-500 focus:ring-red-500"
            placeholder={placeholder}
        />
    </div>
);

const TextAreaGroup = ({ label, name, value, onChange, placeholder }) => (
    <div className="md:col-span-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
        <textarea
            name={name}
            id={name}
            rows="3"
            value={value || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm p-2 text-sm focus:border-red-500 focus:ring-red-500"
            placeholder={placeholder}
        />
    </div>
);


// --- Sub-Component: Manage Sections (with Edit/Delete) ---
const ManageSections = ({ sections }) => {
    const [newSectionName, setNewSectionName] = useState('');
    const [editingSection, setEditingSection] = useState({ id: null, name: '' });
    const [error, setError] = useState('');

    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!newSectionName.trim()) {
            setError('Section name cannot be empty.');
            return;
        }
        try {
            await saveSection(newSectionName);
            setNewSectionName('');
            setError('');
        } catch (err) {
            setError('Failed to add section.');
            console.error(err);
        }
    };

    const handleUpdateSection = async () => {
        if (!editingSection.id || !editingSection.name.trim()) return;
        try {
            await updateSection(editingSection.id, editingSection.name);
            setEditingSection({ id: null, name: '' });
        } catch (err) {
            alert('Failed to update section.');
        }
    };
    
    const handleDeleteSection = async (sectionId) => {
        if (window.confirm(`Are you sure you want to delete this category? All portfolio items in this category will need to be reassigned.`)) {
            try {
                await deleteSection(sectionId);
            } catch (err) {
                alert('Failed to delete section.');
            }
        }
    };

    return (
        <div className="p-4 rounded-lg bg-gray-800/70 border border-gray-700 space-y-4">
            <h4 className="text-lg font-semibold text-violet-400">Manage Portfolio Categories</h4>
            <form onSubmit={handleAddSection} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="New category name (e.g., Reels)"
                    className="flex-grow bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="px-4 py-2 bg-red-600 text-sm rounded-lg hover:bg-red-700 transition font-semibold">Add Category</button>
            </form>
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            
            <div className="space-y-2 border-t border-gray-700 pt-3">
                {sections.map(section => (
                    <div key={section.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                        {editingSection.id === section.id ? (
                            <input
                                type="text"
                                value={editingSection.name}
                                onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                                className="bg-gray-600 text-white rounded-md px-2 py-1 text-sm flex-grow"
                            />
                        ) : (
                            <p className="text-sm font-mono text-gray-300">{section.name} (ID: {section.id})</p>
                        )}
                        <div className="flex space-x-2">
                            {editingSection.id === section.id ? (
                                <>
                                    <button onClick={handleUpdateSection} className="px-2 py-1 bg-green-600 text-xs rounded-md">Save</button>
                                    <button onClick={() => setEditingSection({ id: null, name: '' })} className="px-2 py-1 bg-gray-500 text-xs rounded-md">Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditingSection({ id: section.id, name: section.name })} className="px-2 py-1 bg-blue-600 text-xs rounded-md">Edit</button>
                                    <button onClick={() => handleDeleteSection(section.id)} className="px-2 py-1 bg-red-600 text-xs rounded-md">Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Sub-Component: Reusable Collection Manager ---
const CollectionManager = ({ title, collectionName, fields, itemDisplayName, setEditingPortfolioItem, items: propItems, allowAdd = true, allowEdit = true }) => {
    const [items, setItems] = useState(propItems || []);
    const [editingItem, setEditingItem] = useState(null); 

    useEffect(() => {
        if (!propItems) {
            const q = getCollectionQuery(collectionName);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                 if (collectionName === 'reviews') {
                    fetchedItems.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                }
                setItems(fetchedItems);
            });
            return () => unsubscribe();
        } else {
             setItems(propItems);
        }
    }, [collectionName, propItems]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const itemToSave = { ...editingItem };
            fields.forEach(field => {
                if (field.type === 'number' && itemToSave[field.name]) {
                    itemToSave[field.name] = Number(itemToSave[field.name]);
                }
            });
            await saveCollectionItem(collectionName, itemToSave);
            setEditingItem(null);
        } catch (err) {
            console.error(`Failed to save ${itemDisplayName}`, err);
            alert(`Could not save the ${itemDisplayName}.`);
        }
    };

    const handleDelete = async (id) => {
        if (!id) {
            alert(`Cannot delete item: ID is missing.`);
            return;
        }
        if (window.confirm(`Are you sure you want to permanently delete this item: ${id}?`)) {
            try {
                await deleteCollectionItem(collectionName, id);
            } catch (err) {
                alert(`Could not delete the ${itemDisplayName}.`);
            }
        }
    };
    
    const isPortfolio = collectionName === 'portfolio_items'; 
    const visibleItems = items.filter(item => item.id); 

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <h3 className="text-xl font-bold text-red-500">{title}</h3>
                {allowAdd && (
                     <button
                        onClick={() => isPortfolio ? setEditingPortfolioItem({}) : setEditingItem({})}
                        className="px-4 py-1.5 bg-violet-600 text-sm rounded-md hover:bg-violet-700 transition font-semibold shadow-md"
                    >
                        + Add New
                    </button>
                )}
            </div>

            {editingItem && !isPortfolio && (
                <form onSubmit={handleSave} className="space-y-4 mb-4 p-4 bg-gray-700 rounded-lg border border-violet-500/50">
                    <h4 className="text-lg font-semibold">{editingItem.id ? `Edit ${itemDisplayName}` : `Add New ${itemDisplayName}`}</h4>
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="block text-xs font-medium mb-1 text-gray-400">{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    rows="4"
                                    placeholder={field.placeholder}
                                    value={editingItem[field.name] || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, [field.name]: e.target.value })}
                                    className="w-full bg-gray-600 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            ) : field.type === 'select' && field.name === 'icon' ? (
                                <select
                                    value={editingItem[field.name] || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, [field.name]: e.target.value })}
                                    className="w-full bg-gray-600 text-white rounded-md px-3 py-2 text-sm focus:ring-red-500"
                                    required
                                >
                                    <option value="" disabled>Select an icon</option>
                                    {availableIcons.map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={editingItem[field.name] || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, [field.name]: e.target.value })}
                                    className="w-full bg-gray-600 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                                    required={field.required !== false}
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex gap-3 pt-1">
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Save Item</button>
                        <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition">Cancel</button>
                    </div>
                </form>
            )}

            <div className="space-y-3 overflow-y-auto max-h-72">
                {visibleItems.length > 0 ? (
                    visibleItems.map((item) => (
                        <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between bg-gray-700/70 p-3 rounded-md border border-gray-700 hover:border-violet-500 transition-colors"
                        >
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-sm truncate text-white">{item.title || item.name || item.label || item.question || 'Unnamed Item'}</p>
                                {item.review && <p className="text-xs text-gray-400 font-mono mt-1 truncate">"{item.review}"</p>}
                                {item.answer && <p className="text-xs text-gray-400 font-mono mt-1 truncate">{item.answer}</p>}
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 ml-2">
                                {allowEdit && (
                                     <button onClick={() => isPortfolio ? setEditingPortfolioItem(item) : setEditingItem(item)} className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition text-xs font-semibold">Edit</button>
                                )}
                                <button 
                                    onClick={() => handleDelete(item.id)} 
                                    className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition text-xs font-semibold"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-gray-500 italic text-sm p-3 text-center">No saved items found. {allowAdd ? "Click '+ Add New' to create one." : ""}</p>
                )}
            </div>
        </div>
    );
};


// --- Sub-Component: Settings Tab ---
const SettingsTab = ({ siteSettings, handleSettingsChange, handleSaveSettings }) => (
    <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* ... SettingsTab code remains the same ... */}
        <div className="space-y-4 bg-gray-800/70 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold text-violet-400">Hero Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Hero Tagline" name="heroTagline" value={siteSettings.heroTagline} onChange={handleSettingsChange} placeholder="Video Editor & Storyteller" />
                <InputGroup label="Hero Title (HTML allowed)" name="heroTitle" value={siteSettings.heroTitle} onChange={handleSettingsChange} placeholder="Crafting Visual <span>Stories</span>" />
                <TextAreaGroup label="Hero Subtitle" name="heroSubtitle" value={siteSettings.heroSubtitle} onChange={handleSettingsChange} placeholder="I transform raw footage..." />
                <InputGroup label="Resume URL" name="resumeUrl" type="url" value={siteSettings.resumeUrl} onChange={handleSettingsChange} placeholder="https://drive.google.com/..." />
                <InputGroup label="Hero Image URL" name="heroImageUrl" type="url" value={siteSettings.heroImageUrl} onChange={handleSettingsChange} placeholder="https://placehold.co/..." />
            </div>
        </div>
        
        <div className="space-y-4 bg-gray-800/70 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold text-violet-400">Section Titles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup label="Services Title" name="servicesTitle" value={siteSettings.servicesTitle} onChange={handleSettingsChange} placeholder="What I Offer" />
                 <TextAreaGroup label="Services Subtitle" name="servicesSubtitle" value={siteSettings.servicesSubtitle} onChange={handleSettingsChange} placeholder="High-quality services..." />
                 <InputGroup label="Skills Title" name="skillsTitle" value={siteSettings.skillsTitle} onChange={handleSettingsChange} placeholder="Technical Expertise" />
                 <TextAreaGroup label="Skills Subtitle" name="skillsSubtitle" value={siteSettings.skillsSubtitle} onChange={handleSettingsChange} placeholder="Proficient in industry-standard tools..." />
            </div>
        </div>

        <div className="space-y-4 bg-gray-800/70 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold text-violet-400">Social Media & Footer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Facebook URL" name="facebookUrl" type="url" value={siteSettings.facebookUrl} onChange={handleSettingsChange} placeholder="https://facebook.com/yourhandle" />
                <InputGroup label="LinkedIn URL" name="linkedinUrl" type="url" value={siteSettings.linkedinUrl} onChange={handleSettingsChange} placeholder="https://linkedin.com/in/yourhandle" />
                <InputGroup label="WhatsApp Number" name="whatsappNumber" value={siteSettings.whatsappNumber} onChange={handleSettingsChange} placeholder="8801XXXXXXXXX (No +)" />
                <InputGroup label="Phone Number (Display)" name="phoneNumber" value={siteSettings.phoneNumber} onChange={handleSettingsChange} placeholder="+880 1XXX-XXXXXX" />
                <InputGroup label="Footer Name" name="footerName" value={siteSettings.footerName} onChange={handleSettingsChange} placeholder="Your Name" />
                <InputGroup label="Footer Tagline" name="footerTagline" value={siteSettings.footerTagline} onChange={handleSettingsChange} placeholder="Crafted with passion..." />
            </div>
        </div>

        <button type="submit" className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg mt-6">
            Save All Settings
        </button>
    </form>
);


// --- Sub-Component: Data Management Tab ---
const DataManagementTab = ({ items, sections, setEditingPortfolioItem }) => (
    <div className="space-y-6">
        
        <ManageSections sections={sections} />

        <CollectionManager
            title="Portfolio Items (Videos)"
            collectionName="portfolio_items" 
            itemDisplayName="Video Item"
            items={items}
            setEditingPortfolioItem={setEditingPortfolioItem} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CollectionManager
                title="Manage Reviews"
                collectionName="reviews"
                itemDisplayName="Review"
                allowAdd={false} // FIX: No 'Add New' button
                allowEdit={false} // FIX: No 'Edit' button
            />
            <CollectionManager
                title="Manage FAQs"
                collectionName="faqs"
                itemDisplayName="FAQ"
                fields={[
                    { name: 'question', label: 'Question', type: 'text', placeholder: 'e.g., What are the payment terms?' },
                    { name: 'answer', label: 'Answer', type: 'textarea', placeholder: 'Provide a detailed answer here.' }
                ]}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CollectionManager
                title="Stats/Counters"
                collectionName="stats"
                itemDisplayName="Statistic"
                fields={[
                    { name: 'label', label: 'Label', type: 'text', placeholder: 'e.g., Projects Completed' },
                    { name: 'value', label: 'Value', type: 'text', placeholder: 'e.g., 100+' },
                    { name: 'icon', label: 'Icon', type: 'select' }
                ]}
            />
            <CollectionManager
                title="Skills (Level 0-100)"
                collectionName="skills"
                itemDisplayName="Skill"
                fields={[
                    { name: 'name', label: 'Skill Name', type: 'text', placeholder: 'e.g., Adobe Premiere Pro' },
                    { name: 'level', label: 'Level (0-100)', type: 'number', placeholder: 'e.g., 95' }
                ]}
            />
            <CollectionManager
                title="Service Cards"
                collectionName="services"
                itemDisplayName="Service Card"
                fields={[
                    { name: 'title', label: 'Title', type: 'text', placeholder: 'Social Media Reels' },
                    { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
                    { name: 'icon', label: 'Icon', type: 'select' }
                ]}
            />
            <CollectionManager
                title="Service List Items"
                collectionName="service_list"
                itemDisplayName="Service List Item"
                fields={[ { name: 'name', label: 'Service Name', type: 'text', placeholder: 'Video Editing & Post-Production' }, ]}
            />
        </div>
    </div>
);


// --- Main Component: AdminPanel ---
const AdminPanel = ({ items, sections, setEditingItem }) => { 
    const [siteSettings, setSiteSettings] = useState({});
    const [activeTab, setActiveTab] = useState('data');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const settings = await getSiteSettings();
            setSiteSettings(settings);
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSiteSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await saveSiteSettings(siteSettings);
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings.');
        }
    };

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tabName ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'settings':
                return <SettingsTab siteSettings={siteSettings} handleSettingsChange={handleSettingsChange} handleSaveSettings={handleSaveSettings} />;
            case 'data':
                return <DataManagementTab items={items} sections={sections} setEditingPortfolioItem={setEditingItem} />;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-700 pb-4 gap-4">
                    <h1 className="text-3xl font-bold text-red-500">Admin Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <TabButton tabName="data" label="Manage Data" />
                        <TabButton tabName="settings" label="Site Settings" />
                        <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 transition text-sm flex-shrink-0">← View Site</button>
                    </div>
                </div>

                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminPanel;