import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const LandingAnimation = ({ onAnimationComplete }) => {
  // অ্যানিমেশনটি মাত্র 300 মিলিসেকেন্ডে শেষ হবে
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 300); // চূড়ান্ত দ্রুত!

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  // ব্লার ইফেক্টের জন্য অ্যানিমেশন
  const blurVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.1, // খুবই দ্রুত আসবে
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2, // মিলিয়ে যাবে
        ease: 'easeOut',
      },
    },
  };

  return (
    // এই div-টি পুরো স্ক্রিন জুড়ে ব্লার ইফেক্ট তৈরি করবে
    <motion.div
      className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xl"
      variants={blurVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    />
  );
};

export default LandingAnimation;