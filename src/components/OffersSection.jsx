import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

export function OffersSection({ offers, categories }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const sectionRef = useRef(null);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || offer.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Keep user anchored to OffersSection when filtering so they don't get thrown to the top carousel
  useEffect(() => {
    if (sectionRef.current) {
      // Find the absolute top of the offers section
      const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      
      // If the user is currently scrolled past the top of the offers section, 
      // or if they are in the carousel, lock them to the start of the offers section
      if (window.scrollY < sectionTop || window.scrollY > sectionTop) {
        // We only do this if they are actively using the sidebar (e.g. typing or clicking a category)
        // Actually, let's just scroll them to the section top smoothly
        window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        
        // Refresh ScrollTrigger to fix layout shifts after filtering
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    }
  }, [activeCategory, searchQuery]);

  useGSAP(() => {
    // Floating Minimalist Sidebar logic
    const floatingBar = document.querySelector('.floating-filter-bar');
    if (floatingBar) {
      gsap.set(floatingBar, { xPercent: -150, opacity: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom top",
        onEnter: () => {
          if (!window.isCardHovered) gsap.to(floatingBar, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        },
        onLeave: () => gsap.to(floatingBar, { xPercent: -150, opacity: 0, duration: 0.25, ease: "power3.in", overwrite: "auto" }),
        onEnterBack: () => {
          if (!window.isCardHovered) gsap.to(floatingBar, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        },
        onLeaveBack: () => gsap.to(floatingBar, { xPercent: -150, opacity: 0, duration: 0.25, ease: "power3.in", overwrite: "auto" })
      });
    }
  }, { scope: sectionRef }); // Empty dependencies so sidebar doesn't re-render on typing

  // Hover Animations using GSAP
  const { contextSafe } = useGSAP({ scope: sectionRef });

  const handleMouseEnter = contextSafe((e) => {
    window.isCardHovered = true;
    const card = e.currentTarget;
    const video = card.querySelector('.offer-video');
    const title = card.querySelector('.offer-title');
    const subtitle = card.querySelector('.offer-subtitle');
    const arrow = card.querySelector('.offer-arrow');
    const overlay = card.querySelector('.offer-overlay');

    // Slide sidebar to the left and hide securely (snappy)
    gsap.to('.floating-filter-bar', { xPercent: -150, opacity: 0, duration: 0.2, ease: "power3.in", overwrite: "auto" });

    // Enlarge the entire card box slightly
    gsap.to(card, { scale: 1.03, duration: 0.8, ease: "power3.out", overwrite: "auto" });

    // Play the FULL SCREEN background video for this card
    const offerId = card.getAttribute('data-offer-id');
    const bgVideo = document.getElementById(`bg-video-${offerId}`);
    if (bgVideo) {
      bgVideo.currentTime = 0;
      bgVideo.play().catch(e => console.log("Autoplay blocked", e));
      gsap.to(bgVideo, { opacity: 0.6, duration: 1.0, ease: "power2.out", overwrite: "auto" });
    }

    // Fade out everything except the text so it looks like the block completely disappeared
    const imageContainer = card.querySelector('.parallax-container');
    const cardBg = card.querySelector('.card-bg');
    if (imageContainer) gsap.to(imageContainer, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (cardBg) gsap.to(cardBg, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });

    gsap.to(title, { scale: 1.05, duration: 0.8, ease: "power3.out" });
    if (subtitle) gsap.to(subtitle, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power2.out" });
    gsap.to(arrow, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
  });

  const handlePointerMove = contextSafe((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    // Normalize mouse position to -0.5 to 0.5 relative to the card
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;

    // Tilt the card physically (Mouse down = tilts up, Mouse right = tilts right)
    gsap.to(card, {
      rotationX: yPos * -15, // max 15 degree tilt
      rotationY: xPos * 15,
      duration: 1.0,
      ease: "power3.out",
      overwrite: "auto"
    });

    // Parallax the image in the opposite direction
    const content = card.querySelector('.z-30');
    if (content) {
      gsap.to(content, {
        x: xPos * -30,
        y: yPos * -30,
        duration: 1.0,
        ease: "power3.out",
        overwrite: "auto"
      });
    }
  });

  const handleMouseLeave = contextSafe((e) => {
    window.isCardHovered = false;
    const card = e.currentTarget;
    const video = card.querySelector('.offer-video');
    const title = card.querySelector('.offer-title');
    const subtitle = card.querySelector('.offer-subtitle');
    const arrow = card.querySelector('.offer-arrow');
    const overlay = card.querySelector('.offer-overlay');

    // Show the sidebar again securely
    gsap.to('.floating-filter-bar', { xPercent: 0, opacity: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });

    // Return card to normal scale and reset 3D rotation
    gsap.to(card, { scale: 1, rotationX: 0, rotationY: 0, duration: 0.8, ease: "power3.inOut", overwrite: "auto" });

    const content = card.querySelector('.z-30');
    if (content) {
      gsap.to(content, { x: 0, y: 0, duration: 0.8, ease: "power3.inOut", overwrite: "auto" });
    }

    // Stop FULL SCREEN background video
    const offerId = card.getAttribute('data-offer-id');
    const bgVideo = document.getElementById(`bg-video-${offerId}`);
    if (bgVideo) {
      gsap.to(bgVideo, { opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => bgVideo.pause(), overwrite: "auto" });
    }

    // Bring card image and backgrounds back
    const imageContainer = card.querySelector('.parallax-container');
    const cardBg = card.querySelector('.card-bg');
    if (imageContainer) gsap.to(imageContainer, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (cardBg) gsap.to(cardBg, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });

    gsap.to(title, { scale: 1, duration: 0.8, ease: "power3.out" });
    if (subtitle) gsap.to(subtitle, { opacity: 0, y: 20, duration: 0.5, ease: "power2.in" });
    gsap.to(arrow, { opacity: 0, y: 20, duration: 0.5, ease: "power2.in" });
  });

  const handleNavEnter = contextSafe((e) => {
    // Bounce up and enlarge towards the user
    gsap.to(e.currentTarget, { y: -4, scale: 1.1, duration: 0.5, ease: "back.out(2)", overwrite: "auto", zIndex: 10 });
  });

  const handleNavLeave = contextSafe((e) => {
    gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.5, ease: "power2.out", overwrite: "auto", zIndex: 1 });
  });

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Anchor the viewport to the top of the section so shrinking heights don't force a jump
    if (sectionRef.current) {
      if (window.lenisInstance) {
        window.lenisInstance.scrollTo(sectionRef.current, { offset: 0, duration: 1.0 });
      } else {
        window.scrollTo({ top: sectionRef.current.offsetTop, behavior: 'smooth' });
      }
    }
  };

  // Ensure GSAP ScrollTriggers refresh their calculations after layout height shrinks/grows
  useEffect(() => {
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timeout);
  }, [filteredOffers]);

  return (
    <section ref={sectionRef} className="relative w-full bg-transparent">
      
      {/* FIXED FULL SCREEN BACKGROUND VIDEOS */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-black">
        {offers.map((offer) => (
          offer.video && (
            <video
              key={offer.id}
              id={`bg-video-${offer.id}`}
              src={offer.video}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0"
            />
          )
        ))}
        {/* Dark overlay to ensure foreground elements are readable */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* FLOATING LEFT SIDEBAR */}
      <div className="floating-filter-bar fixed top-1/2 left-6 -translate-y-1/2 z-50 flex flex-col items-start gap-4 px-4 py-6 bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-48">

        {/* Search */}
        <div className="flex items-center gap-3 w-full">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none w-full placeholder-white/40 text-sm font-body"
          />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10"></div>

        {/* Categories */}
        <div className="flex flex-col gap-2 w-full mt-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={handleNavEnter}
              onMouseLeave={handleNavLeave}
              className={`relative w-full text-left py-2 px-4 text-sm font-medium rounded-xl will-change-transform transition-colors duration-300 ${activeCategory === category
                  ? 'bg-[#DAB668] text-[#111]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

        <div className="w-full flex flex-col pb-32 relative z-10">
          {/* List of Full-Screen Cards */}
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              handleMouseEnter={handleMouseEnter}
              handlePointerMove={handlePointerMove}
              handleMouseLeave={handleMouseLeave}
            />
          ))}
        </div>
      </section>
    );
  }
  
  // Refactored sub-component without GSAP entry animation to prevent flashes on rapid typing
  const OfferCard = ({ offer, handleMouseEnter, handlePointerMove, handleMouseLeave }) => {
    const cardContainerRef = useRef(null);
  
    useGSAP(() => {
      const card = cardContainerRef.current.querySelector('.offer-card');
      
      // Inner Image Parallax tracked to native window scroll
      const imgContainer = card.querySelector('.parallax-container');
      if (imgContainer) {
        gsap.fromTo(imgContainer,
          { y: "-15%" },
          {
            y: "15%",
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }
    }, { scope: cardContainerRef });
  
    return (
      <div ref={cardContainerRef} className="w-full h-screen flex-shrink-0 flex flex-col justify-center items-center px-4 md:px-12 py-12">
        <div
          className="offer-card relative w-full max-w-6xl h-[70vh] md:h-[75vh] rounded-none overflow-hidden cursor-pointer flex items-center justify-center will-change-transform"
          data-offer-id={offer.id}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handlePointerMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Z-[-1]: Fading Card Background Layer */}
          <div className="card-bg absolute inset-0 bg-black backdrop-blur-sm border border-white/10 shadow-2xl z-[-1] pointer-events-none" />
  
          {/* Z-0: Parallax Image Container */}
          <div className="parallax-container absolute inset-[-15%] z-0 pointer-events-none">
            {offer.image && (
              <img
                src={offer.image}
                className="offer-image absolute inset-0 w-full h-full object-cover opacity-100"
                alt={offer.title}
              />
            )}
          </div>
  
          {/* Z-20: Dynamic Overlay Layer (Lighter, just for text readability) */}
          <div className="offer-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none z-20" />
  
          {/* Z-30: Card Content Layer */}
          <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <span className="text-white font-body text-xs md:text-sm tracking-[0.2em] uppercase mb-6 opacity-80">
              {offer.category}
            </span>
  
            <h3 className="offer-title text-white text-4xl md:text-6xl lg:text-7xl font-heading font-light tracking-wide">
              {offer.title}
            </h3>
  
            {offer.subtitle && (
              <p className="offer-subtitle text-white/60 font-body text-sm md:text-base mt-8 max-w-lg whitespace-pre-line opacity-0 translate-y-5">
                {offer.subtitle}
              </p>
            )}
          </div>
  
          {/* Hover Arrow */}
          <div className="offer-arrow absolute bottom-10 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-white/30 flex items-center justify-center opacity-0 translate-y-5 backdrop-blur-md bg-black/20 z-30 pointer-events-none">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
  
        </div>
      </div>
    );
  };
