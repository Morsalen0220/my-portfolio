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
    // Shob data ekhon ek jaygay state hishebe thakbe
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
        // --- Authentication Check ---
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                const permanentAdminUID = 'pwOSgNHvG9Yl8NBM28A66O7ONTP2';
                setIsAdmin(user.uid === permanentAdminUID || IS_ADMIN_USER);
            } else {
                setIsAdmin(false);
            }
        });

        // --- Shob Data Ek Shonge Fetch Kora ---
        const fetchAllData = async () => {
            const settings = await getSiteSettings();
            setSiteSettings(settings);
        };
        fetchAllData();

        const portfolioUnsub = onSnapshot(getPortfolioQuery(), (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const sectionsUnsub = onSnapshot(getSectionsQuery(), (snapshot) => {
            setSections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const statsUnsub = onSnapshot(getCollectionQuery('stats'), (snapshot) => {
            setStats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const skillsUnsub = onSnapshot(getCollectionQuery('skills'), (snapshot) => {
            setSkills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.level - a.level));
        });
        const servicesUnsub = onSnapshot(getCollectionQuery('services'), (snapshot) => {
            setServicesData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const serviceListUnsub = onSnapshot(getCollectionQuery('service_list'), (snapshot) => {
            setServiceList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Cleanup function
        return () => {
            unsubscribeAuth();
            portfolioUnsub();
            sectionsUnsub();
            statsUnsub();
            skillsUnsub();
            servicesUnsub();
            serviceListUnsub();
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
                        sections={sections} // Pass sections to AdminPage as well
                        editingItem={editingItem}
                        setEditingItem={setEditingItem}
                    />
                } 
            />
        </Routes>
    );
};

export default App;