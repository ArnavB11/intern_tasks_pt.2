import React, { useState, useEffect } from 'react';

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
  {
    id: 1,
    title: '20% off on all DO F&B Outlets',
    category: 'Restaurant',
    subtitle: null
  },
  {
    id: 2,
    title: 'Al Hilal Premium Medical Center',
    category: 'Medical',
    subtitle: '+974 4431 6633 / +974 3314 3735\nAl Nuaija St, Doha'
  },
  {
    id: 3,
    title: 'Exclusive Suite Rates & Spa Discounts',
    category: 'Hotel',
    subtitle: null
  },
  {
    id: 4,
    title: 'Al Hilal Turkish Restaurant',
    category: 'Restaurant',
    subtitle: '7032 6737'
  },
  {
    id: 5,
    title: 'Art Factory',
    category: 'Service',
    subtitle: '7728 9955 / 3371 4726'
  },
];

const categories = ['All', 'Medical', 'Hotel', 'Restaurant', 'Service'];

// --- Components ---
const LoadingScreen = ({ isFadingOut }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600);   // DOHA
    const t2 = setTimeout(() => setStep(2), 1400);  // OASIS

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black transition-opacity duration-[1500ms] ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className={`text-[#C19A5B] font-bodoni-moda tracking-[0.05em] text-4xl sm:text-5xl md:text-6xl uppercase flex space-x-7 transition-all duration-[2000ms] ease-in-out origin-center ${isFadingOut ? 'scale-[15] blur-md' : 'scale-100 blur-none'}`}>
        <span className={`transition-all duration-1000 ease-out transform ${step >= 1 ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-4 blur-sm'}`}>
          DOHA
        </span>
        <span className={`transition-all duration-1000 ease-out transform ${step >= 2 ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-4 blur-sm'}`}>
          OASIS
        </span>
      </div>
    </div>
  );
};

// --- Main Application Component ---
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3200);

    const appRevealTimer = setTimeout(() => {
      setAppLoaded(true);
    }, 3400);

    const unmountTimer = setTimeout(() => {
      setIsLoading(false);
    }, 4800);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(appRevealTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // Real-time filtering based on search text and selected category
  const filteredBenefits = mockData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {isLoading && <LoadingScreen isFadingOut={isFadingOut} />}
      <div className={`min-h-screen bg-[#F9FAFB] font-sans text-slate-800 ${isLoading ? 'h-screen overflow-hidden' : ''}`}>

        {/* A. Full-Width Layout Header */}
        <header className={`w-full bg-white py-5 px-8 md:px-16 shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 transition-all duration-[1500ms] ease-out transform ${appLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          <div className="text-gray-500 font-light text-lg">
            Employee Benefits
          </div>
          <div className="text-[#C19A5B] font-bodoni-moda tracking-[0.05em] text-xl uppercase">
            Doha Oasis
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-x-hidden">

          {/* B. The "Featured" Flyer Carousel */}
          <section className={`mb-14 transition-all duration-[1500ms] delay-[300ms] ease-out transform ${appLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h2 className="text-2xl font-light text-slate-700 mb-6 tracking-wide">Featured</h2>
            <div className="flex items-center justify-center">
              <ChevronLeft />

              {/* Promo Card Layout */}
              <div className="mx-6 w-full max-w-[340px] bg-[#FFF8F5] border border-orange-100 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
                <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 self-end rounded-bl-lg absolute top-0 right-0 z-10">
                  Corporate Discount Guide
                </div>
                <div className="p-6 pt-10 flex flex-col items-start z-10">
                  <span className="text-orange-500 font-bold text-2xl tracking-tighter mb-1">talabat</span>
                  <h3 className="text-orange-600 font-extrabold text-[32px] leading-tight mb-2">Get 22% off</h3>
                  <p className="text-sm text-gray-700 font-medium">from restaurants under</p>
                  <p className="text-sm text-gray-900 font-bold mb-4">Office Picks Collection</p>
                  <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-full inline-flex items-center text-xs shadow-sm mb-4">
                    <span className="text-gray-600 mr-1 font-medium">Use code:</span>
                    <span className="text-orange-600 font-bold tracking-wide">DHO22</span>
                  </div>
                </div>
                {/* Graphic Placeholder */}
                <div className="bg-white flex-grow flex items-center justify-center p-8 border-t border-orange-50 rounded-t-[2.5rem] shadow-[0_-5px_15px_rgba(0,0,0,0.03)] relative h-32">
                  <div className="absolute -top-6 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <BasketIcon />
                  </div>
                </div>
              </div>

              <ChevronRight />
            </div>
          </section>

          {/* C. The "Benefits" Navigation & Control Board */}
          <section className={`transition-all duration-[1500ms] delay-[600ms] ease-out transform ${appLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h2 className="text-2xl font-light text-slate-700 mb-6 tracking-wide">Benefits</h2>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D2C1D] focus:border-[#0D2C1D] transition-colors font-light placeholder-gray-400 text-gray-700 shadow-sm"
              />
            </div>

            {/* Category Tabs */}
            <div className="bg-gray-50/80 rounded-lg p-1.5 mb-3 flex items-center justify-between border border-gray-100 shadow-inner overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeCategory === category
                    ? 'bg-[#0D2C1D] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Tracking Progress Line Frame */}
            <div className="flex items-center text-gray-300 px-1 mb-8">
              <svg className="w-3 h-3 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6z" /></svg>
              <div className="flex-grow h-2 bg-gray-200 rounded-full mx-2 relative overflow-hidden">
                {/* Dummy active progress segment */}
                <div className="absolute left-0 top-0 h-full w-1/4 bg-gray-400 rounded-full"></div>
              </div>
              <svg className="w-3 h-3 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6z" /></svg>
            </div>

            {/* D. Directory Cards Loop Grid */}
            <div className="flex flex-col space-y-6">
              {filteredBenefits.length > 0 ? (
                filteredBenefits.map(benefit => (
                  <div key={benefit.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex p-6 items-center">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center mr-6 border border-gray-100 rounded-xl bg-gray-50 text-gray-300">
                        <ImageIcon />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl sm:text-[22px] text-gray-600 font-light leading-snug mb-2">
                          {benefit.title}
                        </h3>
                        {benefit.subtitle && (
                          <div className="text-sm text-gray-400 whitespace-pre-line leading-relaxed font-light">
                            {benefit.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <button className="w-full bg-[#0D2C1D] text-white py-3.5 rounded-lg font-medium text-sm hover:bg-[#081a11] transition-colors focus:outline-none">
                        View Info
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-400 font-light border border-dashed border-gray-200 rounded-2xl">
                  No benefits found matching "{searchQuery}" in {activeCategory}.
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
