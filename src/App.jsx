import React, { useState, useEffect } from 'react';
import PublicPortfolio from './views/PublicPortfolio';
import AdminPanel from './views/AdminPanel';
import ItemForm from './components/ItemForm';
import LandingAnimation from './components/LandingAnimation'; // নতুন কম্পোনেন্ট import করা হয়েছে
import {
    auth,
    db,
    signInUser,
    onAuthStateChanged,
    onSnapshot,
    getPortfolioQuery,
    IS_ADMIN_USER,
    signOutUser,
    signInWithEmail
} from './firebase/utils';
import { getAuth } from 'firebase/auth'; 

// AdminLoginModal component
const AdminLoginModal = ({ closeModal }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmail(email, password);
            closeModal();
        } catch (err) {
            console.error("Login failed:", err);
            setError("Login failed. Check email/password.");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[100]">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-red-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input
                            className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input
                            className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
                            type="submit"
                        >
                            Sign In
                        </button>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            type="button"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const App = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLanding, setShowLanding] = useState(true); // নতুন state
    const [view, setView] = useState('public');
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    useEffect(() => {
        if (!auth) {
            console.error("Firebase Auth is not initialized.");
            setLoading(false);
            return;
        }

        signInUser();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            if (user) {
                const permanentAdminUID = 'pwOSgNHvG9Yl8NBM28A66O7ONTP2';
                const isPermanentAdmin = user.uid === permanentAdminUID;
                const grantAdminAccess = IS_ADMIN_USER || isLocalDev || isPermanentAdmin;
                
                setIsAdmin(grantAdminAccess);
                setIsAuthReady(true);
            } else {
                setIsAdmin(false);
                setIsAuthReady(true);
            }
            // Landing animation শেষ না হওয়া পর্যন্ত Loading false হবে না
            if (!showLanding) {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [showLanding]);

    useEffect(() => {
        if (!db || !isAuthReady) return;

        const q = getPortfolioQuery();

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItems(fetchedItems);
        }, (error) => {
            console.error("Error fetching portfolio items.", error);
        });

        return () => unsubscribe();
    }, [isAuthReady]);

    // Landing animation শেষ হলে main content দেখাবে
    if (showLanding) {
        return <LandingAnimation onAnimationComplete={() => {
            setShowLanding(false);
            setLoading(false);
        }} />;
    }

    if (loading && !isAuthReady) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Loading Application...
                </div>
            </div>
        );
    }

    let content;
    const currentAuth = getAuth();
    const isLoggedIn = currentAuth.currentUser && !currentAuth.currentUser.isAnonymous;

    if (view === 'admin' && isAdmin) {
        content = editingItem !== null 
            ? <ItemForm initialData={editingItem} setEditingItem={setEditingItem} /> 
            : <div className="pt-8 sm:pt-4"><AdminPanel items={items} setView={setView} setEditingItem={setEditingItem} /></div>;
    } else if (view === 'admin' && !isAdmin) {
        content = (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-gray-400 mb-8">You must be logged in as an administrator to view this panel.</p>
                <button
                    onClick={() => setView('public')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Go to Public Portfolio
                </button>
            </div>
        );
    } else {
        content = (
            <PublicPortfolio 
                items={items} 
                setView={setView} 
                isAdmin={isAdmin}
                setLoginModalOpen={setLoginModalOpen}
                isLoggedIn={isLoggedIn}
                signOutUser={signOutUser}
            />
        );
    }

    return (
        <>
            {loginModalOpen && <AdminLoginModal closeModal={() => setLoginModalOpen(false)} />}
            {content}
        </>
    );
};

export default App;

