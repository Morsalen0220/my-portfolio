import React, { useState, useEffect } from 'react';
import VideoEmbed from '../components/VideoEmbed';
import { getSectionsQuery, onSnapshot } from '../firebase/utils';

const PublicPortfolio = ({ items, setView, isAdmin, setLoginModalOpen, isLoggedIn, signOutUser }) => {
    const [sections, setSections] = useState([]);

    // Fetch sections from Firestore
    useEffect(() => {
        const q = getSectionsQuery();
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSections = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setSections(fetchedSections);
        });
        return () => unsubscribe();
    }, []);

    // Group portfolio items by sectionId
    const itemsBySection = sections.map(section => ({
        ...section,
        items: items.filter(item => item.sectionId === section.id)
                      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    }));

    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const sectionIds = ['hero', ...sections.map(s => `work-${s.id}`), 'contact'];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
        );

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.unobserve(el);
        });
    }, [sections]);

    const getNavLinkClass = (section) => {
        const baseClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95";
        const isActive = activeSection === section || (activeSection.startsWith('work-') && section === 'work');
        if (isActive) {
            return `${baseClass} bg-violet-600 text-white shadow-lg`;
        }
        return `${baseClass} text-gray-300 hover:bg-white/10 hover:text-white`;
    };

    const navLinks = [
        { id: 'hero', label: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg> },
        { id: 'work', label: 'Work', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg> },
        { id: 'contact', label: 'Contact', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg> },
    ];

    return (
        <div className="editor-bg text-white min-h-screen">
            <style>
                {`
                .editor-bg {
                    background-color: #111827; /* Darker blue-gray */
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .timeline-scrollbar::-webkit-scrollbar { height: 4px; }
                .timeline-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 4px; }
                .timeline-scrollbar::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 4px; }

                /* Cinematic Hero Animation Style */
                .film-grain {
                    position: absolute; inset: 0;
                    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiGAAABNVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8ELN9iAAAAZnRSTlMAAQECAgIDAwMEBAQFBQUGBgcHBwgICAkJCgoLCwwMDA0NDg4ODxAQEBERERISEhMUFBQVFhcXFxgYGBkZGRobGxscHR0eHh8gISIiJCQkJiYnKCkप्रकाश,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC/SURBVFhH7daxDYAwDAXQoDswAScwCiMwAmPQFmxABuxAJ7I/slClvQ/fD27+vU8CgBwFzI0JAgBBQIAQECB8VggBAQFCQIAQECBE/h4QECBEhAkBAQFCIEREgBAQECgEWggBAQFCIEREgBAQECgEWggBAQFCIEREgBAQECgEWggBAQFCIEREgBAQECgEWggBAQFCIEREgBAQECgEWggBAQFCIEREgBAQECgEWggBAQFCIEREgBAQECgEWggBAQFCIEREgBAQECgEWggBAQFCIEREgBAQEAh+wz43sAIAgFwLAgB88Q1eJqf9SAAAAABJRU5ErkJggg==');
                    opacity: 0.05; animation: grain 8s steps(10) infinite; pointer-events: none;
                }
                @keyframes grain {
                  0%, 100% { transform: translate(0, 0); } 10% { transform: translate(-5%, -10%); } 20% { transform: translate(-15%, 5%); }
                  30% { transform: translate(7%, -25%); } 40% { transform: translate(-5%, 25%); } 50% { transform: translate(-15%, 10%); }
                  60% { transform: translate(15%, 0%); } 70% { transform: translate(0%, 15%); } 80% { transform: translate(3%, 35%); }
                  90% { transform: translate(-10%, 10%); }
                }
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
                    50% { transform: translateY(-20px) rotate(5deg); opacity: 0.5; }
                    100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
                }
                .hero-icon { position: absolute; color: #fff; animation: float 8s ease-in-out infinite; }
                @keyframes film-strip-anim { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
                .film-strip {
                    position: absolute; width: 60px; height: 200%; top: -50%;
                    background: 
                        linear-gradient(to bottom, transparent 5%, #000 5%, #000 95%, transparent 95%),
                        repeating-linear-gradient(to bottom, #333, #333 18%, transparent 18%, transparent 20%);
                    background-size: 100% 20%, 100% 20%; opacity: 0.1;
                    animation: film-strip-anim 20s linear infinite;
                }
                .cinematic-text { text-shadow: 0 0 8px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.2); }
                `}
            </style>
            {/* Navbar */}
            <nav className="fixed bottom-4 md:top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/10 rounded-full p-2 shadow-2xl">
                    {navLinks.map(link => (
                        <a key={link.id} href={link.id === 'work' && sections.length > 0 ? `#work-${sections[0].id}` : `#${link.id}`} className={getNavLinkClass(link.id)}>
                            {link.icon}
                            <span className={getNavLinkClass(link.id).includes('bg-violet-600') ? 'inline' : 'hidden md:inline'}>{link.label}</span>
                        </a>
                    ))}
                    {isAdmin && ( <button onClick={() => setView('admin')} className={`${getNavLinkClass('admin')} bg-red-600/50 hover:bg-red-600/80`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.5,2.5h-15C1.125,2.5,0,3.625,0,5v10c0,1.375,1.125,2.5,2.5,2.5h15c1.375,0,2.5-1.125,2.5-2.5V5C20,3.625,18.875,2.5,17.5,2.5z M10,12.5c-1.375,0-2.5-1.125-2.5-2.5S8.625,7.5,10,7.5s2.5,1.125,2.5,2.5S11.375,12.5,10,12.5z"/></svg> <span className="hidden md:inline">Admin</span></button> )}
                    {isLoggedIn ? ( <button onClick={signOutUser} className={`${getNavLinkClass('logout')} bg-gray-600/50 hover:bg-gray-600/80`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg> <span className="hidden md:inline">Sign Out</span></button> ) : ( <button onClick={() => setLoginModalOpen(true)} className={`${getNavLinkClass('login')} bg-blue-600/50 hover:bg-blue-600/80`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> <span className="hidden md:inline">Login</span></button> )}
                </div>
            </nav>

            {/* Cinematic Hero Section - Mobile Height Adjusted */}
            <section id="hero" className="relative min-h-[70vh] md:min-h-screen flex flex-col justify-center items-center text-center p-4 overflow-hidden">
                <div className="absolute inset-0 bg-black"></div> {/* Solid black background */}
                <div className="film-grain"></div>
                <div className="film-strip" style={{left: '10%'}}></div>
                <div className="film-strip" style={{right: '10%', animationDelay: '-10s'}}></div>
                
                <svg className="hero-icon w-12 h-12 md:w-16 md:h-16" style={{ top: '20%', left: '15%' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
                <svg className="hero-icon w-16 h-16 md:w-20 md:h-20" style={{ top: '50%', right: '10%', animationDelay: '-2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                <svg className="hero-icon w-10 h-10 md:w-12 md:h-12" style={{ bottom: '15%', left: '25%', animationDelay: '-5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>

                <div className="relative z-10 w-full max-w-5xl mx-auto animate-fade-in-down">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight cinematic-text">[YOUR NAME]</h1>
                    <p className="text-gray-400 text-sm md:text-base mt-2 tracking-widest uppercase">Video Editor & Filmmaker</p>
                    <div className="mt-8">
                        <a href={sections.length > 0 ? `#work-${sections[0].id}` : '#contact'} className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition duration-300 transform hover:scale-105 smart-shadow">View My Work</a>
                    </div>
                </div>
            </section>
            
            <div id="work"></div>
            {/* Work Sections with Timeline Design */}
            {itemsBySection.map(section => (
                section.items.length > 0 && (
                    <React.Fragment key={section.id}>
                        <div className="max-w-6xl mx-auto border-t border-gray-800"></div>
                        <section id={`work-${section.id}`} className="py-16 md:py-24 overflow-hidden">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex flex-col items-center mb-12">
                                    <div className="w-24 h-px bg-red-500/40 mb-4"></div>
                                    <h2 className="text-3xl font-light text-center uppercase tracking-[0.2em] text-gray-300">{section.name}</h2>
                                </div>
                                <div className="relative py-4">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700/30 -translate-y-1/2"></div>
                                    <div className="flex items-center space-x-4 md:space-x-8 overflow-x-auto pb-8 timeline-scrollbar">
                                        <div className="flex-shrink-0 pl-4">
                                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                                        </div>
                                        {section.items.map((item, index) => (
                                            <React.Fragment key={item.id}>
                                                <div className="flex-shrink-0 w-64 md:w-80 p-1 bg-gray-700 border-t-2 border-b-2 border-gray-600 rounded-sm smart-shadow transition-transform duration-300 hover:-translate-y-2">
                                                    <div className="aspect-video">
                                                        <VideoEmbed item={item} />
                                                    </div>
                                                </div>
                                                {index < section.items.length - 1 && (
                                                    <div className="flex-shrink-0 text-gray-600 hover:text-red-500 transition-colors">
                                                        <svg className="w-8 h-8 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4"></path></svg>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        <div className="flex-shrink-0 pr-4">
                                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </React.Fragment>
                )
            ))}

            {/* Divider */}
            <div className="max-w-6xl mx-auto border-t border-gray-800"></div>

            {/* Contact Section */}
            <section id="contact" className="py-16 md:py-24">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-px bg-red-500/40 mb-4"></div>
                        <h2 className="text-3xl font-light text-center uppercase tracking-[0.2em] text-gray-300">Let's Create Together</h2>
                    </div>
                    <p className="text-gray-400 text-lg mb-8">Ready to bring your vision to life? I'm available for freelance projects.</p>
                    <a href="mailto:your.email@example.com" className="inline-block text-xl font-medium text-white bg-red-600 px-10 py-4 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 smart-shadow">your.email@example.com</a>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-12 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} [Your Name] Films. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicPortfolio;

