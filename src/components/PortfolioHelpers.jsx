import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import VideoEmbed from './VideoEmbed';

// --- Icon Components ---
// All SVG icon definitions are now consolidated here
export const iconComponents = {
    FilmIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>,
    UsersIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    VideoIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
    SparklesIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/></svg>,
    MicIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
    PlayIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    DownloadIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    MailIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
    XIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    CameraIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    SettingsIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1z"/></svg>,
    MonitorIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
    CodeIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
    TrendingUpIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    SocialIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 9H6V6h8M22 17h-8v-3h8M14 2h-4v2h4M12 22h-2v2h2M12 2h4v2h-4zM2 17v-3h4v3M2 9v-3h4v3zM12 9v-3h-4v3M12 17v-3h-4v3z"/></svg>,
    FacebookIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    LinkedinIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 0-6-6h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a6 6 0 0 0 6-6V8z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
    WhatsappIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.002 0c-6.613 0-11.979 5.366-11.979 11.979s5.366 11.979 11.979 11.979h.001c.002 0 .004-.00018 .006-.00054a11.977 11.977 0 0 0 11.968-11.978c0-6.613-5.366-11.979-11.979-11.979zM18.8 16.5c-.3-.5-1.7-.8-1.9-1.0s-1-.2-1.5.7c-.5.8-2.0 2.5-2.5 2.8s-1.0.3-1.8-.2c-.7-.5-3.0-1.8-4.2-4.0s-1.2-3.3-.8-4.1c.4-.8.8-1.4 1.2-1.7s.8-.5 1.0-.5c.2 0 .5-.1.8.3s1.0 2.4 1.1 2.5c.1.2 0 .6-.1.8s-.3.6-.5.8c-.2.2-.4.4-.6.6c-.2.2-.4.3-.2.6c.2.3.6 1.0 1.2 1.5.5.5 1.0.7 1.2.9.2.1.4.1.5-.1.1-.2.4-.6.5-.8s.3-.4.5-.6c.2-.2.5-.2.8-.2.2 0 .5-.1.8-.2s.9-.2 1.3-.4c.4-.2.8-.5 1.0-.7s.3-.4.5-.4c.2 0 .8.4.9.8s.2.7.2.9c0 .2 0 .5-.1.8s-.1.4-.2.6c-.1.2-.3.4-.6.6z"/></svg>,
    PhoneIcon: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2 2h-2a22 22 0 0 1-20-20V4a2 2 0 0 1 2-2h3.08a2 2 0 0 1 1.83 1.23l.97 2.92a2 2 0 0 1-.45 2.05L6.44 11.23a10 10 0 0 0 6.33 6.33l1.9-1.9a2 2 0 0 1 2.05-.45l2.92.97a2 2 0 0 1 1.23 1.83z"/></svg>,
};

export const DynamicIcon = ({ name, className }) => {
    const IconComponent = iconComponents[name];
    return IconComponent ? <IconComponent className={className} /> : null;
};


// --- Animated Counter ---
export const AnimatedCounter = ({ value, label, icon }) => {
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


// --- Reusable UI Components ---
export const Card = ({ children, className, ...props }) => ( <div className={`overflow-hidden bg-gray-800/50 border-gray-700 hover:border-violet-500 transition-all duration-500 cursor-pointer animate-fade-in-up hover:shadow-2xl hover:shadow-violet-500/10 rounded-lg ${className}`} {...props}> {children} </div> );
export const Button = ({ children, variant, size, className, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
    const sizeClasses = size === 'lg' ? 'h-12 px-8 text-base' : 'h-10 px-4';
    const variantClasses = variant === 'outline' ? "border border-input bg-transparent" : "bg-violet-600 text-white hover:bg-violet-700";
    return <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>{children}</button>;
};

// --- Contact Form Components ---
export const ContactForm = () => {
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

export const ContactFormModal = ({ isOpen, onClose }) => {
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

// --- Social Links Component ---
export const SocialLinksSection = ({ siteSettings }) => (
    <section id="social-links" className="py-16 px-6 bg-gray-800/30 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-8">Connect with Me</h3>
            <div className="flex justify-center items-center flex-wrap gap-8">
                {/* Facebook Link (Uses siteSettings.facebookUrl) */}
                <a key="fb" href={siteSettings.facebookUrl || "https://facebook.com/yourhandle"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group space-y-2">
                    <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-600/30 group-hover:bg-blue-600/20 transition-all duration-300">
                        <DynamicIcon name="FacebookIcon" className="w-8 h-8"/>
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-blue-400">Facebook</span>
                </a>
                
                {/* LinkedIn Link (Uses siteSettings.linkedinUrl) */}
                <a key="li" href={siteSettings.linkedinUrl || "https://linkedin.com/in/yourhandle"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group space-y-2">
                    <div className="w-16 h-16 rounded-full bg-sky-600/10 text-sky-400 flex items-center justify-center border border-sky-600/30 group-hover:bg-sky-600/20 transition-all duration-300">
                        <DynamicIcon name="LinkedinIcon" className="w-8 h-8"/>
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-sky-400">LinkedIn</span>
                </a>

                {/* WhatsApp Link (Uses siteSettings.whatsappNumber) */}
                <a key="wa" href={`https://wa.me/${siteSettings.whatsappNumber || "8801XXXXXXXXX"}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group space-y-2">
                    <div className="w-16 h-16 rounded-full bg-green-600/10 text-green-400 flex items-center justify-center border border-green-600/30 group-hover:bg-green-600/20 transition-all duration-300">
                        <DynamicIcon name="WhatsappIcon" className="w-8 h-8"/>
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-green-400">WhatsApp</span>
                </a>

                {/* Phone Number (Uses siteSettings.phoneNumber and displays it) */}
                <a key="ph" href={`tel:${siteSettings.phoneNumber || "+8801XXXXXXXXX"}`} className="flex flex-col items-center group space-y-2">
                    <div className="w-16 h-16 rounded-full bg-red-600/10 text-red-400 flex items-center justify-center border border-red-600/30 group-hover:bg-red-600/20 transition-all duration-300">
                        <DynamicIcon name="PhoneIcon" className="w-8 h-8"/>
                    </div>
                    {/* UPDATED: Display Phone Number */}
                    <span className="text-sm font-medium text-gray-400 group-hover:text-red-400">
                        {siteSettings.phoneNumber || "Call Me"}
                    </span>
                </a>
            </div>
        </div>
    </section>
);