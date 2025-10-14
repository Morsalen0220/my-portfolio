import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

// --- Helper Components & Icons (Moved from PublicPortfolio.jsx) ---

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
};

export const DynamicIcon = ({ name, className }) => {
    const IconComponent = iconComponents[name];
    return IconComponent ? <IconComponent className={className} /> : null;
};

// --- AnimatedCounter Component (uses framer-motion) ---
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


// --- Utility/Shared Components ---
export const Card = ({ children, className, ...props }) => ( <div className={`overflow-hidden bg-gray-800/50 border-gray-700 hover:border-violet-500 transition-all duration-500 cursor-pointer animate-fade-in-up hover:shadow-2xl hover:shadow-violet-500/10 rounded-lg ${className}`} {...props}> {children} </div> );
export const Button = ({ children, variant, size, className, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
    const sizeClasses = size === 'lg' ? 'h-12 px-8 text-base' : 'h-10 px-4';
    const variantClasses = variant === 'outline' ? "border border-input bg-transparent" : "bg-violet-600 text-white hover:bg-violet-700";
    return <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>{children}</button>;
};

export const ServiceCard = ({ service, index }) => (
    <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
        <div className="bg-gray-800/50 p-8 rounded-lg text-center h-full border border-gray-700 hover:border-violet-500 hover:bg-gray-800 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-violet-600/10 text-violet-400">
                <DynamicIcon name={service.icon} className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-bold mb-3">{service.title}</h4>
            <p className="text-gray-400">{service.description}</p>
        </div>
    </motion.div>
);

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