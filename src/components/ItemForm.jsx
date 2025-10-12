import React, { useState, useEffect } from 'react';
import { savePortfolioItem, getSectionsQuery, onSnapshot } from '../firebase/utils';

const ItemForm = ({ initialData, setEditingItem }) => {
    const [sections, setSections] = useState([]);
    const initialFormState = {
        title: '',
        description: '',
        videoUrl: '',
        type: 'youtube',
        client: '',
        duration: '',
        tools: '',
        year: new Date().getFullYear().toString(),
        sectionId: '', // Notun field
    };

    const [formData, setFormData] = useState(initialData.id ? initialData : initialFormState);
    const [error, setError] = useState('');

    // Fetch sections for the dropdown
    useEffect(() => {
        const q = getSectionsQuery();
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSections = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSections(fetchedSections);
            // Set default section if creating a new item
            if (!formData.id && fetchedSections.length > 0) {
                setFormData(prev => ({ ...prev, sectionId: fetchedSections[0].id }));
            }
        });
        return () => unsubscribe();
    }, [formData.id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.videoUrl || !formData.sectionId) {
            setError('Title, Video URL, and Section are required.');
            return;
        }

        try {
            await savePortfolioItem(formData);
            setEditingItem(null); // Close the form
        } catch (err) {
            setError('Failed to save item. Please try again.');
            console.error("Failed to save item:", err);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-red-500">{formData.id ? 'Edit Video' : 'Add New Video'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 mb-2">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        </div>

                        {/* Video URL */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 mb-2">Video URL</label>
                            <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-gray-400 mb-2">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500">
                                <option value="youtube">YouTube</option>
                                <option value="drive">Google Drive</option>
                            </select>
                        </div>
                        
                        {/* Section Dropdown - Notun */}
                        <div>
                            <label className="block text-gray-400 mb-2">Section</label>
                            <select name="sectionId" value={formData.sectionId} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" required>
                                <option value="" disabled>Select a section</option>
                                {sections.map(section => (
                                    <option key={section.id} value={section.id}>{section.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Other Fields */}
                        <div>
                            <label className="block text-gray-400 mb-2">Client</label>
                            <input type="text" name="client" value={formData.client} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Duration</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Tools</label>
                            <input type="text" name="tools" value={formData.tools} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Year</label>
                            <input type="text" name="year" value={formData.year} onChange={handleChange} className="w-full bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                    </div>

                    {error && <p className="text-red-400 mt-4">{error}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">{formData.id ? 'Save Changes' : 'Add Video'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;

