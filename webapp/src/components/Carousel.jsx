import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Carousel({ items, autoPlayInterval = 5000, onItemClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  }, [items.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isHovered) {
      const slideInterval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(slideInterval);
    }
  }, [isHovered, nextSlide, autoPlayInterval]);

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[250px] md:h-[350px] lg:h-[400px] overflow-hidden rounded-2xl group border border-white/10 shadow-2xl bg-surface/50 mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            {/* Background Image */}
            <img 
              src={item.image} 
              alt={item.title} 
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-10000 scale-100 group-hover:scale-105"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-16">
              <div className="max-w-xl animate-fade-in-up">
                <span className="inline-block px-3 py-1 bg-primary-start/20 border border-primary-start/50 text-primary-start text-xs md:text-sm font-bold uppercase tracking-widest rounded-full mb-4 shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                  {item.badge || 'Featured Kit'}
                </span>
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight drop-shadow-lg">
                  {item.title}
                </h2>
                <p className="text-base md:text-lg text-gray-200 line-clamp-3 drop-shadow-md font-medium">
                  {item.description}
                </p>
                {item.buttonText && (
                  <button 
                    onClick={() => onItemClick?.(item, index)}
                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-full transition-all shadow-glow flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    {item.buttonText} <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Navigation Arrows (Only if multiple slides) */}
      {items.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110 backdrop-blur-sm z-10"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110 backdrop-blur-sm z-10"
            aria-label="Next Slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index 
                    ? 'w-8 h-2.5 bg-primary-start shadow-[0_0_8px_rgba(0,229,255,0.8)]' 
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
