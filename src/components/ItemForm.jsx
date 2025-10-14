import React, { useState, useEffect } from 'react';
import { savePortfolioItem, getSectionsQuery, onSnapshot } from '../firebase/utils';

// --- এখানে `onSave = () => {}` যোগ করা হয়েছে ---
const ItemForm = ({ item = {}, onSave = () => {}, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        client: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        tools: '',
        duration: '',
        sectionId: '',
    });
    const [sections, setSections] = useState([]);
    const [error, setError] = useState('');

    // 1. Sections fetch করা (component mount-এর সময় একবার)
    useEffect(() => {
        const q = getSectionsQuery();
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSections = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
            setSections(fetchedSections);
        });
        return () => unsubscribe();
    }, []); 

    // *** Item Prop Initialization and Default Section Setting. ***
    useEffect(() => {
        const isNewItem = !item.id;
        let newSectionId = item.sectionId || '';

        // If it's a new item AND sections are loaded, set the default section ID.
        if (isNewItem && sections.length > 0 && !newSectionId) {
            newSectionId = sections[0].id;
        }

        // Object creation to compare state without relying on prop reference
        const initialFormData = {
            id: item.id || null,
            title: item.title || '',
            client: item.client || '',
            description: item.description || '',
            videoUrl: item.videoUrl || '',
            thumbnailUrl: item.thumbnailUrl || '',
            tools: item.tools || '',
            duration: item.duration || '',
            sectionId: newSectionId,
        };

        setFormData(prevFormData => {
            
            const shouldUpdate = 
                prevFormData.id !== initialFormData.id ||
                prevFormData.sectionId !== initialFormData.sectionId ||
                prevFormData.title !== initialFormData.title;
                

            if (shouldUpdate) {
                return initialFormData;
            }
            
            return prevFormData; 
        });
        
    }, [item.id, item.sectionId, item.title, sections.length]); 


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Thumbnail URL validation removed in previous step.
        if (!formData.title || !formData.videoUrl || !formData.sectionId) {
            setError('Title, Video URL, and Section are required.');
            return;
        }
        try {
            await savePortfolioItem(formData);
            onSave();
        } catch (err) {
            setError('Failed to save item. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-red-500">{item.id ? 'Edit Video Item' : 'Add New Video Item'}</h2>
                    
                    {error && <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>

                        {/* Client */}
                        <div>
                            <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-1">Client</label>
                            <input type="text" name="client" id="client" value={formData.client} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-gray-700 text-white rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
                    </div>

                     {/* Thumbnail URL */}
                    <div>
                        <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-300 mb-1">Thumbnail URL (Optional)</label>
                        <input type="text" name="thumbnailUrl" id="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Video URL */}
                    <div>
                         {/* Change: Updated label to reflect Google Drive support */}
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-1">Video URL (Google Drive or YouTube) *</label>
                        <input type="text" name="videoUrl" id="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Section */}
                        <div>
                             <label htmlFor="sectionId" className="block text-sm font-medium text-gray-300 mb-1">Section *</label>
                             <select name="sectionId" id="sectionId" value={formData.sectionId} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                                <option value="" disabled>Select a section</option>
                                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                             </select>
                        </div>
                         {/* Tools */}
                        <div>
                             <label htmlFor="tools" className="block text-sm font-medium text-gray-300 mb-1">Tools (comma-separated)</label>
                             <input type="text" name="tools" id="tools" value={formData.tools} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                         {/* Duration */}
                        <div>
                             <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duration (e.g., 2:30)</label>
                             <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;