import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionCarousel } from './components/MotionCarousel';
import { OffersSection } from './components/OffersSection';

gsap.registerPlugin(ScrollTrigger);


// mock data
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
    subtitle: '+974 4431 6633 / +974 3314 3735\nAl Nuaija St, Doha', 
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
    subtitle: '7032 6737', 
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
    subtitle: '7728 9955 / 3371 4726', 
    video: '/video5.mp4', 
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000',
    description: "Unleash your creativity at the Art Factory. Whether you're looking for painting classes, pottery workshops, or custom framing, enjoy a complimentary introductory session and 10% off all premium art supplies.",
    validity: "Valid until June 30, 2026",
    location: "Doha Oasis Mall, Level 2",
    terms: ["Workshops require 48-hour advance booking.", "Supplies discount limited to selected brands."]
  },
];

const categories = ['All', 'Medical', 'Hotel', 'Restaurant', 'Service'];

// gold bouncy loading element
const BouncyLoadingSpinner = () => {
  return (
    <div className="loading-spinner flex flex-row gap-2">
      <div className="dot w-4 h-4 rounded-full bg-[#DAB668]"></div>
      <div className="dot w-4 h-4 rounded-full bg-[#DAB668]"></div>
      <div className="dot w-4 h-4 rounded-full bg-[#DAB668]"></div>
    </div>
  );
};

// split text utility component for gsap
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

// main portal module
export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(true);
  const appRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    let lenis;
    let rafId;

    const initLenis = () => {
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
        window.lenisInstance = lenis; // Expose globally to fix scroll jumping
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

  useGSAP(() => {
    // Scroll header fade using ScrollTrigger
    gsap.to('.header-fade-text', {
      opacity: 0,
      y: -20,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "200px top",
        scrub: true
      }
    });

    if (splashDone) return;

    // Reset initial states for animations
    gsap.set('.header-fade-text .split-char', { opacity: 0, y: 40, scale: 0.5, rotationX: 90 });
    gsap.set('.header-logo', { opacity: 0, y: -20 });
    gsap.set('.loading-text .split-char', { opacity: 0, y: 60 });

    // master cinematic timeline for loading
    const tl = gsap.timeline();

    // 1. Loading Spinner Bounce
    tl.to('.loading-spinner .dot', {
      y: -15,
      duration: 0.4,
      stagger: {
        each: 0.15,
        repeat: 5,
        yoyo: true
      },
      ease: "sine.inOut"
    })
      .to('.loading-spinner', { scale: 0, opacity: 0, duration: 0.4, ease: "back.in(1.5)" })

      // 2. Doha Oasis Text Waves
      .to('.loading-text .split-char', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)"
      })
      .addLabel("waveOut", "+=0.1")

      // slide the text and spinner up synchronously with the wave
      .to('.loading-text-container', {
        y: "-100vh",
        duration: 1.2,
        ease: "power2.inOut"
      }, "waveOut");

    // 3. SVG Wave Transition
    const paths = svgRef.current ? svgRef.current.querySelectorAll('.shape-overlays__path') : [];
    if (paths.length) {
      const numPoints = 10;
      const numPaths = paths.length;
      const delayPointsMax = 0.3;
      const delayPerPath = 0; // Decreased to make the white wave thinner

      const allPoints = Array.from({ length: numPaths }, () => Array(numPoints).fill(100));
      const pointsDelay = Array.from({ length: numPoints }, () => Math.random() * delayPointsMax);

      const renderPath = (path, points) => {
        let d = `M 0 ${points[0]} C`;
        for (let j = 0; j < numPoints - 1; j++) {
          let p = (j + 1) / (numPoints - 1) * 100;
          let cp = p - (1 / (numPoints - 1) * 100) / 2;
          d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
        }
        d += ` V 0 H 0`;
        path.setAttribute("d", d);
      };

      for (let i = 0; i < numPaths; i++) {
        let points = allPoints[i];
        // Reverse delay so the top layer (i = numPaths - 1) animates first
        let pathDelay = delayPerPath * (numPaths - 1 - i);
        for (let j = 0; j < numPoints; j++) {
          tl.to(points, {
            [j]: 0,
            duration: 1.0,
            ease: "power2.inOut",
            onUpdate: () => renderPath(paths[i], points)
          }, `waveOut+=${pointsDelay[j] + pathDelay}`);
        }
      }
    }

    // 4. Main App Content Entrance
    tl.addLabel("contentReveal", "waveOut+=0.6");

    // make the app content fully visible instantly so the wave itself acts as the smooth reveal
    tl.set('.main-app-content', { 
      opacity: 1, 
      onComplete: () => {
        setScrollLocked(false);
        // give the dom a tiny beat to apply the unlocked height, then refresh scrolltrigger & lenis
        setTimeout(() => {
          ScrollTrigger.refresh();
          window.dispatchEvent(new Event('resize'));
        }, 50);
      }
    }, "waveOut+=0.2");

    // Hide the loading text behind the wave
    tl.to('.loading-text-container', {
      opacity: 0,
      duration: 0.5
    }, "waveOut");

    // signal the motioncarousel to start its internal blur reveal animation exactly now
    tl.call(() => setCarouselReady(true), null, "contentReveal");

    tl.to('.header-fade-text .split-char', {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      stagger: 0.04,
      ease: "back.out(2)",
      duration: 1.2
    }, "contentReveal")
      .to('.header-logo', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      }, "contentReveal")

      // unmount splash resources safely after everything is completely done
      .to({}, { duration: 1.0, onComplete: () => setSplashDone(true) });

  }, { scope: appRef });

  return (
    <div ref={appRef} className={`relative min-h-screen bg-black font-body text-white tracking-normal ${scrollLocked ? 'h-screen overflow-hidden' : ''}`}>

      {/* LOADING SCREEN */}
      {!splashDone && (
        <>
          {/* SVG WAVE TRANSITION OVERLAY */}
          <svg
            ref={svgRef}
            className="shape-overlays fixed inset-0 w-full h-full pointer-events-none z-[60]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </linearGradient>
            </defs>
            <path className="shape-overlays__path" fill="url(#gradient2)" d="M 0 100 V 0 H 100 V 100 Z"></path>
            <path className="shape-overlays__path" fill="url(#gradient1)" d="M 0 100 V 0 H 100 V 100 Z"></path>
          </svg>

          {/* LOADING TEXT & EFFECTS */}
          <div className="loading-text-container fixed inset-0 z-[70] flex flex-col items-center justify-center pointer-events-none">

            <div className="loading-spinner-wrapper absolute">
              <BouncyLoadingSpinner />
            </div>

            <div className="loading-text text-[#DAB668] font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase whitespace-nowrap text-center drop-shadow-2xl">
              <SplitText text="DOHA OASIS" />
            </div>
          </div>
        </>
      )}

      {/* FLOATING EDITORIAL HEADER */}
      <header className="fixed top-0 left-0 right-0 py-4 px-4 md:py-6 md:px-16 flex items-center justify-between gap-4 md:gap-0 z-40 pointer-events-none">
        {/* Left Side: Fades out on scroll */}
        <div className="header-fade-text text-white font-medium font-outfit text-xl md:text-2xl tracking-tight uppercase pointer-events-auto flex items-center pl-2 md:pl-10 origin-left" style={{ perspective: "1000px" }}>
          <SplitText text="Employee Benefits" className="!justify-start" wordSpace="mr-3" py="py-0" hiddenClass="" />
        </div>

        {/* Right Side: Anchored Branding */}
        <div className="header-logo pointer-events-auto h-16 md:h-24 flex items-center mt-1 md:mt-2 shrink-0">
          <img src="/logo.png" alt="Doha Oasis" className="h-12 md:h-18 w-auto object-contain mix-blend-multiply scale-110 md:scale-125 origin-right" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className={`main-app-content w-full relative z-0 ${!splashDone ? 'opacity-0' : 'opacity-100'}`}>

        <div className="w-full h-screen relative z-10">
          <MotionCarousel options={{ loop: true, align: 'start' }} isReady={carouselReady} />
        </div>

        <OffersSection offers={mockData} categories={categories} />

      </div>
    </div>
  );
}