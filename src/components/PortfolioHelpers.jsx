// src/components/PortfolioHelpers.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

export const iconComponents = {
    FilmIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>,
    UsersIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    VideoIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
    SparklesIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/></svg>,
    MicIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
    PlayIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" className={className}><path d="M5 3l14 9-14 9V3z"/></svg>,
    DownloadIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    MailIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
    XIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    CameraIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    SettingsIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1z"/></svg>,
    MonitorIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
    CodeIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
    StarIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" className={className}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
    PencilAltIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
    QuestionMarkCircleIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    HomeIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    ChevronLeftIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6"></polyline></svg>,
    ChevronRightIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>,
    ChevronDownIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>,
    FacebookIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    LinkedinIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 0-6-6h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a6 6 0 0 0 6-6V8z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
    WhatsappIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.3 16.4c-1.3-2.2-2-4.9-2-7.5 0-2.6.8-5.1 2.2-7.1M17 19.8c-1.2-1.4-2.1-3-2.6-4.7 -0.5-1.7-.8-3.4-.8-5.1s.2-3.4.7-5.1c.5-1.7 1.4-3.3 2.6-4.7M7.1 19.8c1.2-1.4 2.1-3 2.6-4.7 0.5-1.7.8-3.4.8-5.1s-.2-3.4-.7-5.1c-.5-1.7-1.4-3.3-2.6-4.7M2.7 16.4c1.3-2.2 2-4.9 2-7.5 0-2.6-.8-5.1-2.2-7.1"/></svg>,
    PhoneIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    TrendingUpIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
};

export const DynamicIcon = ({ name, className }) => {
    const IconComponent = iconComponents[name];
    return IconComponent ? <IconComponent className={className} /> : null;
};

export const AnimatedCounter = ({ value, label, icon }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const numericValue = parseInt(String(value).replace(/\D/g, ''), 10) || 0;
    const suffix = String(value).replace(/[0-9]/g, '');
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        if (isInView) {
            const animation = animate(count, numericValue, { duration: 2, ease: "easeOut" });
            return () => animation.stop();
        }
    }, [isInView, count, numericValue]);

    return ( <motion.div ref={ref} className="text-center space-y-3 flex flex-col items-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}> <div className="p-4 bg-violet-900/40 rounded-full border border-violet-500/30"> <DynamicIcon name={icon} className="w-8 h-8 text-violet-400" /> </div> <div className="text-4xl md:text-5xl font-bold text-white"> <motion.span>{rounded}</motion.span> {suffix} </div> <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p> <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div> </motion.div> );
};

export const Card = ({ children, className, ...props }) => ( <div className={`overflow-hidden bg-gray-800/50 border border-gray-700 hover:border-violet-500 transition-all duration-500 cursor-pointer animate-fade-in-up hover:shadow-2xl hover:shadow-violet-500/10 rounded-lg ${className}`} {...props}> {children} </div> );

export const Button = ({ children, variant, size, className, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
    const sizeClasses = size === 'lg' ? 'h-12 px-8 text-base' : 'h-10 px-4';
    const variantClasses = variant === 'outline' ? "border border-gray-600 bg-transparent hover:bg-gray-700" : "bg-violet-600 text-white hover:bg-violet-700";
    return <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>{children}</button>;
};

export const ContactForm = () => {
    const [formStatus, setFormStatus] = useState({ status: 'idle', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        setFormStatus({ status: 'loading', message: 'Sending...' });
        try {
            const response = await fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } });
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

    return ( <form action="https://formspree.io/f/xyznbnre" method="POST" onSubmit={handleSubmit} className="space-y-6"> <div> <label className="block text-sm font-medium mb-2 text-gray-400">Name</label> <input name="name" type="text" required placeholder="Your name" className="w-full bg-gray-700 h-12 text-base rounded-md px-4 border border-gray-600 focus:ring-2 focus:ring-violet-500" /> </div> <div> <label className="block text-sm font-medium mb-2 text-gray-400">Email</label> <input name="email" type="email" required placeholder="your@email.com" className="w-full bg-gray-700 h-12 text-base rounded-md px-4 border border-gray-600 focus:ring-2 focus:ring-violet-500" /> </div> <div> <label className="block text-sm font-medium mb-2 text-gray-400">Message</label> <textarea name="message" required placeholder="Tell me about your project..." rows={5} className="w-full bg-gray-700 text-base rounded-md p-4 border border-gray-600 resize-none focus:ring-2 focus:ring-violet-500" /> </div> <Button size="lg" type="submit" className="w-full font-semibold !bg-red-600 hover:!bg-red-700" disabled={formStatus.status === 'loading'}> {formStatus.status === 'loading' ? 'Sending...' : 'Send Message'} </Button> {formStatus.status !== 'idle' && ( <p className={`text-center text-sm mt-4 ${formStatus.status === 'success' ? 'text-green-400' : 'text-red-400'}`}> {formStatus.message} </p> )} </form> );
};

export const ContactFormModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return ( <AnimatePresence> <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}> <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6" onClick={(e) => e.stopPropagation()}> <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><DynamicIcon name="XIcon"/></button> <h3 className="text-2xl font-bold mb-6 text-center text-red-500">Get in Touch</h3> <ContactForm /> </motion.div> </motion.div> </AnimatePresence> );
};

export const SocialLinksSection = ({ siteSettings }) => (
    <section id="social-links" className="py-16 px-6 bg-gray-800/30 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-8">Connect with Me</h3>
            <div className="flex justify-center items-center flex-wrap gap-8">
                <a key="fb" href={siteSettings.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group space-y-2"> <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-600/30 group-hover:bg-blue-600/20 transition-all duration-300"> <DynamicIcon name="FacebookIcon" className="w-8 h-8"/> </div> <span className="text-sm font-medium text-gray-400 group-hover:text-blue-400">Facebook</span> </a>
                <a key="li" href={siteSettings.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group space-y-2"> <div className="w-16 h-16 rounded-full bg-sky-600/10 text-sky-400 flex items-center justify-center border border-sky-600/30 group-hover:bg-sky-600/20 transition-all duration-300"> <DynamicIcon name="LinkedinIcon" className="w-8 h-8"/> </div> <span className="text-sm font-medium text-gray-400 group-hover:text-sky-400">LinkedIn</span> </a>
                <a key="wa" href={`https://wa.me/${siteSettings.whatsappNumber || ""}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group space-y-2"> <div className="w-16 h-16 rounded-full bg-green-600/10 text-green-400 flex items-center justify-center border border-green-600/30 group-hover:bg-green-600/20 transition-all duration-300"> <DynamicIcon name="WhatsappIcon" className="w-8 h-8"/> </div> <span className="text-sm font-medium text-gray-400 group-hover:text-green-400">WhatsApp</span> </a>
                <a key="ph" href={`tel:${siteSettings.phoneNumber || ""}`} className="flex flex-col items-center group space-y-2"> <div className="w-16 h-16 rounded-full bg-red-600/10 text-red-400 flex items-center justify-center border border-red-600/30 group-hover:bg-red-600/20 transition-all duration-300"> <DynamicIcon name="PhoneIcon" className="w-8 h-8"/> </div> <span className="text-sm font-medium text-gray-400 group-hover:text-red-400"> {siteSettings.phoneNumber || "Call Me"} </span> </a>
            </div>
        </div>
    </section>
);