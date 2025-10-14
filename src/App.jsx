import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import PublicPortfolio from './views/PublicPortfolio';
import AdminPage from './views/AdminPage';
import LandingAnimation from './components/LandingAnimation';
import { 
    auth, 
    db, 
    onAuthStateChanged, 
    onSnapshot, 
    getPortfolioQuery, 
    IS_ADMIN_USER
} from './firebase/utils';

const App = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLanding, setShowLanding] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
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

    if (showLanding) {
        return <LandingAnimation onAnimationComplete={() => {
            setShowLanding(false);
            setLoading(false);
        }} />;
    }

    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading Application...</div>
            </div>
        );
    }

    return (
        <Routes>
            <Route 
                path="/" 
                element={<PublicPortfolio items={items} />} 
            />
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