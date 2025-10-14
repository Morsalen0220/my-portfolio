import React, { useState } from 'react'; // <-- এই লাইনে useState যোগ করা হয়েছে
import { useNavigate, Link } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import ItemForm from '../components/ItemForm';
import { signInWithEmail, signOutUser } from '../firebase/utils';

// AdminLogin Component: This handles the login form.
const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmail(email, password);
            // On successful login, the App component will re-render and show the AdminPanel.
        } catch (err) {
            setError("Login failed. Check email/password.");
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-red-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input
                            className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            id="email" type="email" placeholder="admin@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)} required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input
                            className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            id="password" type="password" placeholder="******************"
                            value={password} onChange={(e) => setPassword(e.target.value)} required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm italic mb-4">{error}</p>}
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" type="submit">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};


// AdminNav Component: Navigation for the admin section.
const AdminNav = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOutUser();
        navigate('/admin'); // Redirect to login page after sign out
    };
    
    return (
        <nav className="fixed bottom-4 md:top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/10 rounded-full p-2 shadow-2xl">
                <Link to="/" className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-300 hover:bg-white/10 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                    <span className="hidden md:inline">Portfolio</span>
                </Link>
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-red-600/50 hover:bg-red-600/80 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                    <span className="hidden md:inline">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};


// Main AdminPage Component: This is the brain of the admin section.
const AdminPage = ({ isAdmin, items, setEditingItem, editingItem }) => {
    // Logic to switch between ItemForm and AdminPanel
    if (editingItem !== null) {
        // If we are adding or editing an item, show the form
        return (
            <ItemForm 
                item={editingItem} // Prop name changed to 'item'
                onSave={() => setEditingItem(null)} // Handler to close form on save
                onCancel={() => setEditingItem(null)} // Handler to close form on cancel
            />
        );
    }

    if (isAdmin) {
        // If the user is an admin and not editing, show the panel
        return (
            <>
                <AdminNav />
                <AdminPanel items={items} setEditingItem={setEditingItem} />
            </>
        );
    }

    // If not an admin, show the login form
    return <AdminLogin />;
};

export default AdminPage;