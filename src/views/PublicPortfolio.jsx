import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { getSectionsQuery, onSnapshot, getSiteSettings, getCollectionQuery } from '../firebase/utils';

// --- Helper Components & Icons ---
const iconComponents = {
    FilmIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>,
    UsersIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    VideoIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
    SparklesIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/></svg>,
    MicIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
    PlayIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    DownloadIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    MailIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
    XIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
};

const DynamicIcon = ({ name, className }) => {
    const IconComponent = iconComponents[name];
    return IconComponent ? <IconComponent className={className} /> : null;
};

// --- নতুন ডিজাইন করা AnimatedCounter কম্পোনেন্ট ---
const AnimatedCounter = ({ value, label, icon }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const numericValue = parseInt(String(value).replace(/\D/g, ''), 10) || 0;
    const suffix = String(value).replace(/[0-9]/g, '');

    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        if (isInView) {
            const animation = animate(count, numericValue, {
                duration: 2,
                ease: "easeOut",
            });
            return () => animation.stop();
        }
    }, [isInView, count, numericValue]);

    return (
        <motion.div 
            ref={ref} 
            className="text-center space-y-3 flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
        >
            <div className="p-4 bg-violet-900/40 rounded-full border border-violet-500/30">
                <DynamicIcon name={icon} className="w-8 h-8 text-violet-400" />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white">
                <motion.span>{rounded}</motion.span>
                {suffix}
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
        </motion.div>
    );
};


const Card = ({ children, className, ...props }) => ( <div className={`overflow-hidden bg-gray-800/50 border-gray-700 hover:border-violet-500 transition-all duration-500 cursor-pointer animate-fade-in-up hover:shadow-2xl hover:shadow-violet-500/10 rounded-lg ${className}`} {...props}> {children} </div> );
const Button = ({ children, variant, size, className, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
    const sizeClasses = size === 'lg' ? 'h-12 px-8 text-base' : 'h-10 px-4';
    const variantClasses = variant === 'outline' ? "border border-input bg-transparent" : "bg-violet-600 text-white hover:bg-violet-700";
    return <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>{children}</button>;
};

const ContactForm = () => {
    const [formStatus, setFormStatus] = useState({ status: 'idle', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        setFormStatus({ status: 'loading', message: 'Sending...' });
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                setFormStatus({ status: 'success', message: 'Message sent successfully! Thank you.' });
                form.reset();
            } else {
                setFormStatus({ status: 'error', message: 'Oops! There was a problem submitting your form.' });
            }
        } catch (error) {
            setFormStatus({ status: 'error', message: 'Oops! There was a problem submitting your form.' });
        }
    };

    return (
        <form action="https://formspree.io/f/xyznbnre" method="POST" onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                <input name="name" type="text" required placeholder="Your name" className="w-full bg-gray-700 h-12 text-base rounded-md px-4 border border-gray-600 focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
                <input name="email" type="email" required placeholder="your@email.com" className="w-full bg-gray-700 h-12 text-base rounded-md px-4 border border-gray-600 focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Message</label>
                <textarea name="message" required placeholder="Tell me about your project..." rows={5} className="w-full bg-gray-700 text-base rounded-md p-4 border border-gray-600 resize-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <Button size="lg" type="submit" className="w-full font-semibold !bg-red-600 hover:!bg-red-700" disabled={formStatus.status === 'loading'}>
                {formStatus.status === 'loading' ? 'Sending...' : 'Send Message'}
            </Button>
            {formStatus.status !== 'idle' && (
                <p className={`text-center text-sm mt-4 ${formStatus.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {formStatus.message}
                </p>
            )}
        </form>
    );
};

const ContactFormModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><DynamicIcon name="XIcon"/></button>
                    <h3 className="text-2xl font-bold mb-6 text-center text-red-500">Get in Touch</h3>
                    <ContactForm />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// --- PublicPortfolio মূল কম্পোনেন্ট ---
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

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getSiteSettings();
            setSiteSettings(settings);
        };
        fetchSettings();

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

    useEffect(() => {
        const sectionIds = ['hero', 'work', 'services', 'skills', 'contact'];
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

    const navLinks = [
        { id: 'hero', label: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg> },
        { id: 'work', label: 'Work', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg> },
        { id: 'services', label: 'Services', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 8a4 4 0 118 0 4 4 0 01-8 0zM4 12a4 4 0 118 0 4 4 0 01-8 0zM4 16a4 4 0 118 0 4 4 0 01-8 0z" /></svg> },
        { id: 'skills', label: 'Skills', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.86 5.89a1 1 0 00.95.95l2.72.65c1.56.38 1.56 2.6 0 2.98l-2.72.65a1 1 0 00-.95.95l-.65 2.72c-.38 1.56 1.04 2.98 2.6 2.6l2.72-.65a1 1 0 00.95-.95l.65-2.72c.38-1.56-1.04-2.98-2.6-2.6l-2.72.65a1 1 0 00-.95.95l-.65 2.72c-.38 1.56 1.04 2.98 2.6 2.6l2.72-.65a1 1 0 00.95-.95l.65-2.72c.38-1.56-1.04-2.98-2.6-2.6zM5.49 9.17c-.38-1.56-2.6-1.56-2.98 0L1.86 11.89a1 1 0 00.95.95l2.72.65c1.56.38 1.56 2.6 0 2.98l-2.72.65a1 1 0 00-.95.95l-.65 2.72c-.38 1.56 1.04 2.98 2.6 2.6l2.72-.65a1 1 0 00.95-.95l.65-2.72c.38-1.56-1.04-2.98-2.6-2.6L2.81 13.8a1 1 0 00-.95-.95l-.65-2.72z" clipRule="evenodd"/></svg>},
        { id: 'contact', label: 'Contact', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg> },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 dark">
            <style>{` :root { --primary: oklch(0.7 0.25 270); --accent: oklch(0.65 0.22 35); } .dark { background-color: #111827; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } @keyframes pulseSlow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } } .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; } .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; } .animate-gradient { background-size: 200% 200%; animation: gradient 15s ease infinite; } .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; } html { scroll-behavior: smooth; } `}</style>

            <nav className="fixed bottom-4 md:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/10 rounded-full p-2 shadow-2xl pointer-events-auto">
                    {navLinks.map(link => ( <a key={link.id} href={`#${link.id}`} className={getNavLinkClass(link.id)}> {link.icon} <span className={getNavLinkClass(link.id).includes('bg-violet-600') ? 'inline' : 'hidden md:inline'}>{link.label}</span> </a> ))}
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

                <section className="py-16 px-6 bg-gray-900 border-y border-gray-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-row flex-wrap items-start justify-center gap-12 md:gap-16">
                            {stats.map((stat, index) => (
                                <AnimatedCounter
                                    key={index}
                                    value={stat.value}
                                    label={stat.label}
                                    icon={stat.icon}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="work" className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12 text-center"><h3 className="text-4xl md:text-5xl font-bold mb-4">Featured Work</h3><p className="text-gray-400 text-lg max-w-2xl mx-auto">A selection of recent projects showcasing diverse editing styles.</p></div>
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                             <button onClick={() => setActiveFilter('all')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${ activeFilter === 'all' ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700" }`}> All </button>
                            {sections.map((section) => ( <button key={section.id} onClick={() => setActiveFilter(section.id)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${ activeFilter === section.id ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700" }`}>{section.name}</button> ))}
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredItems.map((item, index) => (
                                <Card key={item.id} onClick={() => setSelectedVideo(item)} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="relative aspect-video overflow-hidden">
                                        {item.thumbnailUrl ? (
                                            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                                        <div className="flex flex-wrap gap-2 pt-2">{item.tools && item.tools.split(',').map((tool, tagIndex) => ( <span key={tagIndex} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">{tool.trim()}</span> ))}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>
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
                                <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
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
                                <div className="space-y-4 pt-4">{skills.map((skill, index) => ( <div key={index} className="space-y-2 group"> <div className="flex justify-between text-sm"> <span className="font-medium group-hover:text-violet-400 transition-colors">{skill.name}</span> <span className="text-gray-500 font-mono">{skill.level}%</span> </div> <div className="h-2 bg-gray-700 rounded-full overflow-hidden"> <div className="h-full bg-gradient-to-r from-violet-500 to-red-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${skill.level}%` }} /> </div> </div> ))}</div>
                            </div>
                            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <Card className="p-8 bg-gray-800 border-gray-700"><h4 className="text-2xl font-bold mb-6">Service List</h4><ul className="space-y-4">{serviceList.map((service, index) => ( <li key={index} className="flex items-center gap-3 text-gray-400 group hover:text-white transition-colors"> <div className="w-1.5 h-1.5 bg-violet-500 rounded-full group-hover:scale-150 transition-transform" /> {service.name} </li> ))}</ul></Card>
                            </div>
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