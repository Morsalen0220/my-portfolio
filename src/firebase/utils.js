import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    addDoc,
    serverTimestamp,
    getDoc
} from "firebase/firestore";

// --- START Local Development Configuration ---
const LOCAL_DEV_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBS2NC2rkH6stMH4DEUdT105yUNKqTTRss",
  authDomain: "first-project-a3e5c.firebaseapp.com",
  projectId: "first-project-a3e5c",
  storageBucket: "first-project-a3e5c.appspot.com",
  messagingSenderId: "40010184893",
  appId: "1:40010184893:web:ab151405bcb065b8badfd4",
  measurementId: "G-2PWV3BQ0C0"
};
// --- END Local Development Configuration ---


const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : LOCAL_DEV_FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

const IS_ADMIN_USER = typeof __is_admin_user !== 'undefined' ? __is_admin_user : false;

// --- Authentication Functions ---

export const signInUser = async () => {
    try {
        if (!auth.currentUser) {
            const authToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (authToken) {
                await signInWithCustomToken(auth, authToken);
            } else {
                await signInAnonymously(auth);
            }
        }
    } catch (error) {
        console.error("Error signing in to Firebase:", error);
    }
};

export const signInWithEmail = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
    try {
        await signOut(auth);
        await signInAnonymously(auth);
    } catch (error)
        {
        console.error("Error signing out:", error);
    }
};

// --- Firestore References ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'local-dev-app-id';

// --- Firestore Functions ---

// Generic function to get a collection query
export const getCollectionQuery = (collectionName) => {
    return query(collection(db, 'artifacts', appId, 'public', 'data', collectionName));
};

// Generic function to save an item to a collection
export const saveCollectionItem = async (collectionName, itemData) => {
    try {
        const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        const docRef = itemData.id ? doc(collectionRef, itemData.id) : doc(collectionRef);

        const dataToSave = { ...itemData, updatedAt: serverTimestamp() };
        if (!itemData.id) {
            dataToSave.createdAt = serverTimestamp();
        }

        await setDoc(docRef, dataToSave, { merge: true });
    } catch (error) {
        console.error(`Error saving item to ${collectionName}:`, error);
        throw error;
    }
};

// Generic function to delete an item from a collection
export const deleteCollectionItem = async (collectionName, itemId) => {
    try {
        // FIX: Firebase Error theke bachanor jonyo itemId check kora holo
        if (!itemId) {
            console.warn(`Attempted to delete item from ${collectionName} without an ID. Operation aborted.`);
            throw new Error("Cannot delete item: ID is missing.");
        }
        const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        await deleteDoc(doc(collectionRef, itemId));
    } catch (error) {
        console.error(`Error deleting item from ${collectionName}:`, error);
        throw error;
    }
};

// Site Settings Functions
const siteSettingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'config');

export const getSiteSettings = async () => {
    try {
        const docSnap = await getDoc(siteSettingsRef);
        return docSnap.exists() ? docSnap.data() : {};
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return {};
    }
};

export const saveSiteSettings = async (settingsData) => {
    try {
        await setDoc(siteSettingsRef, settingsData, { merge: true });
    } catch (error) {
        console.error("Error saving site settings:", error);
        throw error;
    }
};


// Specific functions for existing collections (Portfolio items are named 'portfolio_items' for data consistency)
export const getPortfolioQuery = () => getCollectionQuery('portfolio_items');
export const savePortfolioItem = (itemData) => saveCollectionItem('portfolio_items', itemData);
export const deletePortfolioItem = (itemId) => deleteCollectionItem('portfolio_items', itemId);

export const getSectionsQuery = () => getCollectionQuery('sections');
export const saveSection = async (sectionName) => {
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sections'), {
            name: sectionName,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving section:", error);
        throw error;
    }
};


export {
    auth,
    db,
    onAuthStateChanged,
    onSnapshot,
    collection,
    query,
    doc,
    IS_ADMIN_USER,
    serverTimestamp,
};