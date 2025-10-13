import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // React Router থেকে import করুন

import PublicPortfolio from './views/PublicPortfolio';
import AdminPage from './views/AdminPage'; // নতুন AdminPage import করুন
import ItemForm from './components/ItemForm';
import LandingAnimation from './components/LandingAnimation';
import { 
    auth, 
    db, 
    onAuthStateChanged, 
    onSnapshot, 
    getPortfolioQuery, 
    IS_ADMIN_USER, 
    signOutUser 
} from './firebase/utils';

const App = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLanding, setShowLanding] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // ItemForm দেখানোর জন্য এই state টি থাকবে

    // Authentication এবং User state পর্যবেক্ষণের জন্য
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                // এখানে আপনার অ্যাডমিন ব্যবহারকারীর UID দিয়ে দিন
                const permanentAdminUID = 'pwOSgNHvG9Yl8NBM28A66O7ONTP2';
                const isPermanentAdmin = user.uid === permanentAdminUID;
                setIsAdmin(IS_ADMIN_USER || isPermanentAdmin);
            } else {
                setIsAdmin(false);
            }
            setIsAuthReady(true);
            
            if (!showLanding) {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [showLanding]);

    // Firestore থেকে ডেটা লোড করার জন্য
    useEffect(() => {
        if (!db) return;

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
    }, []);

    // Landing animation শেষ হলে main content দেখাবে
    if (showLanding) {
        return <LandingAnimation onAnimationComplete={() => {
            setShowLanding(false);
            setLoading(false); // Animation শেষ হলে লোডিং বন্ধ হবে
        }} />;
    }

    // Auth state রেডি না হওয়া পর্যন্ত লোডিং স্ক্রিন দেখাবে
    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading Application...</div>
            </div>
        );
    }

    // React Router দিয়ে পেজ রেন্ডারিং
    return (
        <Routes>
            {/* Public Portfolio Route */}
            <Route 
                path="/" 
                element={<PublicPortfolio items={items} />} 
            />

            {/* Admin Route */}
            <Route 
                path="/admin" 
                element={
                    <AdminPage 
                        isAdmin={isAdmin} 
                        items={items}
                        editingItem={editingItem}
                        setEditingItem={setEditingItem}
                    />
                } 
            />
        </Routes>
    );
};

export default App;
