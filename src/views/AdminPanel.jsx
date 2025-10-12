import React, { useState, useEffect } from 'react';
import { db, getSectionsQuery, saveSection, deletePortfolioItem, onSnapshot } from '../firebase/utils';

const AdminPanel = ({ items, setView, setEditingItem }) => {
    const [sections, setSections] = useState([]);
    const [newSectionName, setNewSectionName] = useState('');
    const [error, setError] = useState('');

    // Fetch sections from Firestore
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

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await deletePortfolioItem(id);
            } catch (err) {
                console.error("Failed to delete item", err);
                alert("Could not delete the item.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-red-500">Admin Panel</h1>
                    <button
                        onClick={() => setView('public')}
                        className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                    >
                        &larr; View Public Portfolio
                    </button>
                </div>

                {/* Manage Sections */}
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
                        <button type="submit" className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">
                            Add Section
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                    
                    <h3 className="text-lg font-medium mb-2">Existing Sections:</h3>
                    <div className="flex flex-wrap gap-2">
                        {sections.length > 0 ? sections.map(section => (
                            <span key={section.id} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                                {section.name}
                            </span>
                        )) : (
                            <p className="text-gray-500 italic text-sm">No sections created yet.</p>
                        )}
                    </div>
                </div>


                {/* Portfolio Items List */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Portfolio Items</h2>
                        <button
                            onClick={() => setEditingItem({})}
                            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                        >
                            + Add New Video
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                <div>
                                    <p className="font-bold text-lg">{item.title}</p>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition text-sm"
                                    >
                                        Delete
                                    </button>
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

