// src/views/AdminPanel.jsx (Final Code)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSnapshot, getSectionsQuery, saveSection, deletePortfolioItem, getCollectionQuery, saveCollectionItem, deleteCollectionItem, getSiteSettings, saveSiteSettings } from '../firebase/utils';
import { motion } from 'framer-motion';

// --- Icon List (Must be imported or defined here) ---
const availableIcons = [
    'FilmIcon', 'UsersIcon', 'VideoIcon', 'SparklesIcon', 'MicIcon', 'PlayIcon', 'DownloadIcon', 'MailIcon', 'XIcon', 'CameraIcon',
    'EditIcon', 'ScissorsIcon', 'ImageIcon', 'MusicIcon', 'GlobeIcon', 'MonitorIcon', 'CpuIcon', 'PenToolIcon', 'PaletteIcon', 'CodeIcon',
    'ShareIcon', 'StarIcon', 'HeartIcon', 'ClockIcon', 'SettingsIcon', 'CheckCircleIcon', 'FolderIcon', 'LayersIcon', 'BrushIcon',
    'CloudIcon', 'TrendingUpIcon', 'LightbulbIcon', 'BriefcaseIcon', 'FileVideoIcon', 'CameraOffIcon', 'UploadIcon', 'EyeIcon',
    'MessageSquareIcon', 'SendIcon', 'FacebookIcon', 'LinkedinIcon', 'WhatsappIcon', 'PhoneIcon', 'SocialIcon'
];

// --- Reusable Collection Manager (Compact) ---
const CollectionManager = ({ title, collectionName, fields, itemDisplayName, setEditingPortfolioItem, items: propItems }) => {
    const [items, setItems] = useState(propItems || []);
    const [editingItem, setEditingItem] = useState(null); 

    useEffect(() => {
        if (!propItems) {
            const q = getCollectionQuery(collectionName);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setItems(fetchedItems);
            });
            return () => unsubscribe();
        } else {
             // For Portfolio items passed via prop
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
        if (window.confirm(`Are you sure you want to delete this ${itemDisplayName}?`)) {
            try {
                await deleteCollectionItem(collectionName, id);
            } catch (err) {
                console.error(`Failed to delete ${itemDisplayName}`, err);
                alert(`Could not delete the ${itemDisplayName}.`);
            }
        }
    };

    const isPortfolio = collectionName === 'portfolio';

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{title}</h3>
                <button
                    onClick={() => isPortfolio ? setEditingPortfolioItem({}) : setEditingItem({})}
                    className="px-4 py-1.5 bg-violet-600 text-sm rounded-md hover:bg-violet-700 transition"
                >
                    + Add
                </button>
            </div>

            {/* Item Edit/Add Form - Only visible if editingItem is locally managed */}
            {editingItem && !isPortfolio && (
                <form onSubmit={handleSave} className="space-y-3 mb-4 p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="text-lg font-semibold">{editingItem.id ? `Edit ${itemDisplayName}` : `Add New ${itemDisplayName}`}</h4>
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="block text-xs font-medium mb-1 text-gray-400">{field.label}</label>
                            {field.type === 'select' && field.name === 'icon' ? (
                                <select
                                    value={editingItem[field.name] || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, [field.name]: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm focus:ring-red-500"
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
                                    className="w-full bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm focus:ring-red-500"
                                    required
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex gap-3 pt-1">
                        <button type="submit" className="px-4 py-1 bg-blue-600 text-sm rounded-md hover:bg-blue-700 transition">Save</button>
                        <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-1 bg-gray-600 text-sm rounded-md hover:bg-gray-500 transition">Cancel</button>
                    </div>
                </form>
            )}

            {/* Item List (Shorter view: max-h-48) */}
            <div className="space-y-2 overflow-y-auto max-h-48 pt-2">
                {items.map((item, index) => (
                    <div key={item.id || `item-${index}`} className="flex items-center justify-between bg-gray-700/70 p-3 rounded-md">
                        <p className="font-semibold text-sm truncate">{item.title || item.name || item.label}</p>
                        <div className="flex space-x-2 flex-shrink-0">
                            <button onClick={() => isPortfolio ? setEditingPortfolioItem(item) : setEditingItem(item)} className="px-3 py-0.5 bg-blue-600 rounded-md hover:bg-blue-700 transition text-xs">Edit</button>
                            <button onClick={() => isPortfolio ? deletePortfolioItem(item.id) : handleDelete(item.id)} className="px-3 py-0.5 bg-red-600 rounded-md hover:bg-red-700 transition text-xs">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Settings Tab Component ---
const SettingsTab = ({ siteSettings, handleSettingsChange, handleSaveSettings }) => (
    <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="space-y-4 bg-gray-800/70 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-violet-400">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Hero Tagline" name="heroTagline" value={siteSettings.heroTagline} onChange={handleSettingsChange} placeholder="Video Editor & Storyteller" />
                <InputGroup label="Hero Title (HTML allowed)" name="heroTitle" value={siteSettings.heroTitle} onChange={handleSettingsChange} placeholder="Crafting Visual <span>Stories</span>" />
                <TextAreaGroup label="Hero Subtitle" name="heroSubtitle" value={siteSettings.heroSubtitle} onChange={handleSettingsChange} placeholder="I transform raw footage..." />
                <InputGroup label="Resume URL" name="resumeUrl" type="url" value={siteSettings.resumeUrl} onChange={handleSettingsChange} placeholder="https://drive.google.com/d/..." />
                <InputGroup label="Hero Image URL" name="heroImageUrl" type="url" value={siteSettings.heroImageUrl} onChange={handleSettingsChange} placeholder="https://placehold.co/..." />
            </div>
        </div>

        <div className="space-y-4 bg-gray-800/70 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-violet-400">Social Media & Contact Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Facebook URL" name="facebookUrl" type="url" value={siteSettings.facebookUrl} onChange={handleSettingsChange} placeholder="https://facebook.com/yourhandle" />
                <InputGroup label="LinkedIn URL" name="linkedinUrl" type="url" value={siteSettings.linkedinUrl} onChange={handleSettingsChange} placeholder="https://linkedin.com/in/yourhandle" />
                <InputGroup label="WhatsApp Number" name="whatsappNumber" value={siteSettings.whatsappNumber} onChange={handleSettingsChange} placeholder="8801XXXXXXXXX (No +)" />
                <InputGroup label="Phone Number (Display)" name="phoneNumber" value={siteSettings.phoneNumber} onChange={handleSettingsChange} placeholder="+880 1XXX-XXXXXX" />
            </div>
        </div>

        <button type="submit" className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg">
            Save All Settings
        </button>
    </form>
);


// --- Data Management Tab Component ---
const DataManagementTab = ({ items, sections, setEditingPortfolioItem }) => (
    <div className="space-y-6">
        {/* Manage Sections */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-violet-400">Manage Sections/Categories</h3>
            <ManageSections sections={sections} />
        </div>

        {/* Portfolio Items - Uses CollectionManager but passes setEditingPortfolioItem */}
        <CollectionManager
            title="Portfolio Items (Videos)"
            collectionName="portfolio"
            itemDisplayName="title"
            items={items}
            setEditingPortfolioItem={setEditingPortfolioItem} // Passed directly to trigger main ItemForm
            fields={[
                { name: 'title', label: 'Title', type: 'text', placeholder: 'Project Title' },
                { name: 'videoUrl', label: 'Video URL (YT/Drive Embed)', type: 'url', placeholder: 'https://drive.google.com/...' },
                { name: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url', placeholder: 'https://placehold.co/...' },
                { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
                { name: 'tools', label: 'Tools (Comma separated)', type: 'text', placeholder: 'Premiere Pro, After Effects' },
                { name: 'sectionId', label: 'Section ID', type: 'text', placeholder: 'Section ID from above' },
            ]}
        />

        {/* Other Collections in a Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CollectionManager
                title="Stats/Counters"
                collectionName="stats"
                itemDisplayName="label"
                fields={[
                    { name: 'label', label: 'Label', type: 'text', placeholder: 'e.g., Projects Completed' },
                    { name: 'value', label: 'Value', type: 'text', placeholder: 'e.g., 100+' },
                    { name: 'icon', label: 'Icon', type: 'select' }
                ]}
            />
            <CollectionManager
                title="Skills (Level 0-100)"
                collectionName="skills"
                itemDisplayName="name"
                fields={[
                    { name: 'name', label: 'Skill Name', type: 'text', placeholder: 'e.g., Adobe Premiere Pro' },
                    { name: 'level', label: 'Level (0-100)', type: 'number', placeholder: 'e.g., 95' }
                ]}
            />
            <CollectionManager
                title="Service Cards"
                collectionName="services"
                itemDisplayName="title"
                fields={[
                    { name: 'title', label: 'Title', type: 'text', placeholder: 'Social Media Reels' },
                    { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
                    { name: 'icon', label: 'Icon', type: 'select' }
                ]}
            />
            <CollectionManager
                title="Service List Items"
                collectionName="service_list"
                itemDisplayName="name"
                fields={[ { name: 'name', label: 'Service Name', type: 'text', placeholder: 'Video Editing & Post-Production' }, ]}
            />
        </div>
    </div>
);


// --- Reusable Input/Textarea Components ---
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
            rows="2"
            value={value || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm p-2 text-sm focus:border-red-500 focus:ring-red-500"
            placeholder={placeholder}
        />
    </div>
);

// --- Manage Sections Component (Kept same logic, separate component) ---
const ManageSections = ({ sections }) => {
    const [newSectionName, setNewSectionName] = useState('');
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

    return (
        <div className="space-y-4">
            <form onSubmit={handleAddSection} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="New section name (e.g., Commercials)"
                    className="flex-grow bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="px-4 py-2 bg-red-600 text-sm rounded-lg hover:bg-red-700 transition flex-shrink-0">Add Section</button>
            </form>
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <h4 className="text-md font-medium text-gray-400">Existing Sections:</h4>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto p-1 bg-gray-700 rounded-md">
                {sections.length > 0 ? sections.map(section => (
                    <span key={section.id} className="bg-gray-600 text-gray-300 px-3 py-1 rounded-full text-xs">{section.name}</span>
                )) : (<p className="text-gray-500 italic text-sm">No sections created yet.</p>)}
            </div>
        </div>
    );
};


// --- AdminPanel Main Component ---
const AdminPanel = ({ items, setEditingItem }) => {
    const [sections, setSections] = useState([]);
    const [siteSettings, setSiteSettings] = useState({});
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'data'
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const q = getSectionsQuery();
                const unsubscribeSections = onSnapshot(q, (snapshot) => {
                    const fetchedSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
                    setSections(fetchedSections);
                });
                
                const settings = await getSiteSettings();
                setSiteSettings(settings);
                setLoading(false);
                
                return () => unsubscribeSections();
            } catch (err) {
                console.error("Error loading admin data:", err);
                setLoading(false);
            }
        };
        fetchData();
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'settings':
                return <SettingsTab siteSettings={siteSettings} handleSettingsChange={handleSettingsChange} handleSaveSettings={handleSaveSettings} />;
            case 'data':
                // Assuming 'items' passed to AdminPanel contains all portfolio items
                return <DataManagementTab items={items} sections={sections} setEditingPortfolioItem={setEditingItem} />;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Admin Panel...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto pt-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-bold text-red-500">Admin Dashboard</h1>
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition text-sm flex-shrink-0">&larr; View Portfolio</button>
                </div>
                
                {/* Tab Navigation */}
                <div className="mb-6">
                    <nav className="flex space-x-4 border-b border-gray-700">
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 text-lg font-medium transition-colors ${activeTab === 'settings' ? 'border-b-2 border-violet-500 text-violet-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            <span className="hidden sm:inline">Site </span>Settings
                        </button>
                        <button 
                            onClick={() => setActiveTab('data')}
                            className={`px-4 py-2 text-lg font-medium transition-colors ${activeTab === 'data' ? 'border-b-2 border-violet-500 text-violet-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            Data Management
                        </button>
                    </nav>
                </div>

                {renderTabContent()}

            </div>
        </div>
    );
};

export default AdminPanel;