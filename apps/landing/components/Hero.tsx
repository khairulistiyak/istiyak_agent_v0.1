"use client";

import { motion } from "framer-motion";

/**
 * Animated Hero Component with Framer Motion
 * Features: fade-in, slide-up, stagger animations
 */
export const Hero = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Custom easing
      },
    },
  };

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <section className="relative text-center py-20 px-4 bg-transparent">
      <motion.div
        className="max-w-3xl mx-auto space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Minimal Glass Badge */}
        <motion.span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold text-[#06b6d4] bg-[#06b6d4]/5 border border-[#06b6d4]/10 tracking-wider uppercase font-mono"
          variants={fadeInUp}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ⚡
          </motion.span>
          Version 0.1.0-MVP Now Live
        </motion.span>

        {/* Animated Heading */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight font-mono max-w-2xl mx-auto"
          variants={fadeInScale}
        >
          Your Autonomous AI Software Engineer Companion
        </motion.h1>

        {/* Animated Description */}
        <motion.p
          className="text-xs md:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed"
          variants={fadeInUp}
        >
          A lightweight, borderless floating companion that lives on your desktop.
          Monitors files, handles tests, and builds features right inside your favorite editor.
        </motion.p>

        {/* Animated Action Buttons (Translucent glass-pill style matching 07-accept-reject-zen.svg specifications) */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 pt-3"
          variants={fadeInUp}
        >
          <a href="#download" className="no-underline">
            <motion.button
              className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-black bg-[#06b6d4] hover:bg-[#08d1f2] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Download for Mac
            </motion.button>
          </a>
          <a href="#pricing" className="no-underline">
            <motion.button
              className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Get Pro Key
            </motion.button>
          </a>
        </motion.div>
      </motion.div>

      {/* Subtle Background Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#06b6d4]/5 rounded-full blur-[100px] pointer-events-none -z-10"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
};

export default Hero;
