// --- imports ---
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionCarousel } from './components/MotionCarousel';
import { OffersSection } from './components/OffersSection';

// --- gsap plugins ---
gsap.registerPlugin(ScrollTrigger);

// --- mock data ---
const mockData = [
  {
    id: 1,
    title: '20% off on all DO F&B Outlets',
    category: 'Restaurant',
    subtitle: 'Experience world-class dining with exclusive savings.',
    video: '/video1.mp4',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000',
    description: "Indulge in a culinary journey at Doha Oasis. From authentic Italian cuisine to contemporary Asian fusion, our F&B outlets offer a taste of perfection. Enjoy an exclusive 20% discount on your entire bill at all participating restaurants.",
    validity: "Valid until December 31, 2026",
    location: "All Doha Oasis F&B Outlets",
    terms: ["Discount applies to food and beverage only.", "Cannot be combined with other offers.", "Prior reservation recommended."]
  },
  {
    id: 2,
    title: 'Al Hilal Premium Medical Center',
    category: 'Medical',
    subtitle: 'World class medical services at your fingertips',
    video: '/video2.mp4',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2000',
    description: "Prioritize your health with premium medical services. Doha Oasis employees and their families receive exclusive priority booking, complimentary health screenings, and comprehensive care discounts at Al Hilal Premium Medical Center.",
    validity: "Ongoing Benefit",
    location: "Al Nuaija St, Doha",
    terms: ["Present employee ID upon arrival.", "Subject to doctor availability.", "Excludes certain surgical procedures."]
  },
  {
    id: 3,
    title: 'Exclusive Suite Rates & Spa Discounts',
    category: 'Hotel',
    subtitle: 'Luxury stays and rejuvenating spa treatments.',
    video: '/video3.mp4',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000',
    description: "Escape into luxury with our exclusive corporate suite rates. Unwind in opulence and treat yourself to our award-winning spa with a 30% discount on all signature treatments. Your ultimate staycation awaits.",
    validity: "Valid on weekends throughout 2026",
    location: "Banyan Tree Doha At La Cigale Mushaireb",
    terms: ["Room upgrades subject to availability.", "Spa discount valid only on treatments over 60 minutes.", "Blackout dates apply."]
  },
  {
    id: 4,
    title: 'Al Hilal Turkish Restaurant',
    category: 'Restaurant',
    subtitle: 'Food',
    video: '/video4.mp4',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000',
    description: "Savor the authentic flavors of Turkey right in the heart of Doha. From perfectly grilled kebabs to rich, sweet baklava, Al Hilal offers a 15% discount for all Doha Oasis employees on dining and takeaway.",
    validity: "Valid daily, excluding public holidays",
    location: "Doha Oasis Ground Floor",
    terms: ["Valid for groups of up to 4 people.", "Discount does not apply to delivery platforms."]
  },
  {
    id: 5,
    title: 'Art Factory',
    category: 'Service',
    subtitle: 'Paintings',
    video: '/video5.mp4',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000',
    description: "Unleash your creativity at the Art Factory. Whether you're looking for painting classes, pottery workshops, or custom framing, enjoy a complimentary introductory session and 10% off all premium art supplies.",
    validity: "Valid until June 30, 2026",
    location: "Doha Oasis Mall, Level 2",
    terms: ["Workshops require 48-hour advance booking.", "Supplies discount limited to selected brands."]
  },
];

const categories = ['All', 'Medical', 'Hotel', 'Restaurant', 'Service'];

// --- split text utility component ---
const SplitText = ({ text, className = "", wordSpace = "mr-4 md:mr-10", py = "py-4", hiddenClass = "" }) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap justify-center ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className={`whitespace-nowrap overflow-hidden flex ${py} ${wordIndex !== words.length - 1 ? wordSpace : ''}`}>
          {Array.from(word).map((letter, letterIndex) => (
            <span
              key={letterIndex}
              className={`split-char inline-block transform-gpu ${hiddenClass}`}
              style={{ backfaceVisibility: "hidden", WebkitFontSmoothing: "antialiased" }}
            >
              {letter}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
};

// --- main app component ---
export default function App() {
  // --- state & refs ---
  const appRef = useRef(null);

  // --- lenis smooth scroll initialization ---
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    let lenis;
    let rafId;

    const initLenis = () => {
      // completely disable smooth scrolling on mobile viewports
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return;
      }

      if (window.Lenis) {
        lenis = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smooth: true,
          smoothTouch: false,
        });

        function raf(time) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
        window.lenisInstance = lenis; // expose globally to fix scroll jumping
      }
    };

    if (!window.Lenis) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/lenis@1.1.2/dist/lenis.min.js";
      script.async = true;
      script.onload = initLenis;
      document.head.appendChild(script);
    } else {
      initLenis();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  // --- gsap master animations ---
  useGSAP(() => {
    // initial states for entrance animations
    gsap.set('.header-fade-text .split-char', { opacity: 0, y: 40, scale: 0.5, rotationX: 90 });
    gsap.set('.header-logo', { opacity: 0, y: -20 });
    gsap.set('.carousel-container', { scale: 1.05, y: 80, boxShadow: "0 30px 60px -15px rgba(0,0,0,0)", clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" });

    // nav bar initial state
    gsap.set('.nav-bar-container', { y: -30, opacity: 0, width: "52px", overflow: "hidden" });
    gsap.set('.search-input-wrapper', { opacity: 0 });
    gsap.set('.categories-container', { opacity: 0 });
    gsap.set('.divider', { opacity: 0 });

    const tl = gsap.timeline();

    // fade in carousel container immediately
    tl.to('.carousel-container', {
      scale: 1,
      y: 0,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      duration: 1.2,
      ease: "power3.out",
      clearProps: "transform,clipPath"
    }, 0);

    tl.to('.carousel-container', {
      boxShadow: "0 30px 60px -15px rgba(0,0,0,0.3)",
      duration: 1.5,
      ease: "sine.inOut"
    }, 0);

    // nav bar and inner elements expand simultaneously
    tl.to('.nav-bar-container', { 
      y: 0, 
      opacity: 1, 
      width: "auto", 
      duration: 1.2, 
      ease: "expo.out", 
      clearProps: "width,overflow" 
    }, 0);
    
    tl.to('.search-input-wrapper', { opacity: 1, duration: 1.2, ease: "power2.out" }, 0);
    tl.to('.divider', { opacity: 1, duration: 1.2 }, 0);
    tl.to('.categories-container', { opacity: 1, duration: 1.2, clearProps: "all" }, 0);

    // header text reveal
    tl.to('.header-fade-text .split-char', {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      stagger: 0.04,
      ease: "back.out(2)",
      duration: 1.2
    }, 0);
    
    tl.to('.header-logo', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out"
    }, 0);

  }, { scope: appRef });

  // --- render jsx ---
  return (
    <div ref={appRef} className="app-container relative min-h-screen bg-white font-body text-slate-900 tracking-normal">

      {/* --- absolute editorial header --- */}
      <header className="absolute top-0 left-0 right-0 py-4 px-4 md:py-6 md:px-16 flex items-center justify-between gap-4 md:gap-0 z-40 pointer-events-none">
        {/* left side: title text */}
        <div className="header-fade-text text-slate-900 font-medium font-outfit text-lg md:text-2xl tracking-tight uppercase pointer-events-auto flex items-center pl-2 md:pl-10 origin-left" style={{ perspective: "1000px" }}>
          <SplitText text="Employee Benefits" className="!justify-start" wordSpace="mr-3" py="py-0" hiddenClass="" />
        </div>

        {/* right side: anchored branding logo */}
        <div className="header-logo pointer-events-auto h-16 md:h-24 flex items-center mt-1 md:mt-2 shrink-0">
          <img src="/logo.png" alt="Doha Oasis" className="h-12 md:h-18 w-auto object-contain mix-blend-multiply scale-110 md:scale-125 origin-right" />
        </div>
      </header>

      {/* --- main content --- */}
      <div className="main-app-content w-full relative z-0 pt-24 md:pt-32 opacity-100">

        <div className="carousel-container w-full max-w-[92%] md:max-w-[85%] mx-auto h-[60vh] md:h-[70vh] mb-16 relative z-10 rounded-none overflow-hidden border border-slate-200">
          <MotionCarousel options={{ loop: true, align: 'start' }} isReady={true} />
        </div>

        <OffersSection offers={mockData} categories={categories} splashDone={true} />

      </div>
    </div>
  );
}