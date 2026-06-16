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

export function OffersSection({ offers, categories, splashDone }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [displayOffers, setDisplayOffers] = useState(offers);
  const [activeModalOffer, setActiveModalOffer] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimatingFilter, setIsAnimatingFilter] = useState(false);
  const sectionRef = useRef(null);
  const isInitialMount = useRef(true);

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
        scale: 0.85,
        rotationX: 10,
        y: -40,
        filter: "blur(8px)",
        duration: 0.3,
        stagger: 0.03,
        ease: "power3.in",
        onComplete: () => {
          setDisplayOffers(newOffers);
        }
      });
    } else {
      setDisplayOffers(newOffers);
    }
  };

  // when displayOffers updates, animate them in!
  useGSAP(() => {
    const cards = document.querySelectorAll('.offer-card-wrapper');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, scale: 1.15, rotationX: -10, y: 40, filter: "blur(8px)" },
        {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          delay: 0,
          stagger: 0.05,
          ease: "expo.out",
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
  }, { dependencies: [displayOffers], scope: sectionRef });

  // quick search update without stagger (typing should feel instant)
  useEffect(() => {
    const newOffers = getFilteredOffers(searchQuery, activeCategory);
    setTimeout(() => setDisplayOffers(newOffers), 0);
  }, [searchQuery]);

  // keep user anchored to offerssection when filtering
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (sectionRef.current) {
      if (window.lenisInstance) {
        // use Lenis native scroll to target element directly
        window.lenisInstance.scrollTo(sectionRef.current, { offset: 0, duration: 0.8 });
      } else {
        // fallback
        const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: sectionTop, behavior: 'smooth' });
      }
    }
  }, [activeCategory]);



  // hover animations using gsap
  const { contextSafe } = useGSAP({ scope: sectionRef });

  const handleMouseEnter = contextSafe((e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    // eslint-disable-next-line react-hooks/immutability
    window.isCardHovered = true;
    const card = e.currentTarget;

    // simple float up and slight scale
    gsap.to(card, { y: -3, scale: 1.005, duration: 0.4, ease: "power2.out", overwrite: "auto" });

    // bounce and enlarge image slightly
    const imageContainer = card.querySelector('.parallax-container');
    if (imageContainer) gsap.to(imageContainer, { scale: 1.02, duration: 0.4, ease: "power2.out", overwrite: "auto" });
  });



  const handleMouseLeave = contextSafe((e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    // eslint-disable-next-line react-hooks/immutability
    window.isCardHovered = false;
    const card = e.currentTarget;

    // return card to normal position
    gsap.to(card, { scale: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });

    // return image scale back to normal
    const imageContainer = card.querySelector('.parallax-container');
    if (imageContainer) gsap.to(imageContainer, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
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
    <section ref={sectionRef} className="relative w-full bg-white">



      {/* HORIZONTAL NAV BAR */}
      <div className="flex justify-center w-full sticky top-20 md:top-24 z-40 mb-12 px-4 h-[70px]">
        <div className="nav-bar-container flex flex-row items-center p-2.5 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-full max-w-full mx-auto h-[52px]">
          
          <div className="search-container flex items-center justify-center shrink-0 px-2">
            <SearchIcon />
            <div className="search-input-wrapper overflow-hidden ml-2.5 flex items-center shrink-0">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-slate-900 focus:outline-none w-[140px] md:w-[180px] placeholder-slate-400 text-[15px] font-body"
              />
            </div>
          </div>

          <div className="divider w-px h-6 bg-slate-200 shrink-0 mx-3"></div>

          <div className="categories-container hidden md:flex items-center gap-1.5 shrink-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterClick(category)}
                className={`whitespace-nowrap px-5 py-2 text-[15px] font-medium rounded-full transition-colors duration-300 will-change-transform ${activeCategory === category
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <button
            className="md:hidden flex items-center justify-center p-2 mx-1 rounded-full hover:bg-slate-100 text-slate-900 transition-colors shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col pb-32 relative z-10">
        {/* List of Full-Screen Cards */}
        {displayOffers.map((offer) => (
          <OfferCard
            key={`${activeCategory}-${offer.id}`}
            offer={offer}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            onClick={() => openModal(offer)}
          />
        ))}
      </div>

      {/* The Cinematic Modal */}
      {activeModalOffer && (
        <OfferModal offer={activeModalOffer} onClose={closeModal} />
      )}

      {/* Mobile Filter Menu */}
      {isMobileMenuOpen && (
        <>
          <style>{`
            @keyframes slideUpFast {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            @keyframes fadeInFast {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" style={{ animation: 'fadeInFast 0.3s ease-out forwards' }} onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-full bg-white rounded-t-3xl p-6 pb-12 shadow-2xl border-t border-slate-100" style={{ animation: 'slideUpFast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-heading mb-4 text-slate-900">Filter Offers</h3>
              <div className="flex flex-col gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      handleFilterClick(category);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-base font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// refactored sub-component without gsap entry animation to prevent flashes on rapid typing
const OfferCard = ({ offer, handleMouseEnter, handleMouseLeave, onClick }) => {
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
      className="offer-card-wrapper w-full px-4 md:px-12 py-3 md:py-4"
    >
      <div
        className="offer-card relative w-full max-w-6xl mx-auto h-[120px] md:h-[180px] rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer flex flex-row bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-shadow duration-300 will-change-transform group"
        data-offer-id={offer.id}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if (window.innerWidth < 768) {
            onClick();
          }
        }}
      >
        {/* Left Side: Image */}
        <div className="card-image-container relative h-full w-[100px] md:w-[280px] shrink-0 overflow-hidden border-r border-slate-100">
          <div className="parallax-container absolute inset-[-15%] z-0 pointer-events-none">
            {offer.image && (
              <img
                src={offer.image}
                className="offer-image absolute inset-0 w-full h-full object-cover opacity-100"
                alt={offer.title}
              />
            )}
          </div>
        </div>

        {/* Middle Side: Text Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-4 md:px-10 py-2 md:py-4 h-full relative z-30 pointer-events-none bg-white">
          <span className="text-slate-500 font-body text-[10px] md:text-xs tracking-widest uppercase mb-0.5 md:mb-2">
            {offer.category}
          </span>
          <h3 className="offer-title text-slate-900 text-base md:text-3xl font-heading font-light tracking-wide truncate">
            {offer.title}
          </h3>
          {offer.subtitle && (
            <p className="offer-subtitle text-slate-600 font-body text-xs md:text-sm mt-0.5 md:mt-2 line-clamp-1 md:line-clamp-2">
              {offer.subtitle}
            </p>
          )}
        </div>

        {/* Right Side: Arrow Container (Desktop Only) */}
        <div className="hidden md:flex w-[140px] shrink-0 h-full items-center justify-center bg-slate-50/50 border-l border-slate-100 relative">
          <div
            className="offer-arrow w-8 h-8 md:w-14 md:h-14 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm z-40 cursor-pointer pointer-events-none group-hover:pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -15, rotation: 360, backgroundColor: "#000000", scale: 1.1, duration: 0.6, ease: "back.out(2)", overwrite: "auto" });
              const svg = e.currentTarget.querySelector('svg');
              if (svg) gsap.to(svg, { color: "#ffffff", duration: 0.3 });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, rotation: 0, backgroundColor: "#ffffff", scale: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" });
              const svg = e.currentTarget.querySelector('svg');
              if (svg) gsap.to(svg, { color: "#000000", duration: 0.3 });
            }}
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
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



        {/* Content: extra details */}
        <div className="w-full p-6 md:p-10 flex flex-col justify-center">

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

          {/* redeem offer button */}
          <button className="mt-8 bg-[#DAB668] hover:bg-[#c4a15a] text-[#111] py-3 px-8 rounded-none font-medium tracking-wide transition-colors self-start shadow-xl">
            Redeem Offer
          </button>
        </div>
      </div>
    </div>
  );
};
