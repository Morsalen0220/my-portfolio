import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSnapshot, getSectionsQuery, saveSection, deletePortfolioItem, getCollectionQuery, saveCollectionItem, deleteCollectionItem, getSiteSettings, saveSiteSettings } from '../firebase/utils';

// --- Icon List ---
// এই তালিকাটি PublicPortfolio.jsx ফাইল থেকে নেওয়া হয়েছে
const availableIcons = [
    'FilmIcon',
    'UsersIcon',
    'VideoIcon',
    'SparklesIcon',
    'MicIcon',
    'PlayIcon',
    'DownloadIcon',
    'MailIcon',
    'XIcon',
    'CameraIcon',
    'EditIcon',
    'ScissorsIcon',
    'ImageIcon',
    'MusicIcon',
    'GlobeIcon',
    'MonitorIcon',
    'CpuIcon',
    'PenToolIcon',
    'PaletteIcon',
    'CodeIcon',
    'ShareIcon',
    'StarIcon',
    'HeartIcon',
    'ClockIcon',
    'SettingsIcon',
    'CheckCircleIcon',
    'FolderIcon',
    'LayersIcon',
    'BrushIcon',
    'CloudIcon',
    'TrendingUpIcon',
    'LightbulbIcon',
    'BriefcaseIcon',
    'FileVideoIcon',
    'CameraOffIcon',
    'UploadIcon',
    'EyeIcon',
    'MessageSquareIcon',
    'SendIcon'
];

// Reusable component for managing a collection
const CollectionManager = ({ title, collectionName, fields, itemDisplayName }) => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null); // null: hidden, {}: new, {id,...}: editing

    useEffect(() => {
        const q = getCollectionQuery(collectionName);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(fetchedItems);
        });
        return () => unsubscribe();
    }, [collectionName]);

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

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <button
                    onClick={() => setEditingItem({})}
                    className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                    + Add New
                </button>
            </div>

            {editingItem && (
                <form onSubmit={handleSave} className="space-y-4 mb-6 p-4 bg-gray-700/50 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">{editingItem.id ? `Edit ${itemDisplayName}` : `Add New ${itemDisplayName}`}</h3>
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium mb-1 text-gray-400">{field.label}</label>
                            {field.type === 'select' && field.name === 'icon' ? (
                                <select
                                    value={editingItem[field.name] || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, [field.name]: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex gap-4 pt-2">
                        <button type="submit" className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">Save</button>
                        <button type="button" onClick={() => setEditingItem(null)} className="px-5 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                        <div>
                            <p className="font-bold text-lg">{item[itemDisplayName]}</p>
                            {Object.keys(item)
                                .filter(key => key !== 'id' && key !== itemDisplayName && key !== 'createdAt' && key !== 'updatedAt')
                                .map(key => (
                                <p key={key} className="text-sm text-gray-400">
                                    <span className="font-semibold capitalize">{key}: </span> 
                                    {String(item[key])}
                                </p>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => setEditingItem(item)} className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition text-sm">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AdminPanel = ({ items, setEditingItem }) => {
    const [sections, setSections] = useState([]);
    const [newSectionName, setNewSectionName] = useState('');
    const [error, setError] = useState('');
    const [siteSettings, setSiteSettings] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const q = getSectionsQuery();
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
            setSections(fetchedSections);
        });

        const fetchSettings = async () => {
            const settings = await getSiteSettings();
            setSiteSettings(settings);
        };
        fetchSettings();

        return () => unsubscribe();
    }, []);

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

    const handleDeletePortfolioItem = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await deletePortfolioItem(id);
            } catch (err) {
                console.error("Failed to delete item", err);
                alert("Could not delete the item.");
            }
        }
    };

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


    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto pt-16 sm:pt-20">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-red-500">Admin Panel</h1>
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition">&larr; View Public Portfolio</button>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Site-wide Settings</h2>
                    <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">Hero Tagline</label>
                            <input name="heroTagline" value={siteSettings.heroTagline || ''} onChange={handleSettingsChange} className="w-full bg-gray-700 rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">Hero Title (HTML allowed)</label>
                            <input name="heroTitle" value={siteSettings.heroTitle || ''} onChange={handleSettingsChange} className="w-full bg-gray-700 rounded-lg p-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-400">Hero Subtitle</label>
                            <textarea name="heroSubtitle" value={siteSettings.heroSubtitle || ''} onChange={handleSettingsChange} className="w-full bg-gray-700 rounded-lg p-2" rows="2"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">Resume URL</label>
                            <input name="resumeUrl" value={siteSettings.resumeUrl || ''} onChange={handleSettingsChange} className="w-full bg-gray-700 rounded-lg p-2" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">Hero Image URL</label>
                            <input name="heroImageUrl" value={siteSettings.heroImageUrl || ''} onChange={handleSettingsChange} className="w-full bg-gray-700 rounded-lg p-2" />
                        </div>
                        <div className="md:col-span-2 text-right">
                             <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">Save Settings</button>
                        </div>
                    </form>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Manage Sections</h2>
                    <form onSubmit={handleAddSection} className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="New section name (e.g., Commercials)"
                            className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button type="submit" className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">Add Section</button>
                    </form>
                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                    <h3 className="text-lg font-medium mb-2">Existing Sections:</h3>
                    <div className="flex flex-wrap gap-2">
                        {sections.length > 0 ? sections.map(section => (
                            <span key={section.id} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">{section.name}</span>
                        )) : (<p className="text-gray-500 italic text-sm">No sections created yet.</p>)}
                    </div>
                </div>

                <CollectionManager
                    title="Manage Stats"
                    collectionName="stats"
                    itemDisplayName="label"
                    fields={[
                        { name: 'label', label: 'Label', type: 'text', placeholder: 'e.g., Projects Completed' },
                        { name: 'value', label: 'Value', type: 'text', placeholder: 'e.g., 100+' },
                        { name: 'icon', label: 'Icon', type: 'select' }
                    ]}
                />
                <CollectionManager
                    title="Manage Skills"
                    collectionName="skills"
                    itemDisplayName="name"
                    fields={[
                        { name: 'name', label: 'Skill Name', type: 'text', placeholder: 'e.g., Adobe Premiere Pro' },
                        { name: 'level', label: 'Level (0-100)', type: 'number', placeholder: 'e.g., 95' }
                    ]}
                />
                <CollectionManager
                    title="Manage Service Cards"
                    collectionName="services"
                    itemDisplayName="title"
                    fields={[
                        { name: 'title', label: 'Service Title', type: 'text', placeholder: 'e.g., Social Media Reels' },
                        { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
                        { name: 'icon', label: 'Icon', type: 'select' }
                    ]}
                />
                <CollectionManager
                    title="Manage Service List (Right Side)"
                    collectionName="service_list"
                    itemDisplayName="name"
                    fields={[ { name: 'name', label: 'Service Name', type: 'text', placeholder: 'e.g., Video Editing & Post-Production' }, ]}
                />
                <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Portfolio Items</h2>
                        <button onClick={() => setEditingItem({})} className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition">
                            + Add New Video
                        </button>
                    </div>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                <div>
                                    <p className="font-bold text-lg">{item.title}</p>
                                    <p className="text-sm text-gray-400">{item.client}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => setEditingItem(item)} className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition text-sm">Edit</button>
                                    <button onClick={() => handleDeletePortfolioItem(item.id)} className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;