import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import VideoPlayerModal from '../components/VideoPlayerModal';
import VideoEmbed from '../components/VideoEmbed';
import { getSectionsQuery, onSnapshot, getSiteSettings, getCollectionQuery } from '../firebase/utils';
import { 
    DynamicIcon, 
    AnimatedCounter, 
    Card, 
    Button, 
    ContactForm, 
    ContactFormModal,
    SocialLinksSection,
} from '../components/PortfolioHelpers'; 

// --- Sub-Component: Pagination ---
const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) return null; // Don't show pagination if only one page

    return (
        <nav className="mt-12 flex justify-center">
            <ul className="flex items-center gap-2">
                {pageNumbers.map(number => (
                    <li key={number}>
                        <button
                            onClick={() => paginate(number)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                currentPage === number
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};


// --- PublicPortfolio Main Component ---
const PublicPortfolio = ({ items }) => {
    const [sections, setSections] = useState([]);
    const [activeSection, setActiveSection] = useState('hero');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isContactFormOpen, setContactFormOpen] = useState(false);

    const [siteSettings, setSiteSettings] = useState({});
    const [stats, setStats] = useState([]);
    const [skills, setSkills] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [serviceList, setServiceList] = useState([]);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6); // Default for desktop

    // Effect for responsive items per page
    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 768 ? 5 : 6); // 5 for mobile, 6 for desktop
        };
        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Effect to reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getSiteSettings();
            setSiteSettings(settings);
        };
        fetchSettings();

        // Data fetches...
        const statsQuery = getCollectionQuery('stats');
        const unsubscribeStats = onSnapshot(statsQuery, (snapshot) => {
            const fetchedStats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStats(fetchedStats);
        });

        const skillsQuery = getCollectionQuery('skills');
        const unsubscribeSkills = onSnapshot(skillsQuery, (snapshot) => {
            const fetchedSkills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.level - a.level);
            setSkills(fetchedSkills);
        });

        const servicesQuery = getCollectionQuery('services');
        const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
            const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setServicesData(fetchedServices);
        });

        const serviceListQuery = getCollectionQuery('service_list');
        const unsubscribeServiceList = onSnapshot(serviceListQuery, (snapshot) => {
            const fetchedList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setServiceList(fetchedList);
        });

        const q = getSectionsQuery();
        const unsubscribeSections = onSnapshot(q, (snapshot) => {
            // Data is sorted by creation time from Firebase util.
            const fetchedSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setSections(fetchedSections);
        });

        return () => {
            unsubscribeStats();
            unsubscribeSkills();
            unsubscribeServices();
            unsubscribeServiceList();
            unsubscribeSections();
        };
    }, []);

    const filteredItems = activeFilter === 'all' ? items : items.filter(item => item.sectionId === activeFilter);
    
    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = pageNumber => setCurrentPage(pageNumber);


    useEffect(() => {
        const sectionIds = ['hero', 'work', 'services', 'skills', 'stats', 'contact', 'social-links'];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
        }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
        sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
        return () => sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.unobserve(el); });
    }, [sections]);

    const getNavLinkClass = (section) => {
        const baseClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95";
        const isActive = activeSection === section;
        if (isActive) return `${baseClass} bg-violet-600 text-white shadow-lg`;
        return `${baseClass} text-gray-300 hover:bg-white/10 hover:text-white`;
    };

    // FIX: Removed 'Stats' and 'Social' from the navigation links
    const navLinks = [
        { id: 'hero', label: 'Home', icon: <DynamicIcon name="CodeIcon" className="h-5 w-5"/> }, 
        { id: 'work', label: 'Work', icon: <DynamicIcon name="MonitorIcon" className="h-5 w-5"/> },
        { id: 'services', label: 'Services', icon: <DynamicIcon name="UsersIcon" className="h-5 w-5"/> },
        { id: 'skills', label: 'Skills', icon: <DynamicIcon name="SettingsIcon" className="h-5 w-5"/> },
        { id: 'contact', label: 'Contact', icon: <DynamicIcon name="MailIcon" className="h-5 w-5"/> },
    ];

    const filterOptions = [
        { id: 'all', name: 'All' },
        ...sections,
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 dark">
            <style>{` /* CSS Styles */ :root { --primary: oklch(0.7 0.25 270); --accent: oklch(0.65 0.22 35); } .dark { background-color: #111827; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { transform: translateY(0); } } @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } @keyframes pulseSlow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } } .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; } .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; } .animate-gradient { background-size: 200% 200%; animation: gradient 15s ease infinite; } .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; } html { scroll-behavior: smooth; } `}</style>

            <nav className="fixed bottom-2 md:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/10 rounded-full p-1.5 shadow-2xl pointer-events-auto">
                    {navLinks.map(link => ( 
                        <a key={link.id} href={`#${link.id}`} className={getNavLinkClass(link.id)}> 
                            {link.icon} 
                            <span className={getNavLinkClass(link.id).includes('bg-violet-600') ? 'inline' : 'hidden md:inline'}>{link.label}</span> 
                        </a> 
                    ))}
                </div>
            </nav>

            <main>
                <section id="hero" className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-red-500/5 animate-gradient" />
                    <div className="absolute top-20 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="inline-block px-4 py-2 bg-violet-600/10 text-violet-400 rounded-full text-sm font-mono backdrop-blur-sm border border-violet-600/20">{siteSettings.heroTagline || "Video Editor & Storyteller"}</div>
                                <h2 className="text-5xl md:text-7xl font-bold leading-tight text-balance" dangerouslySetInnerHTML={{ __html: siteSettings.heroTitle || 'Crafting Visual <span class="text-violet-500">Stories</span>' }}></h2>
                                <p className="text-xl text-gray-400 leading-relaxed text-pretty">{siteSettings.heroSubtitle || "I transform raw footage into compelling narratives that captivate audiences and elevate brands."}</p>
                                <div className="flex gap-4 pt-4">
                                    <a href="#work"><Button size="lg" className="gap-2 group"><DynamicIcon name="PlayIcon"/> View My Work</Button></a>
                                    <a href={siteSettings.resumeUrl || "/resume.pdf"} download><Button size="lg" variant="outline" className="gap-2 group bg-transparent border-gray-600 hover:bg-gray-800"><DynamicIcon name="DownloadIcon" className="group-hover:translate-y-0.5 transition-transform" /> Download Resume</Button></a>
                                </div>
                            </div>
                            <div className="relative animate-fade-in-up hidden md:block" style={{ animationDelay: "0.2s" }}>
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl relative group">
                                     <img src={siteSettings.heroImageUrl || "https://placehold.co/1280x720/111827/7c3aed?text=Showreel"} alt="Video editing workspace" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                         <div className="w-20 h-20 rounded-full bg-violet-600/90 flex items-center justify-center backdrop-blur-sm"><DynamicIcon name="PlayIcon" className="text-white ml-1 w-8 h-8"/></div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="work" className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12 text-center">
                            <h3 className="text-4xl md:text-5xl font-bold mb-4">Featured Work</h3>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">A selection of recent projects showcasing diverse editing styles.</p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {filterOptions.map((filter) => ( 
                                <button 
                                    key={filter.id} 
                                    onClick={() => setActiveFilter(filter.id)} 
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${ activeFilter === filter.id ? "bg-violet-600 text-white shadow-lg" : "bg-gray-800 text-gray-400 hover:bg-gray-700" }`}
                                >
                                    {filter.name}
                                </button> 
                            ))}
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentItems.map((item, index) => (
                                <Card key={item.id} onClick={() => setSelectedVideo(item)} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="relative aspect-video overflow-hidden">
                                        {item.thumbnailUrl ? (
                                            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : item.videoUrl ? (
                                            <VideoEmbed url={item.videoUrl} isModal={false} />
                                        ) : (
                                            <div className="w-full h-full bg-black flex items-center justify-center font-mono text-gray-500">{item.title}</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                            <div className="flex items-center gap-2 text-white">
                                                <div className="w-12 h-12 rounded-full bg-violet-600/90 flex items-center justify-center backdrop-blur-sm">
                                                    <DynamicIcon name="PlayIcon" className="ml-0.5" />
                                                </div>
                                                <span className="font-mono text-sm">{item.duration || '0:00'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <h4 className="text-xl font-bold group-hover:text-violet-400 transition-colors">{item.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{item.description || 'No description available.'}</p>
                                        <div className="flex flex-wrap gap-2 pt-2">{item.tools && item.tools.split(',').map((tool, tagIndex) => ( <span key={tool.trim() || tagIndex} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">{tool.trim()}</span> ))}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        
                        <Pagination
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredItems.length}
                            paginate={paginate}
                            currentPage={currentPage}
                        />
                    </div>
                </section>
                
                <section id="services" className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h3 className="text-4xl md:text-5xl font-bold mb-4">{siteSettings.servicesTitle || "What I Offer"}</h3>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{siteSettings.servicesSubtitle || "High-quality services to bring your vision to life."}</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {servicesData.map((service, index) => (
                                <motion.div key={service.id || index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                                    <div className="bg-gray-800/50 p-8 rounded-lg text-center h-full border border-gray-700 hover:border-violet-500 hover:bg-gray-800 transition-all duration-300">
                                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-violet-600/10 text-violet-400">
                                            <DynamicIcon name={service.icon} className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-2xl font-bold mb-3">{service.title}</h4>
                                        <p className="text-gray-400">{service.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="skills" className="py-20 px-6 bg-gray-800/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6 animate-fade-in-up">
                                <h3 className="text-4xl md:text-5xl font-bold">{siteSettings.skillsTitle || "Technical Expertise"}</h3>
                                <p className="text-gray-400 text-lg leading-relaxed">{siteSettings.skillsSubtitle || "Proficient in industry-standard tools and techniques, with a focus on storytelling, pacing, and visual aesthetics."}</p>
                                <div className="space-y-4 pt-4">
                                    {skills.map((skill, index) => ( <div key={skill.id || index} className="space-y-2 group"> <div className="flex justify-between text-sm"> <span className="font-medium group-hover:text-violet-400 transition-colors">{skill.name}</span> <span className="text-gray-500 font-mono">{skill.level}%</span> </div> <div className="h-2 bg-gray-700 rounded-full overflow-hidden"> <div className="h-full bg-gradient-to-r from-violet-500 to-red-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${skill.level}%` }} /> </div> </div> ))}
                                </div>
                            </div>
                            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <Card className="p-8 bg-gray-800 border-gray-700"><h4 className="text-2xl font-bold mb-6">Service List</h4>
                                    <ul className="space-y-4">
                                        {serviceList.map((service, index) => ( <li key={service.id || index} className="flex items-center gap-3 text-gray-400 group hover:text-white transition-colors"> <div className="w-1.5 h-1.5 bg-violet-500 rounded-full group-hover:scale-150 transition-transform" /> {service.name} </li> ))}
                                    </ul>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="stats" className="py-16 px-6 bg-gray-900 border-y border-gray-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-row flex-wrap items-start justify-evenly gap-12 md:gap-16">
                            {stats.map((stat, index) => (
                                <AnimatedCounter
                                    key={stat.id || index}
                                    value={stat.value}
                                    label={stat.label}
                                    icon={stat.icon}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="contact" className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12"><h2 className="text-4xl md:text-5xl font-bold text-balance">Let's Create Something <span className="text-violet-500">Amazing</span></h2><p className="text-xl text-gray-400 text-pretty mt-4">Available for freelance projects. Let's bring your vision to life.</p></div>
                        <div className="hidden md:block bg-gray-800/50 p-8 rounded-lg"><ContactForm /></div>
                        <div className="md:hidden text-center"><Button size="lg" className="gap-2 group !bg-red-600 hover:!bg-red-700" onClick={() => setContactFormOpen(true)}><DynamicIcon name="MailIcon"/> Get in Touch</Button></div>
                    </div>
                </section>
                
                <SocialLinksSection siteSettings={siteSettings} />

            </main>

            <footer className="py-8 px-6 border-t border-gray-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {siteSettings.footerName || "Morsalen Islam"}. All rights reserved.</p><p className="text-sm text-gray-500 font-mono">{siteSettings.footerTagline || "Crafted with passion for visual storytelling"}</p></div>
            </footer>
            
            <ContactFormModal isOpen={isContactFormOpen} onClose={() => setContactFormOpen(false)} />
            {selectedVideo && <VideoPlayerModal item={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </div>
    );
};

export default PublicPortfolio;