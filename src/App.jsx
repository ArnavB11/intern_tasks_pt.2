// --- imports ---
import { useState, useRef, useEffect } from 'react';
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

// --- loading spinner component ---
const BouncyLoadingSpinner = () => {
  return (
    <div className="loading-spinner flex flex-row gap-2">
      <div className="dot w-4 h-4 rounded-full bg-[#DAB668]"></div>
      <div className="dot w-4 h-4 rounded-full bg-[#DAB668]"></div>
      <div className="dot w-4 h-4 rounded-full bg-[#DAB668]"></div>
    </div>
  );
};

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
  const [splashDone, setSplashDone] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(true);
  const appRef = useRef(null);
  const svgRef = useRef(null);

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

    if (splashDone) {
      gsap.set('.main-app-content', { opacity: 1 });
      
      // nav bar initial state
      gsap.set('.nav-bar-container', { clearProps: "all" });
      gsap.set('.search-input-wrapper', { clearProps: "all" });
      gsap.set('.categories-container', { clearProps: "all" });
      gsap.set('.divider', { clearProps: "all" });

      gsap.fromTo('.header-fade-text .split-char', 
        { opacity: 0, y: 40, scale: 0.5, rotationX: 90 },
        { opacity: 1, y: 0, scale: 1, rotationX: 0, stagger: 0.04, ease: "back.out(2)", duration: 1.2, delay: 0.2 }
      );
      gsap.set('.header-logo', { opacity: 1, y: 0 });
      gsap.fromTo('.carousel-container', 
        { scale: 1.05, y: 40, boxShadow: "0 30px 60px -15px rgba(0,0,0,0)", clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }, 
        { scale: 1, y: 0, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", boxShadow: "0 30px 60px -15px rgba(0,0,0,0.3)", duration: 1.2, ease: "power3.out", clearProps: "all" }
      );

      // nav bar fade in
      gsap.fromTo('.nav-bar-container', 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: 0.4, clearProps: "all" }
      );

      return;
    }

    // reset initial states for animations
    gsap.set('.header-fade-text .split-char', { opacity: 0, y: 40, scale: 0.5, rotationX: 90 });
    gsap.set('.header-logo', { opacity: 0, y: -20 });
    gsap.set('.loading-text .split-char', { opacity: 0, y: 60 });
    gsap.set('.carousel-container', { scale: 1.05, y: 80, boxShadow: "0 30px 60px -15px rgba(0,0,0,0)", clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" });

    // nav bar initial state for first load
    gsap.set('.nav-bar-container', { y: -30, opacity: 0, width: "52px", overflow: "hidden" });
    gsap.set('.search-input-wrapper', { opacity: 0 });
    gsap.set('.categories-container', { opacity: 0 });
    gsap.set('.divider', { opacity: 0 });

    // master cinematic timeline for loading
    const tl = gsap.timeline();

    // 1. loading spinner bounce
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

      // 2. doha oasis text waves
      .to('.loading-text .split-char', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)"
      })
      .addLabel("waveOut", "+=0.2")

      // elegantly scale down and fade out the text as the wave lifts
      .to('.loading-text-container', {
        y: "-30vh",
        scale: 0.9,
        opacity: 0,
        duration: 1.0,
        ease: "power2.inOut"
      }, "waveOut");

    // 3. svg wave transition
    const paths = svgRef.current ? svgRef.current.querySelectorAll('.shape-overlays__path') : [];
    if (paths.length) {
      const numPoints = 10;
      const numPaths = paths.length;
      const delayPointsMax = 0.3;
      const delayPerPath = 0.08;

      const allPoints = Array.from({ length: numPaths }, () => Array(numPoints).fill(100));
      const pointsDelay = Array.from({ length: numPoints }, () => Math.random() * delayPointsMax);

      const renderPath = (path, points) => {
        let d = `M 0 ${points[0].toFixed(2)} C`;
        for (let j = 0; j < numPoints - 1; j++) {
          let p = (j + 1) / (numPoints - 1) * 100;
          let cp = p - (1 / (numPoints - 1) * 100) / 2;
          d += ` ${cp.toFixed(2)} ${points[j].toFixed(2)} ${cp.toFixed(2)} ${points[j + 1].toFixed(2)} ${p.toFixed(2)} ${points[j + 1].toFixed(2)}`;
        }
        d += ` V 0 H 0`;
        path.setAttribute("d", d);
      };

      for (let i = 0; i < numPaths; i++) {
        let points = allPoints[i];
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

    // 4. main app content entrance
    tl.addLabel("contentReveal", "waveOut+=0.3");

    // smoothly crossfade the app content in as the wave reveals it
    tl.to('.main-app-content', {
      opacity: 1,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        setScrollLocked(false);
        // give the dom a tiny beat to apply the unlocked height, then refresh scrolltrigger & lenis
        setTimeout(() => {
          ScrollTrigger.refresh();
          window.dispatchEvent(new Event('resize'));
        }, 50);
      }
    }, "waveOut");

    // hide the loading text smoothly by sliding it up with the bg
    tl.to('.loading-text-container', {
      y: "-100vh",
      duration: 1.2,
      ease: "power2.inOut"
    }, "waveOut");

    // signal the motioncarousel to start its internal blur reveal animation exactly now
    tl.call(() => setCarouselReady(true), null, "contentReveal");

    tl.to('.carousel-container', {
      scale: 1,
      y: 0,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      duration: 1.8,
      ease: "power3.out",
      clearProps: "transform,clipPath"
    }, "contentReveal");

    tl.to('.carousel-container', {
      boxShadow: "0 30px 60px -15px rgba(0,0,0,0.3)",
      duration: 3.0,
      ease: "sine.inOut"
    }, "contentReveal+=0.5");

    // nav bar pill expansion synced with contentReveal
    tl.to('.nav-bar-container', { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "contentReveal")
      .to('.nav-bar-container', { width: "auto", duration: 1.2, ease: "expo.out", clearProps: "width,overflow" }, "contentReveal+=0.3")
      .to('.search-input-wrapper', { opacity: 1, duration: 0.8, ease: "power2.out" }, "contentReveal+=0.6")
      .to('.divider', { opacity: 1, duration: 0.6 }, "contentReveal+=0.8")
      .to('.categories-container', { opacity: 1, duration: 0.8, clearProps: "all" }, "contentReveal+=0.8");

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
      .to({}, { duration: 1.0, onComplete: () => {
        setSplashDone(true);
      }});

  }, { scope: appRef });

  // --- render jsx ---
  return (
    <div ref={appRef} className={`app-container relative min-h-screen bg-white font-body text-slate-900 tracking-normal ${scrollLocked ? 'h-screen overflow-hidden' : ''}`}>

      {/* --- loading screen --- */}
      {!splashDone && (
        <>
          {/* svg wave transition overlay */}
          <svg
            ref={svgRef}
            className="shape-overlays fixed inset-0 w-full h-full pointer-events-none z-[60]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path className="shape-overlays__path" fill="#000000" d="M 0 100 V 0 H 100 V 100 Z"></path>
          </svg>

          {/* loading text & effects */}
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
      <div className={`main-app-content w-full relative z-0 pt-24 md:pt-32 ${!splashDone ? 'opacity-0' : 'opacity-100'}`}>

        <div className="carousel-container w-full max-w-[92%] md:max-w-[85%] mx-auto h-[60vh] md:h-[70vh] mb-16 relative z-10 rounded-none overflow-hidden border border-slate-200">
          <MotionCarousel options={{ loop: true, align: 'start' }} isReady={carouselReady} />
        </div>

        <OffersSection offers={mockData} categories={categories} splashDone={splashDone} />

      </div>
    </div>
  );
}