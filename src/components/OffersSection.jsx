import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

const FilterIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
  </svg>
);

export function OffersSection({ offers, categories }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [displayOffers, setDisplayOffers] = useState(offers);
  const [activeModalOffer, setActiveModalOffer] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimatingFilter, setIsAnimatingFilter] = useState(false);
  const sectionRef = useRef(null);

  const getFilteredOffers = (search, category) => {
    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || offer.category === category;
      return matchesSearch && matchesCategory;
    });
  };
  
  // custom category click handler for gsap animation
  const handleFilterClick = (newCategory) => {
    if (isAnimatingFilter || newCategory === activeCategory) return;
    setIsAnimatingFilter(true);
    setActiveCategory(newCategory);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);

    const newOffers = getFilteredOffers(searchQuery, newCategory);
    
    // animate out current cards
    const cards = document.querySelectorAll('.offer-card-wrapper');
    if (cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in",
        onComplete: () => {
          setDisplayOffers(newOffers);
        }
      });
    } else {
      setDisplayOffers(newOffers);
    }
  };

  // when displayOffers updates, animate them in!
  useEffect(() => {
    const cards = document.querySelectorAll('.offer-card-wrapper');
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { opacity: 0, y: 40, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: "power2.out", 
          overwrite: "auto",
          onComplete: () => {
            setIsAnimatingFilter(false);
            ScrollTrigger.refresh();
          }
        }
      );
    } else {
      setTimeout(() => setIsAnimatingFilter(false), 0);
    }
  }, [displayOffers]);
  
  // quick search update without stagger (typing should feel instant)
  useEffect(() => {
    const newOffers = getFilteredOffers(searchQuery, activeCategory);
    setTimeout(() => setDisplayOffers(newOffers), 0);
  }, [searchQuery]);

  // keep user anchored to offerssection when filtering
  useEffect(() => {
    if (sectionRef.current) {
      const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY < sectionTop || window.scrollY > sectionTop) {
        window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    }
  }, [activeCategory]);

  useGSAP(() => {
    const desktopBar = document.querySelector('.floating-filter-bar');
    const mobileFab = document.querySelector('.mobile-fab-container');
    
    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      let { isDesktop, isMobile } = context.conditions;

      if (isDesktop && desktopBar) {
        gsap.set(desktopBar, { xPercent: -150, y: 0, opacity: 0 });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom top",
          onEnter: () => {
            if (!window.isCardHovered) gsap.to(desktopBar, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
          },
          onLeave: () => gsap.to(desktopBar, { xPercent: -150, opacity: 0, duration: 0.25, ease: "power3.in", overwrite: "auto" }),
          onEnterBack: () => {
            if (!window.isCardHovered) gsap.to(desktopBar, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
          },
          onLeaveBack: () => gsap.to(desktopBar, { xPercent: -150, opacity: 0, duration: 0.25, ease: "power3.in", overwrite: "auto" })
        });
      }

      if (isMobile && mobileFab) {
        gsap.set(mobileFab, { y: 150, opacity: 0 });
        
        let inHeroSection = true;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 80%", 
          end: "bottom top",
          onEnter: () => {
            inHeroSection = false;
            gsap.to(mobileFab, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)", overwrite: "auto" });
          },
          onLeave: () => {
             gsap.to(mobileFab, { y: 150, opacity: 0, duration: 0.25, ease: "power3.in", overwrite: "auto" });
          },
          onEnterBack: () => {
             inHeroSection = false;
             gsap.to(mobileFab, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)", overwrite: "auto" });
          },
          onLeaveBack: () => {
            inHeroSection = true;
            gsap.to(mobileFab, { y: 150, opacity: 0, duration: 0.25, ease: "power3.in", overwrite: "auto" });
          }
        });

        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (inHeroSection) return;
            if (Math.abs(self.getVelocity()) > 2) {
              if (self.direction === 1) { 
                gsap.to(mobileFab, { y: 150, opacity: 0, duration: 0.2, ease: "power3.out", overwrite: "auto" });
              } else if (self.direction === -1) { 
                gsap.to(mobileFab, { y: 0, opacity: 1, duration: 0.2, ease: "back.out(1.5)", overwrite: "auto" });
              }
            }
          }
        });
      }
    });
  }, { scope: sectionRef }); // Empty dependencies so sidebar doesn't re-render on typing

  // hover animations using gsap
  const { contextSafe } = useGSAP({ scope: sectionRef });

  const handleMouseEnter = contextSafe((e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    // eslint-disable-next-line react-hooks/immutability
    window.isCardHovered = true;
    const card = e.currentTarget;
    const title = card.querySelector('.offer-title');
    const subtitle = card.querySelector('.offer-subtitle');
    const arrow = card.querySelector('.offer-arrow');
    const overlay = card.querySelector('.offer-overlay');

    // slide sidebar out and hide securely
    if (window.innerWidth >= 768) {
      gsap.to('.floating-filter-bar', { xPercent: -150, opacity: 0, duration: 0.2, ease: "power3.in", overwrite: "auto" });
    }


    // enlarge the entire card box slightly
    gsap.to(card, { scale: 1.03, duration: 0.8, ease: "power3.out", overwrite: "auto" });

    // play the full screen background video for this card
    const offerId = card.getAttribute('data-offer-id');
    const bgVideo = document.getElementById(`bg-video-${offerId}`);
    if (bgVideo) {
      bgVideo.currentTime = 0;
      bgVideo.play().catch(e => console.log("Autoplay blocked", e));
      gsap.to(bgVideo, { opacity: 0.6, duration: 1.0, ease: "power2.out", overwrite: "auto" });
    }

    // fade out everything except the text
    const imageContainer = card.querySelector('.parallax-container');
    const cardBg = card.querySelector('.card-bg');
    if (imageContainer) gsap.to(imageContainer, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (cardBg) gsap.to(cardBg, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });

    gsap.to(title, { scale: 1.05, duration: 0.8, ease: "power3.out" });
    if (subtitle) gsap.to(subtitle, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power2.out" });
    if (arrow) gsap.to(arrow, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
  });

  const handlePointerMove = contextSafe((e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    // normalize mouse position to -0.5 to 0.5 relative to the card
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;

    // tilt the card physically based on mouse movement
    gsap.to(card, {
      rotationX: yPos * -15, // max 15 degree tilt
      rotationY: xPos * 15,
      duration: 1.0,
      ease: "power3.out",
      overwrite: "auto"
    });

    // parallax the image in the opposite direction
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
    if (window.matchMedia('(hover: none)').matches) return;
    // eslint-disable-next-line react-hooks/immutability
    window.isCardHovered = false;
    const card = e.currentTarget;
    const title = card.querySelector('.offer-title');
    const subtitle = card.querySelector('.offer-subtitle');
    const arrow = card.querySelector('.offer-arrow');
    const overlay = card.querySelector('.offer-overlay');

    // show the sidebar again securely
    if (window.innerWidth >= 768) {
      gsap.to('.floating-filter-bar', { xPercent: 0, opacity: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    }

    // return card to normal scale and reset 3d rotation
    gsap.to(card, { scale: 1, rotationX: 0, rotationY: 0, duration: 0.8, ease: "power3.inOut", overwrite: "auto" });

    const content = card.querySelector('.z-30');
    if (content) {
      gsap.to(content, { x: 0, y: 0, duration: 0.8, ease: "power3.inOut", overwrite: "auto" });
    }

    // stop full screen background video
    const offerId = card.getAttribute('data-offer-id');
    const bgVideo = document.getElementById(`bg-video-${offerId}`);
    if (bgVideo) {
      gsap.to(bgVideo, { opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => bgVideo.pause(), overwrite: "auto" });
    }

    // bring card image and backgrounds back
    const imageContainer = card.querySelector('.parallax-container');
    const cardBg = card.querySelector('.card-bg');
    if (imageContainer) gsap.to(imageContainer, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (cardBg) gsap.to(cardBg, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });

    gsap.to(title, { scale: 1, duration: 0.8, ease: "power3.out" });
    if (subtitle) gsap.to(subtitle, { opacity: 0, y: 20, duration: 0.5, ease: "power2.in" });
    if (arrow) gsap.to(arrow, { opacity: 0, y: 20, duration: 0.5, ease: "power2.in" });
  });



  const openModal = contextSafe((offer) => {
    setActiveModalOffer(offer);
    if (window.lenisInstance) window.lenisInstance.stop(); // Pause smooth scrolling
    // eslint-disable-next-line react-hooks/immutability
    else document.body.style.overflow = 'hidden';
  });

  const closeModal = contextSafe(() => {
    gsap.to('.offer-modal-overlay', {
      opacity: 0,
      backdropFilter: "blur(0px)",
      duration: 0.5,
      ease: "power2.inOut"
    });
    gsap.to('.offer-modal-content', {
      y: 50,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        setActiveModalOffer(null);
        if (window.lenisInstance) window.lenisInstance.start();
        else document.body.style.overflow = '';
      }
    });
  });

  // ensure gsap scrolltriggers refresh their calculations
  useEffect(() => {
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timeout);
  }, [displayOffers]);

  return (
    <section ref={sectionRef} className="relative w-full bg-transparent">
      
      {/* fixed full screen background videos */}
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

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex floating-filter-bar fixed top-1/2 left-6 -translate-y-1/2 z-50 flex-col items-start gap-4 px-4 py-6 bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-48">
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
        <div className="w-full h-px bg-white/10"></div>
        {/* Categories */}
        <div className="flex flex-col gap-2 w-full mt-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterClick(category)}
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

      {/* MOBILE FAB MENU */}
      <div className="mobile-fab-container md:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
         {/* Menu Overlay */}
         <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom-right ${isMobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
           <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex flex-col gap-4 w-[250px]">
              
              <div className="flex items-center gap-3 w-full px-2">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none w-full placeholder-white/40 text-sm font-body"
                />
              </div>
              <div className="w-full h-px bg-white/10"></div>
              
              <div className="flex flex-col gap-2 w-full">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleFilterClick(category)}
                    className={`w-full text-left py-2 px-4 text-sm font-medium rounded-xl transition-colors duration-300 ${activeCategory === category
                        ? 'bg-[#DAB668] text-[#111]'
                        : 'text-white/60 active:bg-white/10'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
           </div>
         </div>

         {/* The FAB Button */}
         <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="mobile-fab w-14 h-14 bg-[#DAB668] rounded-full shadow-[0_0_20px_rgba(218,182,104,0.4)] flex items-center justify-center text-black will-change-transform active:scale-95 transition-transform"
         >
            <FilterIcon />
         </button>
      </div>

        <div className="w-full flex flex-col pb-32 relative z-10">
          {/* List of Full-Screen Cards */}
          {displayOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              handleMouseEnter={handleMouseEnter}
              handlePointerMove={handlePointerMove}
              handleMouseLeave={handleMouseLeave}
              onClick={() => openModal(offer)}
            />
          ))}
        </div>

        {/* The Cinematic Modal */}
        {activeModalOffer && (
          <OfferModal offer={activeModalOffer} onClose={closeModal} />
        )}
      </section>
    );
  }
  
  // refactored sub-component without gsap entry animation to prevent flashes on rapid typing
  const OfferCard = ({ offer, handleMouseEnter, handlePointerMove, handleMouseLeave, onClick }) => {
    const cardContainerRef = useRef(null);
  
    useGSAP(() => {
      const card = cardContainerRef.current.querySelector('.offer-card');
      
      // inner image parallax tracked to native window scroll
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
      <div 
        ref={cardContainerRef} 
        className="offer-card-wrapper w-full h-screen flex-shrink-0 flex flex-col justify-center items-center px-4 md:px-12 py-12"
      >
        <div
          className="offer-card relative w-full max-w-6xl h-[70vh] md:h-[75vh] rounded-none overflow-hidden cursor-pointer flex items-center justify-center will-change-transform"
          data-offer-id={offer.id}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handlePointerMove}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
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
  
          {/* Hover Arrow (Desktop Only) */}
          <div 
            className="offer-arrow hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-white/30 items-center justify-center opacity-0 translate-y-5 backdrop-blur-md bg-black/20 z-40 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -15, rotation: 360, backgroundColor: "#ffffff", scale: 1.1, duration: 0.6, ease: "back.out(2)", overwrite: "auto" });
              const svg = e.currentTarget.querySelector('svg');
              if (svg) gsap.to(svg, { color: "#000000", duration: 0.3 });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, rotation: 0, backgroundColor: "rgba(0,0,0,0.2)", scale: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" });
              const svg = e.currentTarget.querySelector('svg');
              if (svg) gsap.to(svg, { color: "#ffffff", duration: 0.3 });
            }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

        </div>
      </div>
    );
  };

  // cinematic glassmorphism modal component
  const OfferModal = ({ offer, onClose }) => {
    const modalRef = useRef(null);

    useGSAP(() => {
      // animate overlay background
      gsap.fromTo('.offer-modal-overlay', 
        { opacity: 0, backdropFilter: "blur(0px)" },
        { opacity: 1, backdropFilter: "blur(24px)", duration: 0.8, ease: "power3.out" }
      );
      
      // animate modal content sliding up and fading in
      gsap.fromTo('.offer-modal-content',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );

      // stagger terms list
      gsap.fromTo('.modal-term-item',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power2.out", delay: 0.4 }
      );
    }, { scope: modalRef });

    return (
      <div ref={modalRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 pointer-events-auto">
        {/* Clickable Backdrop overlay */}
        <div 
          className="offer-modal-overlay absolute inset-0 bg-black/60 cursor-pointer" 
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="offer-modal-content relative w-[95vw] max-w-6xl bg-[#1f2022] backdrop-blur-3xl rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left Side: Image/Branding (Hidden on mobile) */}
          <div className="hidden md:block w-2/5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50 z-10" />
            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
          </div>

          {/* Right Side: Deep Details */}
          <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col justify-center">
            
            <span className="text-[#DAB668] font-body text-xs tracking-[0.2em] uppercase mb-2">
              {offer.category}
            </span>
            
            <h2 className="text-white text-3xl md:text-5xl font-heading font-light tracking-wide leading-tight mb-4">
              {offer.title}
            </h2>

            <p className="text-white/80 font-body text-sm leading-relaxed mb-6">
              {offer.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] tracking-wider uppercase mb-1">Validity</span>
                <span className="text-white text-sm">{offer.validity}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] tracking-wider uppercase mb-1">Location</span>
                <span className="text-white text-sm whitespace-pre-line">{offer.location}</span>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 mb-6" />

            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] tracking-wider uppercase mb-2">Terms & Conditions</span>
              <ul className="space-y-1.5">
                {offer.terms?.map((term, i) => (
                  <li key={i} className="modal-term-item flex items-start text-white/70 text-[13px] leading-tight">
                    <span className="mr-2 text-[#DAB668] mt-0.5">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button className="mt-8 bg-[#DAB668] hover:bg-[#c4a15a] text-[#111] py-3 px-8 rounded-none font-medium tracking-wide transition-colors self-start shadow-xl">
              Redeem Offer
            </button>
          </div>
        </div>
      </div>
    );
  };
