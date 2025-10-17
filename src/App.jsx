// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicPortfolio from './views/PublicPortfolio';
import AdminPage from './views/AdminPage';
import LandingAnimation from './components/LandingAnimation';
import { 
    auth, 
    onAuthStateChanged, 
    onSnapshot, 
    getPortfolioQuery, 
    getSectionsQuery,
    getCollectionQuery,
    getSiteSettings,
    IS_ADMIN_USER 
} from './firebase/utils';

const App = () => {
    const [items, setItems] = useState([]);
    const [sections, setSections] = useState([]);
    const [siteSettings, setSiteSettings] = useState({});
    const [stats, setStats] = useState([]);
    const [skills, setSkills] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [serviceList, setServiceList] = useState([]);

    const [showLanding, setShowLanding] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                const permanentAdminUID = 'pwOSgNHvG9Yl8NBM28A66O7ONTP2'; // আপনার অ্যাডমিন UID
                setIsAdmin(user.uid === permanentAdminUID || IS_ADMIN_USER);
            } else {
                setIsAdmin(false);
            }
        });

        const fetchAllData = async () => {
            const settings = await getSiteSettings();
            setSiteSettings(settings);
        };
        fetchAllData();

        const unsubs = [
            onSnapshot(getPortfolioQuery(), (snapshot) => setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(getSectionsQuery(), (snapshot) => setSections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(getCollectionQuery('stats'), (snapshot) => setStats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(getCollectionQuery('skills'), (snapshot) => setSkills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.level - a.level))),
            onSnapshot(getCollectionQuery('services'), (snapshot) => setServicesData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(getCollectionQuery('service_list'), (snapshot) => setServiceList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
        ];

        return () => {
            unsubscribeAuth();
            unsubs.forEach(unsub => unsub());
        };
    }, []);

    if (showLanding) {
        return <LandingAnimation onAnimationComplete={() => setShowLanding(false)} />;
    }

    return (
        <Routes>
            <Route 
                path="/" 
                element={
                    <PublicPortfolio 
                        items={items}
                        sections={sections}
                        siteSettings={siteSettings}
                        stats={stats}
                        skills={skills}
                        servicesData={servicesData}
                        serviceList={serviceList}
                    />
                } 
            />
            <Route 
                path="/admin" 
                element={
                    <AdminPage 
                        isAdmin={isAdmin} 
                        items={items}
                        sections={sections}
                        editingItem={editingItem}
                        setEditingItem={setEditingItem}
                    />
                } 
            />
        </Routes>
    );
};

export default App;