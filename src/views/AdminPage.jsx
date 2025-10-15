import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import ItemForm from '../components/ItemForm';
import { signInWithEmail, signOutUser, getSectionsQuery, onSnapshot } from '../firebase/utils';
import { DynamicIcon } from '../components/PortfolioHelpers'; 

// AdminLogin Component: This handles the login form (New Design)
const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmail(email, password);
        } catch (err) {
            setError("Login failed. Check email/password.");
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-10 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-violet-600">
                <h2 className="text-3xl font-extrabold text-white mb-8 text-center flex items-center justify-center gap-2">
                    <DynamicIcon name="SettingsIcon" className="h-7 w-7 text-red-500" />
                    Admin Access
                </h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="email">Email Address</label>
                        <input
                            className="w-full py-3 px-4 text-white bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                            id="email" type="email" placeholder="admin@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)} required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="password">Password</label>
                        <input
                            className="w-full py-3 px-4 text-white bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                            id="password" type="password" placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)} required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm italic mb-4 text-center">{error}</p>}
                    <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg shadow-violet-500/30" type="submit">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};


// AdminNav Component: Navigation for the admin section
const AdminNav = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOutUser();
        navigate('/admin'); // Redirect to login page after sign out
    };
    
    return (
        <nav className="fixed bottom-4 md:top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-2 shadow-2xl">
                <Link to="/" className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-300 hover:bg-white/10 hover:text-white">
                    <DynamicIcon name="MonitorIcon" className="h-5 w-5"/>
                    <span className="hidden md:inline">View Portfolio</span>
                </Link>
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/30">
                    <DynamicIcon name="XIcon" className="h-5 w-5"/>
                    <span className="hidden md:inline">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};


// Main AdminPage Component: This is the brain of the admin section.
const AdminPage = ({ isAdmin, items, setEditingItem, editingItem }) => {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const q = getSectionsQuery();
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                           .sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
            setSections(fetchedSections);
        });
        return () => unsubscribe();
    }, []);

    // Logic to switch between ItemForm and AdminPanel
    if (editingItem !== null) {
        // If we are adding or editing an item, show the form and pass sections
        return (
            <ItemForm 
                item={editingItem} 
                sections={sections} // Pass sections to the form
                onSave={() => setEditingItem(null)} 
                onCancel={() => setEditingItem(null)} 
            />
        );
    }

    if (isAdmin) {
        // If the user is an admin and not editing, show the panel
        return (
            <>
                <AdminNav />
                {/* Pass sections to the AdminPanel */}
                <AdminPanel items={items} sections={sections} setEditingItem={setEditingItem} />
            </>
        );
    }

    // If not an admin, show the login form
    return <AdminLogin />;
};

export default AdminPage;