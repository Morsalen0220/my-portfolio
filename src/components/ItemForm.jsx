import React, { useState, useEffect } from 'react';
import { savePortfolioItem } from '../firebase/utils';

// Helper component for inputs with better control over 'required'
const ItemFormInput = ({ label, name, value, onChange, type = 'text', placeholder = '', required = true }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:ring-2 focus:ring-violet-500"
            required={required}
        />
    </div>
);

// New component for the category dropdown
const ItemFormSelect = ({ label, name, value, onChange, options, required = true }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:ring-2 focus:ring-violet-500"
            required={required}
        >
            <option value="" disabled>Select a category</option>
            {options.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
            ))}
        </select>
    </div>
);


// Main ItemForm Component (New Design)
const ItemForm = ({ item, sections, onSave, onCancel }) => { 
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // FIX: useEffect will only run when the 'item' prop changes.
    // This prevents re-renders from resetting the form data.
    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({ sectionId: '' }); // Initialize for new items
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await savePortfolioItem(formData); 
            onSave();
        } catch (error) {
            console.error("Error saving portfolio item:", error);
            alert("Failed to save item. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const formTitle = formData.id ? "Edit Portfolio Item" : "Add New Portfolio Item";

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8 flex items-start justify-center">
            <div className="w-full max-w-3xl mt-12 bg-gray-800 p-8 rounded-xl shadow-2xl border border-violet-500/50">
                <h2 className="text-2xl font-bold mb-6 text-violet-400 border-b border-gray-700 pb-3">{formTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ItemFormInput 
                            label="Project Title" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="The Client Project" 
                            required={true} 
                        />
                        
                        <ItemFormSelect
                            label="Category"
                            name="sectionId"
                            value={formData.sectionId}
                            onChange={handleChange}
                            options={sections}
                            required={true}
                        />

                        <ItemFormInput 
                            label="Video URL (Embed Link)" 
                            name="videoUrl" 
                            value={formData.videoUrl} 
                            onChange={handleChange} 
                            type="url" 
                            placeholder="https://youtube.com/embed/..." 
                            required={false}
                        />
                        <ItemFormInput 
                            label="Thumbnail URL (Optional)" 
                            name="thumbnailUrl" 
                            value={formData.thumbnailUrl} 
                            onChange={handleChange} 
                            type="url" 
                            placeholder="https://placehold.co/..." 
                            required={false}
                        />
                        <ItemFormInput 
                            label="Tools Used (Optional, comma separated)" 
                            name="tools" 
                            value={formData.tools} 
                            onChange={handleChange} 
                            placeholder="Premiere Pro, After Effects" 
                            required={false}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="A brief description of the project and your role."
                            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border border-gray-600 focus:ring-2 focus:ring-violet-500"
                            required={true}
                        />
                    </div>
                    
                    <div className="flex gap-4 pt-4 border-t border-gray-700">
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition disabled:opacity-50" 
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : formData.id ? 'Update Item' : 'Add New Item'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;