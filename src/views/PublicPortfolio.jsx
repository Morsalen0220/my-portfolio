import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoPlayerModal from '../components/VideoPlayerModal';
import VideoEmbed from '../components/VideoEmbed';
import {
    getSectionsQuery,
    onSnapshot,
    getSiteSettings,
    getCollectionQuery,
    saveCollectionItem
} from '../firebase/utils';
import {
    DynamicIcon,
    AnimatedCounter,
    Card,
    Button,
    ContactForm,
    ContactFormModal,
    SocialLinksSection,
} from '../components/PortfolioHelpers';

// --- Skeleton Card for Loading State ---
const SkeletonCard = () => (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-700" />
        <div className="p-6">
            <div className="h-5 bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-3 bg-gray-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-700 rounded w-5/6" />
        </div>
    </div>
);

// --- Sub-Component: Pagination ---
const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
        pageNumbers.push(i);
    }
    if (pageNumbers.length <= 1) return null;
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

// --- ReviewFormModal ---
const ReviewFormModal = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !review) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ name, company, review, rating });
            setName("");
            setCompany("");
            setReview("");
            setRating(5);
            onClose();
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
                    <h2 className="text-2xl font-bold text-white">Write a Review</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"><DynamicIcon name="XIcon" className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Your Rating *</label>
                        <div className="flex gap-2">{[1, 2, 3, 4, 5].map((star) => ( <button key={star} type="button" onClick={() => setRating(star)} className="transition-transform hover:scale-110 focus:outline-none"><DynamicIcon name="StarIcon" className={`w-8 h-8 ${star <= rating ? "text-yellow-400" : "text-gray-600"}`} /></button> ))}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Your name" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Company (Optional)</label>
                        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Your company name" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Your Review *</label>
                        <textarea value={review} onChange={(e) => setReview(e.target.value)} required rows={5} className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" placeholder="Share your experience..."/>
                    </div>
                    <div className="flex gap-3 justify-end pt-4"><Button type="button" onClick={onClose} variant="outline">Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Review"}</Button></div>
                </form>
            </motion.div>
        </div>
    );
};

// --- TestimonialsCarousel ---
const TestimonialsCarousel = ({ reviews }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    useEffect(() => {
        if (!isAutoPlay || reviews.length <= 1) return;
        const interval = setInterval(() => { setCurrentIndex((prev) => (prev + 1) % reviews.length); }, 3000);
        return () => clearInterval(interval);
    }, [isAutoPlay, reviews.length]);

    const goToPrevious = () => { setIsAutoPlay(false); setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1)); };
    const goToNext = () => { setIsAutoPlay(false); setCurrentIndex((prev) => (prev + 1) % reviews.length); };

    if (!reviews || reviews.length === 0) { return <div className="text-center text-gray-500 py-10">No reviews yet. Be the first to share your experience!</div>; }

    const currentTestimonial = reviews[currentIndex];

    return (
        <div className="w-full">
            <div className="relative bg-gray-800/50 rounded-xl border border-gray-700 p-8 md:p-12 mb-8 min-h-[350px] flex items-center">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center w-full">
                    <div className="flex-shrink-0"><div className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center border-4 border-violet-500/30"><span className="text-4xl font-bold text-violet-400">{currentTestimonial.name.charAt(0).toUpperCase()}</span></div></div>
                    <div className="flex-1 text-center md:text-left overflow-hidden">
                        <div className="flex gap-1 mb-4 justify-center md:justify-start">{Array.from({ length: 5 }).map((_, i) => ( <DynamicIcon key={i} name="StarIcon" className={`w-5 h-5 ${i < currentTestimonial.rating ? "text-yellow-400" : "text-gray-600"}`} /> ))}</div>
                        <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed text-balance break-words">"{currentTestimonial.review}"</p>
                        <div><p className="font-semibold text-white">{currentTestimonial.name}</p>{currentTestimonial.company && <p className="text-sm text-violet-400">{currentTestimonial.company}</p>}</div>
                    </div>
                </div>
                {reviews.length > 1 && ( <> <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"><DynamicIcon name="ChevronLeftIcon" className="w-6 h-6" /></button> <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"><DynamicIcon name="ChevronRightIcon" className="w-6 h-6" /></button> </> )}
            </div>
            {reviews.length > 1 && ( <div className="flex justify-center gap-2">{reviews.map((_, index) => ( <button key={index} onClick={() => { setCurrentIndex(index); setIsAutoPlay(false); }} className={`h-2 rounded-full transition-all ${index === currentIndex ? "bg-violet-500 w-8" : "bg-gray-700 w-2 hover:bg-gray-600"}`} /> ))}</div> )}
        </div>
    );
};

// --- FAQSection ---
const FAQSection = ({ faqs }) => {
    const [expandedId, setExpandedId] = useState(faqs.length > 0 ? faqs[0].id : null);
    const toggleFAQ = (id) => setExpandedId(expandedId === id ? null : id);
    if (!faqs || faqs.length === 0) return null;

    return (
        <div className="space-y-3">
            {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-700 rounded-lg overflow-hidden transition-all bg-gray-800/50">
                    <button onClick={() => toggleFAQ(faq.id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/70 transition-colors text-left">
                        <span className="font-semibold text-white text-lg text-balance">{faq.question}</span>
                        <DynamicIcon name="ChevronDownIcon" className={`w-5 h-5 text-violet-400 flex-shrink-0 transition-transform ${expandedId === faq.id ? "rotate-180" : ""}`} />
                    </button>
                    <motion.div initial={false} animate={{ height: expandedId === faq.id ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="px-6 pb-6 pt-2"><p className="text-gray-400 leading-relaxed break-words">{faq.answer}</p></div>
                    </motion.div>
                </div>
            ))}
        </div>
    );
};


// --- PublicPortfolio Main Component ---
const PublicPortfolio = ({ items, sections: propSections, siteSettings: propSiteSettings, stats: propStats, skills: propSkills, servicesData: propServicesData, serviceList: propServiceList }) => {
    const [sections, setSections] = useState(propSections || []);
    const [siteSettings, setSiteSettings] = useState(propSiteSettings || {});
    const [stats, setStats] = useState(propStats || []);
    const [skills, setSkills] = useState(propSkills || []);
    const [servicesData, setServicesData] = useState(propServicesData || []);
    const [serviceList, setServiceList] = useState(propServiceList || []);
    const [activeSection, setActiveSection] = useState('hero');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isContactFormOpen, setContactFormOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [isLoading, setIsLoading] = useState(true);
    // --- NEW: Loading state for hero image ---
    const [isHeroImageLoaded, setHeroImageLoaded] = useState(false);


    useEffect(() => {
        const handleResize = () => setItemsPerPage(window.innerWidth < 768 ? 5 : 6);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => { setCurrentPage(1); }, [activeFilter]);

    useEffect(() => {
        setSections(propSections);
        setSiteSettings(propSiteSettings);
        setStats(propStats);
        setSkills(propSkills);
        setServicesData(propServicesData);
        setServiceList(propServiceList);
        
        if (items && items.length > 0) {
            setIsLoading(false);
        }

        const unsubscribeReviews = onSnapshot(getCollectionQuery('reviews'), (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(fetchedData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });
        const unsubscribeFaqs = onSnapshot(getCollectionQuery('faqs'), (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFaqs(fetchedData);
        });

        return () => {
            unsubscribeReviews();
            unsubscribeFaqs();
        };
    }, [propSections, propSiteSettings, propStats, propSkills, propServicesData, propServiceList, items]);

    const handleReviewSubmit = async (reviewData) => {
        try { await saveCollectionItem('reviews', reviewData); } 
        catch (error) { console.error("Error adding review:", error); }
    };

    const filteredItems = activeFilter === 'all' ? items : items.filter(item => item.sectionId === activeFilter);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = pageNumber => setCurrentPage(pageNumber);

    useEffect(() => {
        const sectionIds = ['hero', 'work', 'services', 'skills', 'stats', 'reviews', 'faq', 'contact', 'social-links'];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
        }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
        sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
        return () => sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.unobserve(el); });
    }, [sections, reviews, faqs]);

    const getNavLinkClass = (section) => {
        const baseClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95";
        return activeSection === section ? `${baseClass} bg-violet-600 text-white shadow-lg` : `${baseClass} text-gray-300 hover:bg-white/10 hover:text-white`;
    };

    const navLinks = [
        { id: 'hero', label: 'Home', icon: <DynamicIcon name="HomeIcon" /> },
        { id: 'work', label: 'Work', icon: <DynamicIcon name="MonitorIcon" /> },
        { id: 'services', label: 'Services', icon: <DynamicIcon name="UsersIcon" /> },
        { id: 'skills', label: 'Skills', icon: <DynamicIcon name="SettingsIcon" /> },
        { id: 'contact', label: 'Contact', icon: <DynamicIcon name="MailIcon" /> },
    ].map(link => ({ ...link, icon: React.cloneElement(link.icon, { className: 'h-5 w-5' }) }));
    
    const filterOptions = [{ id: 'all', name: 'All' }, ...sections];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 dark">
            <style>{` :root { --primary: oklch(0.7 0.25 270); --accent: oklch(0.65 0.22 35); } .dark { background-color: #111827; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } @keyframes pulseSlow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } } .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; } .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; } .animate-gradient { background-size: 200% 200%; animation: gradient 15s ease infinite; } .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; } html { scroll-behavior: smooth; } `}</style>

            <nav className="fixed bottom-2 md:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/10 rounded-full p-1.5 shadow-2xl pointer-events-auto">
                    {navLinks.map(link => ( <a key={link.id} href={`#${link.id}`} className={getNavLinkClass(link.id)}>{link.icon}<span className={activeSection === link.id ? 'inline' : 'hidden md:inline'}>{link.label}</span></a> ))}
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
                            {/* --- UPDATED: Hero Image with Skeleton Loader --- */}
                            <div className="relative animate-fade-in-up hidden md:block" style={{ animationDelay: "0.2s" }}>
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl relative group">
                                     {!isHeroImageLoaded && (
                                        <div className="absolute inset-0 bg-gray-700 animate-pulse" />
                                     )}
                                     <img 
                                        src={siteSettings.heroImageUrl || "https://placehold.co/1280x720/111827/7c3aed?text=Showreel"} 
                                        alt="Video editing workspace" 
                                        className={`w-full h-full object-cover transition-opacity duration-700 group-hover:scale-105 ${isHeroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setHeroImageLoaded(true)}
                                    />
                                     <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${isHeroImageLoaded ? 'block' : 'hidden'}`}>
                                        <div className="w-20 h-20 rounded-full bg-violet-600/90 flex items-center justify-center backdrop-blur-sm">
                                            <DynamicIcon name="PlayIcon" className="text-white ml-1 w-8 h-8"/>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="work" className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12 text-center"><h3 className="text-4xl md:text-5xl font-bold mb-4">Featured Work</h3><p className="text-gray-400 text-lg max-w-2xl mx-auto">A selection of recent projects showcasing diverse editing styles.</p></div>
                        <div className="flex flex-wrap justify-center gap-3 mb-12">{filterOptions.map((filter) => ( <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${ activeFilter === filter.id ? "bg-violet-600 text-white shadow-lg" : "bg-gray-800 text-gray-400 hover:bg-gray-700" }`}>{filter.name}</button> ))}</div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isLoading ? (
                                Array.from({ length: itemsPerPage }).map((_, index) => <SkeletonCard key={index} />)
                            ) : (
                                currentItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Card onClick={() => setSelectedVideo(item)}>
                                            <div className="relative aspect-video overflow-hidden">
                                                {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : item.videoUrl ? <VideoEmbed url={item.videoUrl} isModal={false} /> : <div className="w-full h-full bg-black flex items-center justify-center font-mono text-gray-500">{item.title}</div> }
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
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {item.tools && item.tools.split(',').map((tool, tagIndex) => (
                                                        <span key={tool.trim() || tagIndex} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">{tool.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        {!isLoading && <Pagination itemsPerPage={itemsPerPage} totalItems={filteredItems.length} paginate={paginate} currentPage={currentPage} />}
                    </div>
                </section>
                
                <section id="services" className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16"><h3 className="text-4xl md:text-5xl font-bold mb-4">{siteSettings.servicesTitle || "What I Offer"}</h3><p className="text-gray-400 text-lg max-w-2xl mx-auto">{siteSettings.servicesSubtitle || "High-quality services to bring your vision to life."}</p></div>
                        <div className="grid md:grid-cols-3 gap-8">{servicesData.map((service, index) => ( <motion.div key={service.id || index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}><div className="bg-gray-800/50 p-8 rounded-lg text-center h-full border border-gray-700 hover:border-violet-500 hover:bg-gray-800 transition-all duration-300"><div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-violet-600/10 text-violet-400"><DynamicIcon name={service.icon} className="w-8 h-8" /></div><h4 className="text-2xl font-bold mb-3">{service.title}</h4><p className="text-gray-400">{service.description}</p></div></motion.div>))}</div>
                    </div>
                </section>

                <motion.section id="skills" className="py-20 px-6 bg-gray-800/30" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="max-w-7xl mx-auto"><div className="grid md:grid-cols-2 gap-16 items-center"><div className="space-y-6"><h3 className="text-4xl md:text-5xl font-bold">{siteSettings.skillsTitle || "Technical Expertise"}</h3><p className="text-gray-400 text-lg leading-relaxed">{siteSettings.skillsSubtitle || "Proficient in industry-standard tools and techniques, with a focus on storytelling, pacing, and visual aesthetics."}</p><div className="space-y-4 pt-4">{skills.map((skill) => ( <div key={skill.id} className="space-y-2 group"> <div className="flex justify-between text-sm"> <span className="font-medium group-hover:text-violet-400 transition-colors">{skill.name}</span> <span className="text-gray-500 font-mono">{skill.level}%</span> </div> <div className="h-2 bg-gray-700 rounded-full overflow-hidden"> <div className="h-full bg-gradient-to-r from-violet-500 to-red-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${skill.level}%` }} /> </div> </div> ))}</div></div><div className="space-y-6"><Card className="p-8 bg-gray-800 border-gray-700"><h4 className="text-2xl font-bold mb-6">Service List</h4><ul className="space-y-4">{serviceList.map((service) => ( <li key={service.id} className="flex items-center gap-3 text-gray-400 group hover:text-white transition-colors"> <div className="w-1.5 h-1.5 bg-violet-500 rounded-full group-hover:scale-150 transition-transform" /> {service.name} </li> ))}</ul></Card></div></div></div>
                </motion.section>
                
                <section id="stats" className="py-16 px-6 bg-gray-900 border-y border-gray-800"><div className="max-w-7xl mx-auto"><div className="flex flex-row flex-wrap items-start justify-evenly gap-12 md:gap-16">{stats.map((stat) => ( <AnimatedCounter key={stat.id} value={stat.value} label={stat.label} icon={stat.icon} /> ))}</div></div></section>
                
                <motion.section id="reviews" className="py-20 px-6" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
                            <div className="flex items-center gap-4"><DynamicIcon name="StarIcon" className="text-violet-400 w-12 h-12 flex-shrink-0" /><div><h3 className="text-4xl md:text-5xl font-bold text-white mb-1 text-balance">What Clients Say</h3><p className="text-lg text-gray-400 max-w-2xl">Hear from satisfied clients about their experience.</p></div></div>
                            <Button size="lg" onClick={() => setReviewModalOpen(true)} className="gap-2 group whitespace-nowrap"><DynamicIcon name="PencilAltIcon" /> Write a Review</Button>
                        </div>
                        <TestimonialsCarousel reviews={reviews} />
                    </div>
                </motion.section>
                
                <div className="h-px bg-gray-800 max-w-7xl mx-auto" />

                <motion.section id="faq" className="py-20 px-6" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 flex flex-col items-center">
                            <DynamicIcon name="QuestionMarkCircleIcon" className="text-violet-400 w-16 h-16 mb-4" />
                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-3 text-balance">Frequently Asked Questions</h3>
                            <p className="text-lg text-gray-400">Find answers to common questions about my services.</p>
                        </div>
                        <FAQSection faqs={faqs} />
                    </div>
                </motion.section>

                <motion.section id="contact" className="py-20 px-6" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="max-w-4xl mx-auto"><div className="text-center mb-12"><h2 className="text-4xl md:text-5xl font-bold text-balance">Let's Create Something <span className="text-violet-500">Amazing</span></h2><p className="text-xl text-gray-400 text-pretty mt-4">Available for freelance projects. Let's bring your vision to life.</p></div><div className="hidden md:block bg-gray-800/50 p-8 rounded-lg"><ContactForm /></div><div className="md:hidden text-center"><Button size="lg" className="gap-2 group !bg-red-600 hover:!bg-red-700" onClick={() => setContactFormOpen(true)}><DynamicIcon name="MailIcon"/> Get in Touch</Button></div></div>
                </motion.section>
                
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}><SocialLinksSection siteSettings={siteSettings} /></motion.div>
            </main>

            <footer className="py-8 px-6 border-t border-gray-800"><div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {siteSettings.footerName || "Your Name"}. All rights reserved.</p><p className="text-sm text-gray-500 font-mono">{siteSettings.footerTagline || "Tagline here"}</p></div></footer>
            
            <ContactFormModal isOpen={isContactFormOpen} onClose={() => setContactFormOpen(false)} />
            <ReviewFormModal isOpen={isReviewModalOpen} onClose={() => setReviewModalOpen(false)} onSubmit={handleReviewSubmit} />
            {selectedVideo && <VideoPlayerModal item={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </div>
    );
};

export default PublicPortfolio;