import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingAnimation = ({ onAnimationComplete }) => {
  // Animation-ti ekhon thik 700 millisecond cholbe
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 700); // Shomoy 700ms kora hoyeche

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const text = "MORSALEN";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Ektu druto kora hoyeche
        delayChildren: 0.1,
      },
    },
    exit: {
        y: -50,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    }
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    },
  };

  return (
    <AnimatePresence>
        <motion.div
            key="loader"
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
        >
            <motion.div
                key="text-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex text-white text-4xl md:text-6xl font-bold tracking-widest"
            >
                {text.split('').map((char, index) => (
                    <motion.span key={index} variants={letterVariants} className="inline-block">
                        {char}
                    </motion.span>
                ))}
            </motion.div>
        </motion.div>
    </AnimatePresence>
  );
};

export default LandingAnimation;