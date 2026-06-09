import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (Inline SVGs to keep zero-dependency) ---
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

const ChevronLeft = () => (
  <svg className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
  </svg>
);

const ChevronRight = () => (
  <svg className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
  </svg>
);

const ImageIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

const BasketIcon = () => (
  <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
);

// --- Mock Data ---
const mockData = [
  { id: 1, title: '20% off on all DO F&B Outlets', category: 'Restaurant', subtitle: null },
  { id: 2, title: 'Al Hilal Premium Medical Center', category: 'Medical', subtitle: '+974 4431 6633 / +974 3314 3735\nAl Nuaija St, Doha' },
  { id: 3, title: 'Exclusive Suite Rates & Spa Discounts', category: 'Hotel', subtitle: null },
  { id: 4, title: 'Al Hilal Turkish Restaurant', category: 'Restaurant', subtitle: '7032 6737' },
  { id: 5, title: 'Art Factory', category: 'Service', subtitle: '7728 9955 / 3371 4726' },
];

const categories = ['All', 'Medical', 'Hotel', 'Restaurant', 'Service'];

// --- Gold Spinner Element ---
const MinimalistSpinner = () => (
  <motion.div
    className="w-12 h-12 border-2 border-gray-800 rounded-full border-t-[#C19A5B]"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

// --- Staggered Wave Text Component ---
const AnimatedText = ({ text, className = "" }) => {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      },
    },
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 160, // Snappy entry velocity
        damping: 7,    // Lower damping for a lively, classy bounce
        mass: 0.8,
      },
    },
    hidden: { opacity: 0, y: 60 },
  };

  return (
    <motion.div
      className={`flex flex-wrap justify-center ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className={`whitespace-nowrap overflow-hidden flex py-4 ${wordIndex !== words.length - 1 ? 'mr-10' : ''}`}>
          {Array.from(word).map((letter, letterIndex) => (
            <motion.span
              key={letterIndex}
              className="inline-block transform-gpu"
              variants={childVariants}
              style={{
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased"
              }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
};

// --- MULTI-PHASED CINEMATIC LOADING SCREEN ---
const LoadingScreen = ({ phase }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black pointer-events-none"
      initial={{ opacity: 1 }}
      // The black background fades out seamlessly during the zoom phase
      animate={{ opacity: (phase === 'zoom' || phase === 'fadeOut') ? 0 : 1 }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
    >
      <motion.div
        className="relative origin-center transform-gpu flex items-center justify-center w-full"
        animate={{
          // Scale and fade the text simultaneously with the background
          scale: (phase === 'zoom' || phase === 'fadeOut') ? 25 : 1,
          filter: (phase === 'zoom' || phase === 'fadeOut') ? "blur(12px)" : "blur(0px)",
          opacity: (phase === 'zoom' || phase === 'fadeOut') ? 0 : 1
        }}
        transition={{
          duration: 1.5,
          ease: [0.6, 0.01, -0.05, 0.95] // Custom premium whip-pan bezier curve
        }}
        style={{ willChange: "transform, filter, opacity" }}
      >
        <AnimatePresence mode="wait">
          {/* Phase 1: Spinning Indicator */}
          {phase === 'loading' && (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
              className="absolute"
            >
              <MinimalistSpinner />
            </motion.div>
          )}

          {/* Phase 2: Letter Animation Waves */}
          {(phase === 'text' || phase === 'zoom' || phase === 'fadeOut') && (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-[#C19A5B] font-bodoni-moda tracking-[0.08em] text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase whitespace-nowrap text-center"
            >
              {/* Only trigger the entrance animations when the container first mounts */}
              <AnimatedText text="DOHA OASIS" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN PORTAL MODULE ---
export default function App() {
  // Linear animation timeline states: 'loading' -> 'text' -> 'zoom' -> 'fadeOut' -> 'done'
  const [splashPhase, setSplashPhase] = useState('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    // 1. Unmount spinner and call character waves
    const textTimer = setTimeout(() => {
      setSplashPhase('text');
    }, 1600);

    // 2. Trigger the camera lens zoom forward WHILE the background remains pure black
    const zoomTimer = setTimeout(() => {
      setSplashPhase('zoom');
    }, 4500); // Gives the text bounce 2.9 seconds to ripple and settle down beautifully

    // 3. Drop background opacity to smoothly reveal the website behind the camera path
    const fadeOutTimer = setTimeout(() => {
      setSplashPhase('fadeOut');
    }, 5600); // Triggers exactly when the letters have scaled past the screen edges

    // 4. Completely clean up and garbage-collect the loading elements
    const clearSplashTimer = setTimeout(() => {
      setSplashPhase('done');
    }, 6800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(zoomTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(clearSplashTimer);
    };
  }, []);

  const filteredBenefits = mockData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Main website content opacity handles its entrance keyframe
  const showMainAppContent = splashPhase === 'zoom' || splashPhase === 'fadeOut' || splashPhase === 'done';

  return (
    <>
      {splashPhase !== 'done' && <LoadingScreen phase={splashPhase} />}

      <div className={`min-h-screen bg-[#F9FAFB] font-sans text-slate-800 ${splashPhase !== 'done' ? 'h-screen overflow-hidden' : ''}`}>

        {/* A. Full-Width Layout Header */}
        <header className={`w-full bg-white py-5 px-8 md:px-16 shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 transition-all duration-[1200ms] ease-out transform ${showMainAppContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          <div className="text-gray-500 font-light text-lg">
            Employee Benefits
          </div>
          <div className="text-[#C19A5B] font-bodoni-moda tracking-[0.05em] text-xl uppercase">
            Doha Oasis
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-x-hidden transition-all duration-[1200ms] delay-[300ms] ease-out ${showMainAppContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Featured Carousel */}
          <section className="mb-14">
            <h2 className="text-2xl font-light text-slate-700 mb-6 tracking-wide">Featured</h2>
            <div className="flex items-center justify-center">
              <ChevronLeft />
              <div className="mx-6 w-full max-w-[340px] bg-[#FFF8F5] border border-orange-100 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
                <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 self-end rounded-bl-lg absolute top-0 right-0 z-10">
                  Corporate Discount Guide
                </div>
                <div className="p-6 pt-10 flex flex-col items-start z-10">
                  <span className="text-orange-500 font-bold text-2xl tracking-tighter mb-1">talabat</span>
                  <h3 className="text-orange-600 font-extrabold text-[32px] leading-tight mb-2">Get 22% off</h3>
                  <p className="text-sm text-gray-700 font-medium">from Office Picks Collection</p>
                  <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-full inline-flex items-center text-xs shadow-sm mb-4 mt-2">
                    <span className="text-gray-600 mr-1 font-medium">Use code:</span>
                    <span className="text-orange-600 font-bold tracking-wide">DHO22</span>
                  </div>
                </div>
                <div className="bg-white flex-grow flex items-center justify-center p-8 border-t border-orange-50 rounded-t-[2.5rem] relative h-32">
                  <div className="absolute -top-6 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <BasketIcon />
                  </div>
                </div>
              </div>
              <ChevronRight />
            </div>
          </section>

          {/* Benefits Directory */}
          <section>
            <h2 className="text-2xl font-light text-slate-700 mb-6 tracking-wide">Benefits</h2>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D2C1D]"
              />
            </div>
            <div className="bg-gray-50/80 rounded-lg p-1.5 mb-8 flex items-center justify-between border border-gray-100 shadow-inner overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeCategory === category ? 'bg-[#0D2C1D] text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-col space-y-6">
              {filteredBenefits.map(benefit => (
                <div key={benefit.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="flex p-6 items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center mr-6 border border-gray-100 rounded-xl bg-gray-50 text-gray-300">
                      <ImageIcon />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl sm:text-[22px] text-gray-600 font-light leading-snug mb-2">{benefit.title}</h3>
                      {benefit.subtitle && <div className="text-sm text-gray-400 font-light whitespace-pre-line">{benefit.subtitle}</div>}
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button className="w-full bg-[#0D2C1D] text-white py-3.5 rounded-lg font-medium text-sm hover:bg-[#081a11]">
                      View Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}