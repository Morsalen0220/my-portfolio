import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence // নতুন import
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
    serverTimestamp
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

// --- লগইন অবস্থা সেভ করার জন্য নতুন কোড ---
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

const IS_ADMIN_USER = typeof __is_admin_user !== 'undefined' ? __is_admin_user : false;

// --- Authentication Functions ---

export const signInUser = async () => {
    try {
        // onAuthStateChanged এখন সেভ করা ইউজারকে খুঁজে নেবে, তাই এখানে কিছু করার দরকার নেই
        // শুধু প্রথমবার অ্যানোনিমাস ইউজার হিসেবে সাইন ইন করানোর জন্য এই ব্যবস্থা
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

// --- Firestore Functions ---

const appId = typeof __app_id !== 'undefined' ? __app_id : 'local-dev-app-id';
const portfolioCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'portfolio_items');
const sectionsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'sections');

// Portfolio Items
export const getPortfolioQuery = () => {
    return query(portfolioCollectionRef);
};

export const savePortfolioItem = async (itemData) => {
    try {
        const docRef = itemData.id 
            ? doc(portfolioCollectionRef, itemData.id)
            : doc(portfolioCollectionRef);
        
        const dataToSave = { ...itemData, updatedAt: serverTimestamp() };
        if (!itemData.id) {
            dataToSave.createdAt = serverTimestamp();
        }

        await setDoc(docRef, dataToSave, { merge: true });
    } catch (error) {
        console.error("Error saving portfolio item:", error);
        throw error;
    }
};

export const deletePortfolioItem = async (itemId) => {
    try {
        await deleteDoc(doc(portfolioCollectionRef, itemId));
    } catch (error) {
        console.error("Error deleting portfolio item:", error);
        throw error;
    }
};

// Sections
export const getSectionsQuery = () => {
    return query(sectionsCollectionRef);
};

export const saveSection = async (sectionName) => {
    try {
        await addDoc(sectionsCollectionRef, { 
            name: sectionName,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving section:", error);
        throw error;
    }
};


// Export necessary Firebase services and functions
const contactMessagesCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'contact_messages');

export const saveContactMessage = async (messageData) => {
    try {
        await addDoc(contactMessagesCollectionRef, {
            ...messageData,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving contact message:", error);
        throw error; // Re-throw the error to be caught by the form handler
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

