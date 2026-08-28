import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Upload, 
  Code, 
  Play, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Sun, 
  Zap, 
  Footprints, 
  BatteryCharging, 
  CheckCircle2, 
  HelpCircle, 
  Trophy, 
  Wrench, 
  Sparkles, 
  Star, 
  Clock, 
  Layers, 
  Copy, 
  Check, 
  FileCode,
  Flame,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  ExternalLink,
  SquareCheck,
  RotateCcw,
  Sliders,
  SlidersHorizontal
} from 'lucide-react';

export function ProjectStoreDetailModal({ 
  isOpen, 
  project, 
  onClose, 
  onUploadCode, 
  onOpenBlockCode, 
  onOpenSerialMonitor,
  device 
}) {
  if (!isOpen || !project) return null;

  const [activeComponentTab, setActiveComponentTab] = useState(project.components?.[0]?.id || 'uv-sensor');
  const [activeExperimentModal, setActiveExperimentModal] = useState(null);
  const [experimentTab, setExperimentTab] = useState('blocks'); // 'blocks' | 'code'
  const [motorSpeed, setMotorSpeed] = useState(75);
  const [motorDirection, setMotorDirection] = useState('FORWARD');
  const [motorDuration, setMotorDuration] = useState(2.0);
  const [uvInterval, setUvInterval] = useState(150);
  const [copiedCode, setCopiedCode] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [activeNav, setActiveNav] = useState('overview');

  const contentRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const scrollToSection = (sectionId) => {
    setActiveNav(sectionId);
    isProgrammaticScroll.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 850);

    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'safety', label: 'Safety' },
    { id: 'components', label: 'Components Lab' },
    { id: 'assembly', label: 'Assembly' },
    { id: 'code', label: 'Firmware' },
    { id: 'faq', label: 'FAQ' },
    { id: 'challenges', label: 'Challenges' }
  ];

  const currentNavIndex = Math.max(0, navLinks.findIndex(n => n.id === activeNav));

  const handlePrevNav = () => {
    if (currentNavIndex > 0) {
      scrollToSection(navLinks[currentNavIndex - 1].id);
    }
  };

  const handleNextNav = () => {
    if (currentNavIndex < navLinks.length - 1) {
      scrollToSection(navLinks[currentNavIndex + 1].id);
    }
  };

  // Auto-detect current visible section while user is manually scrolling (Scroll Spy)
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    let isThrottled = false;
    const handleScroll = () => {
      // Ignore scroll-spy events triggered during programmatic smooth clicks
      if (isProgrammaticScroll.current) return;

      if (isThrottled) return;
      isThrottled = true;
      requestAnimationFrame(() => {
        if (isProgrammaticScroll.current) {
          isThrottled = false;
          return;
        }

        const containerTop = container.getBoundingClientRect().top;
        const triggerPoint = containerTop + 180;

        for (let i = navLinks.length - 1; i >= 0; i--) {
          const el = document.getElementById(`section-${navLinks[i].id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= triggerPoint) {
              setActiveNav(navLinks[i].id);
              break;
            }
          }
        }
        isThrottled = false;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-slate-950/65 transition-all duration-300 animate-fade-in">
      
      {/* Main Lunar Light Modal Container */}
      <div className="relative w-full max-w-[1440px] h-[95vh] flex flex-col rounded-[32px] bg-gradient-to-br from-[#FCFDFF] via-[#F8FAFC] to-[#F1F5F9] border border-slate-200/90 shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden text-slate-800 font-sans">
        
        {/* Top Lunar Header Bar - Intelligent Responsive Layout */}
        <div className="flex flex-col xl:flex-row items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0 z-30 shadow-xs">
          
          {/* Top Row on Mobile (Logo & Close Button), Left Side on Desktop */}
          <div className="flex items-center justify-between w-full xl:w-auto h-14 sm:h-16 px-3 sm:px-6">
            {/* Top Left: Logo & Project Identity */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shadow-[0_0_12px_rgba(186,230,253,0.8)] border border-sky-200 shrink-0">
                <img 
                  src="/assets/lunar_sphere_icon.webp" 
                  alt="LOF TITAN Lunar" 
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/logo.webp"; }}
                />
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="font-heading font-extrabold text-base tracking-wide text-slate-900 truncate">
                  {project.name}
                </span>
                <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                  {project.badge || 'DIY Kit'}
                </span>
              </div>
            </div>

            {/* Close Button (Visible only on Mobile/Tablet in top row) */}
            <button 
              onClick={onClose}
              className="xl:hidden p-1.5 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
              title="Close and Return to Store"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Toolbar (Scrollable horizontally on mobile, flex row on desktop) */}
          <div className="flex items-center gap-2 sm:gap-4 w-full xl:w-auto overflow-x-auto scrollbar-hide px-3 sm:px-6 pb-2 xl:pb-0 shrink-0">
            
            {/* Center: Premium Single-Item Stepper Pill with Enlarged Typography */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 bg-slate-100/90 rounded-full border border-slate-200/90 shadow-2xs text-slate-700 shrink-0">
              <button
                onClick={handlePrevNav}
                disabled={currentNavIndex === 0}
                className={`p-1.5 rounded-full transition-all ${
                  currentNavIndex === 0 
                    ? 'opacity-30 cursor-not-allowed text-slate-400' 
                    : 'hover:bg-white hover:text-indigo-600 active:scale-95 text-slate-700 cursor-pointer shadow-2xs'
                }`}
                title="Previous Section"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => scrollToSection(navLinks[currentNavIndex]?.id)}
                className="flex items-center justify-center px-2 sm:px-4 py-1 rounded-full hover:bg-white/90 transition-all min-w-[100px] sm:min-w-[150px] text-center cursor-pointer shadow-2xs overflow-hidden shrink-0"
                title="Jump to Current Section"
              >
                <span className="text-xs sm:text-base font-extrabold text-indigo-700 tracking-wide truncate">
                  {navLinks[currentNavIndex]?.label}
                </span>
              </button>

              <button
                onClick={handleNextNav}
                disabled={currentNavIndex === navLinks.length - 1}
                className={`p-1.5 rounded-full transition-all ${
                  currentNavIndex === navLinks.length - 1 
                    ? 'opacity-30 cursor-not-allowed text-slate-400' 
                    : 'hover:bg-white hover:text-indigo-600 active:scale-95 text-slate-700 cursor-pointer shadow-2xs'
                }`}
                title="Next Section"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Top Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => onOpenSerialMonitor?.()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
                title="Open Live Serial Monitor"
              >
                <Terminal size={14} className="text-emerald-600" />
                <span className="hidden sm:inline">Serial</span>
              </button>

              <button 
                onClick={() => onOpenBlockCode?.()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
                title="Open in Block Code Studio"
              >
                <Code size={14} className="text-indigo-600" />
                <span className="hidden sm:inline">Block Studio</span>
              </button>

              <button 
                onClick={() => onUploadCode?.(project.code)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                title="Upload & Run on LOF TITAN"
              >
                <Upload size={13} />
                <span>Upload & Run</span>
              </button>

              {/* Close Button (Visible only on Desktop in toolbar) */}
              <button 
                onClick={onClose}
                className="hidden xl:flex p-1.5 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                title="Close and Return to Store"
              >
                <X size={18} />
              </button>
            </div>

          </div>
        </div>

        {/* Scrollable Articulate-Style Body Content with Enhanced Typography */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-12 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          
          {/* ================= 1. HERO COVER SECTION ================= */}
          <div id="section-overview" className="max-w-[1360px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-md p-6 sm:p-10 lg:p-12 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Main Visual Frame - Sleek Full Border Fit */}
              <div className="lg:col-span-5 rounded-3xl bg-slate-950 border border-slate-200/80 p-2 sm:p-2.5 flex items-center justify-center relative shadow-md overflow-hidden min-h-[340px] max-h-[400px]">
                <img 
                  src={project.heroImage} 
                  alt={project.name} 
                  decoding="async"
                  className="w-full h-full max-h-[380px] object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                  onError={(e) => { e.target.src = '/assets/banners/banner_invisible_diy.webp'; }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase bg-indigo-600 text-white shadow-sm">
                    {project.badge || 'Official Kit'}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-3.5">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 leading-tight">
                    {project.name}
                  </h1>

                  {project.description && (
                    <p className="text-slate-700 text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-3 gap-3.5 py-4 border-y border-slate-100">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
                    <span className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1">SENSORS</span>
                    <span className="text-sm sm:text-base font-extrabold text-indigo-700">3x UV Photodiodes</span>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
                    <span className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1">LOCOMOTION</span>
                    <span className="text-sm sm:text-base font-extrabold text-indigo-700">8-Leg 4-Bar Link</span>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
                    <span className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1">MCU</span>
                    <span className="text-sm sm:text-base font-extrabold text-indigo-700">ESP32-S3 TITAN</span>
                  </div>
                </div>

                {/* Ratings, Duration & Difficulty Metadata at Bottom */}
                <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-slate-500 flex-wrap pt-1">
                  <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 font-bold shadow-2xs">
                    <Star size={16} className="fill-current" />
                    <span>{project.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">({project.reviews || 128} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-bold shadow-2xs">
                    <Clock size={16} className="text-indigo-600" />
                    <span>{project.duration || '45 Mins'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-bold shadow-2xs">
                    <Layers size={16} className="text-purple-600" />
                    <span>{project.difficulty || 'Intermediate'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ================= 2. SAFETY WARNINGS ================= */}
          <div id="section-safety" className="max-w-[1360px] mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={24} className="text-amber-500" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">1. Product Safety Warnings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Hardware Safety */}
              <div className="p-7 rounded-3xl bg-amber-50/80 border border-amber-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base border-b border-amber-200/60 pb-3">
                  <Wrench size={18} className="text-amber-600" />
                  <span>Hardware & Mechanical Precautions</span>
                </div>
                <ul className="space-y-3.5 text-sm sm:text-base text-amber-950/90 leading-relaxed font-medium">
                  {project.safetyWarnings?.hardware?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{item.replace(/^⚠️\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Electronics Safety */}
              <div className="p-7 rounded-3xl bg-rose-50/80 border border-rose-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 text-rose-950 font-bold text-base border-b border-rose-200/60 pb-3">
                  <Zap size={18} className="text-rose-600" />
                  <span>Electronics & UV Radiation Safety</span>
                </div>
                <ul className="space-y-3.5 text-sm sm:text-base text-rose-950/90 leading-relaxed font-medium">
                  {project.safetyWarnings?.electronics?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="shrink-0 mt-0.5">{item.startsWith('⚡') ? '⚡' : item.startsWith('🔦') ? '🔦' : '⚠️'}</span>
                      <span>{item.replace(/^[⚡🔦⚠️]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* ================= 2. COMPONENTS LAB ================= */}
          <div id="section-components" className="max-w-[1360px] mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <Cpu size={24} className="text-cyan-600" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">2. Components Introduction & Live Labs</h2>
            </div>

            {/* Vertical Sidebar + Deep Dive Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* Left Column: Vertical Component Selector Toolbar */}
              <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-2 p-2 rounded-2xl bg-slate-100/90 border border-slate-200 shrink-0 shadow-2xs">
                <span className="px-3 py-1.5 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Select Component
                </span>
                {project.components?.map(comp => {
                  const isActive = activeComponentTab === comp.id;
                  const shortName = comp.id === 'uv-sensor' 
                    ? 'UV Sensor' 
                    : comp.id === 'dc-motor' 
                    ? 'Dual DC Motor' 
                    : comp.name.split('(')[0].trim();

                  return (
                    <button
                      key={comp.id}
                      onClick={() => setActiveComponentTab(comp.id)}
                      className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isActive 
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/90 ring-2 ring-indigo-500/20' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <Cpu size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm tracking-wide truncate ${isActive ? 'font-extrabold text-indigo-950' : 'font-bold text-slate-700'}`}>
                          {shortName}
                        </div>
                      </div>
                      <ChevronRight size={15} className={`shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Component Deep Dive Card */}
              {(() => {
                const comp = project.components?.find(c => c.id === activeComponentTab) || project.components?.[0];
                if (!comp) return null;

                return (
                  <div className="md:col-span-8 lg:col-span-9 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-7 items-start">
                      
                      {/* Component Visual & Pinout */}
                      <div className="sm:col-span-5 space-y-4">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner">
                          <img 
                            src={comp.image} 
                            alt={comp.name} 
                            loading="lazy"
                            decoding="async"
                            className="max-h-48 object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                            onError={(e) => { e.target.src = '/assets/banners/banner_invisible_diy.webp'; }}
                          />
                        </div>
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                            {comp.pinMapping}
                          </span>
                        </div>
                      </div>

                      {/* Hardware Theory & Working Principles */}
                      <div className="sm:col-span-7 space-y-5">
                        <div>
                          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
                            {comp.name}
                          </h3>
                        </div>

                        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <strong className="text-slate-900 block font-bold text-base">What is it?</strong>
                            <p className="text-slate-600">{comp.whatIsIt}</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <strong className="text-slate-900 block font-bold text-base">How it works:</strong>
                            <p className="text-slate-600">{comp.howItWorks}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Prominent Interactive Experiment Launch Bar */}
                    <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-purple-50/70 p-5 rounded-2xl border">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-xs font-extrabold uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                          <Zap size={14} className="text-amber-500 fill-amber-500" /> Interactive Hardware Calibration Lab
                        </span>
                        <h4 className="font-bold text-base text-slate-900">
                          {comp.experiment?.title || 'Live Sensor Experiment & Code Runner'}
                        </h4>
                      </div>

                      <button
                        onClick={() => setActiveExperimentModal(comp)}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shrink-0"
                      >
                        <Zap size={18} className="text-amber-300 fill-amber-300" />
                        <span>Launch Live Calibration Lab</span>
                        <ExternalLink size={15} className="text-indigo-200" />
                      </button>
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>

          {/* ================= 3. ASSEMBLY GUIDE ================= */}
          <div id="section-assembly" className="max-w-[1360px] mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <Wrench size={24} className="text-indigo-600" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">3. 4-Bar Linkage Mechanical Assembly</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {project.assembly?.map(item => (
                <div key={item.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {item.step}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-base text-slate-900">{item.title}</h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 4. FIRMWARE CODE ================= */}
          <div id="section-code" className="max-w-[1360px] mx-auto space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <FileCode size={24} className="text-blue-600" />
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">4. Production MicroPython Firmware</h2>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleCopy(project.code)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold text-slate-700 border border-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => onUploadCode?.(project.code)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Upload size={15} />
                  <span>Upload & Run on TITAN</span>
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-[#060911] border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-5 py-3 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-400">
                <span className="font-mono text-cyan-400 font-bold">invisible_rover.py</span>
                <span className="text-xs text-slate-500">MicroPython ESP32-S3 Firmware</span>
              </div>
              <div className="p-5 sm:p-7 font-mono text-xs sm:text-sm text-sky-200 overflow-x-auto max-h-[440px] scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
                <pre className="whitespace-pre">{project.code}</pre>
              </div>
            </div>
          </div>

          {/* ================= 5. FAQ & TROUBLESHOOTING ================= */}
          <div id="section-faq" className="max-w-[1360px] mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <HelpCircle size={24} className="text-purple-600" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">5. FAQ & Hardware Troubleshooting</h2>
            </div>

            <div className="space-y-4">
              {project.faq?.map((item, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <h4 className="font-bold text-base sm:text-lg text-indigo-900 flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-extrabold shrink-0">Q</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 pl-8 leading-relaxed font-normal">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 6. CODING CHALLENGES ================= */}
          <div id="section-challenges" className="max-w-[1360px] mx-auto space-y-5">
            <div className="flex items-center gap-2.5">
              <Trophy size={24} className="text-amber-500" />
              <h2 className="text-2xl font-heading font-extrabold text-slate-900">6. Robotics Mission Challenges</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {project.challenges?.map(ch => (
                <div key={ch.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-5 hover:border-indigo-300 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        ch.level === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                        ch.level === 'Intermediate' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {ch.level}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900">{ch.title}</h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">{ch.goal}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong className="text-indigo-700">💡 Hint:</strong> {ch.hint}
                  </div>

                  <button
                    onClick={() => onOpenBlockCode?.()}
                    className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Code size={15} />
                    <span>Solve in Block Studio</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Completion & Launch Card */}
          <div className="max-w-[1360px] mx-auto p-7 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-heading font-extrabold">Ready to Build & Deploy {project.name}?</h3>
              <p className="text-sm text-blue-100 max-w-xl leading-relaxed font-normal">
                Connect your LOF TITAN board via Web Bluetooth, upload the firmware code, or customize the 8-leg walking algorithm in Block Code Studio!
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => onOpenBlockCode?.()}
                className="px-6 py-3 rounded-full text-sm font-bold bg-white text-indigo-700 hover:bg-blue-50 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Code size={16} />
                <span>Open Block Studio</span>
              </button>
              <button
                onClick={() => onUploadCode?.(project.code)}
                className="px-6 py-3 rounded-full text-sm font-bold bg-indigo-950 text-white hover:bg-slate-900 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Upload size={16} />
                <span>Upload to Rover</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Live Experiment Modal with Visual Blocks (Popup Overlay On Top) */}
      {activeExperimentModal && (() => {
        const isDcMotor = activeExperimentModal.id === 'dc-motor';
        const isUvSensor = activeExperimentModal.id === 'uv-sensor';

        const getDynamicCode = () => {
          if (isDcMotor) {
            const isFwd = motorDirection === 'FORWARD';
            const duty = Math.round(motorSpeed * 10.23);
            return `# ================= LOF TITAN MOTOR KINEMATICS TEST =================
import time
from machine import Pin, PWM
from supervisor.led_buzzer import hw

_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

print("--- LOF TITAN MOTOR CALIBRATION TEST ---")
print("Testing Direction: ${motorDirection} at Speed: ${motorSpeed}% for ${motorDuration}s")
hw.play_startup_tone()

# 1. Engage Motors (Left M1: GPIO 15/16, Right M2: GPIO 13/14)
${isFwd 
  ? `_get_pwm(15).duty(${duty}); Pin(16, Pin.OUT).value(0)
_get_pwm(13).duty(${duty}); Pin(14, Pin.OUT).value(0)`
  : `Pin(15, Pin.OUT).value(0); _get_pwm(16).duty(${duty})
Pin(13, Pin.OUT).value(0); _get_pwm(14).duty(${duty})`}

# 2. Wait for Kinematic Stride Duration
time.sleep(${motorDuration})

# 3. Stop Motors Safely
Pin(15, Pin.OUT).value(0); Pin(16, Pin.OUT).value(0)
Pin(13, Pin.OUT).value(0); Pin(14, Pin.OUT).value(0)
print("Calibration Complete! Motors Stopped.")
hw.play_stop_tone()
`;
          } else if (isUvSensor) {
            return `# ================= LOF TITAN UV SENSOR TEST =================
import time
from machine import Pin, ADC
from supervisor.led_buzzer import hw

# Setup 12-bit ADC on Sensor Ports S1 (GPIO 2), S2 (GPIO 1), S3 (GPIO 3)
uv_left   = ADC(Pin(2), atten=ADC.ATTN_11DB)
uv_center = ADC(Pin(1), atten=ADC.ATTN_11DB)
uv_right  = ADC(Pin(3), atten=ADC.ATTN_11DB)

print("--- LOF TITAN UV SENSOR TELEMETRY ---")
print("Shine UV light on sensor to observe live ADC values (0..4095)!")
hw.play_startup_tone()

while True:
    val_l = uv_left.read()
    val_c = uv_center.read()
    val_r = uv_right.read()
    print(f"UV [Left(S1): {val_l:4d} | Center(S2): {val_c:4d} | Right(S3): {val_r:4d}]")
    time.sleep_ms(${uvInterval})
`;
          }
          return activeExperimentModal.experiment?.testCode || '';
        };

        const activeCode = getDynamicCode();

        return (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/40 animate-fade-in">
            <div className="relative w-full max-w-3xl rounded-[32px] bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC] text-slate-800 border border-slate-200 shadow-[0_25px_70px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col max-h-[92vh]">
              
              {/* Top Modal Header (Lunar White Theme) */}
              <div className="h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                    <Zap size={20} className="text-amber-300 fill-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">
                      {activeExperimentModal.experiment?.title}
                    </h3>
                  </div>
                </div>
                
                {/* Visual Blocks vs Code Toggle Pills */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setExperimentTab('blocks')}
                      className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                        experimentTab === 'blocks'
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-black'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Layers size={14} />
                      <span>Visual Blocks</span>
                    </button>
                    <button
                      onClick={() => setExperimentTab('code')}
                      className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                        experimentTab === 'code'
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-black'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Code size={14} />
                      <span>Python Code</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveExperimentModal(null)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Close Experiment"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                
                {/* Protocol & Guide Card (Lunar White Theme) */}
                <div className="p-4.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-100/90 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-extrabold uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" /> Experiment Guide & Observation:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-normal">
                    {activeExperimentModal.experiment?.instruction}
                  </p>
                </div>

                {/* TAB 1: VISUAL BLOCKS INTERACTIVE VIEW (EXACT BLOCK STUDIO REPLICA) */}
                {experimentTab === 'blocks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                        Block Studio Visual Workspace
                      </span>
                    </div>

                    {/* Dotted Grid Blockly Canvas Container */}
                    <div 
                      className="p-6 sm:p-10 rounded-3xl bg-[#F8FAFC] border-2 border-slate-200/90 shadow-sm overflow-x-auto select-none"
                      style={{
                        backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
                        backgroundSize: '22px 22px'
                      }}
                    >
                      <div className="inline-flex flex-col items-start min-w-[340px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
                        
                        {/* 1. TITAN Start Cap Block */}
                        <div className="relative z-10 bg-[#6580D4] text-white px-5 py-3 rounded-tl-2xl rounded-tr-md rounded-bl-sm font-black text-sm flex items-center gap-2.5 shadow-sm border-t border-l border-r border-[#8199E8]">
                          <span className="text-base">🚀</span>
                          <span className="tracking-wide">TITAN Start</span>
                          {/* Bottom Puzzle Notch Tab */}
                          <div className="absolute -bottom-2 left-6 w-4 h-2 bg-[#6580D4] rounded-b-md"></div>
                        </div>

                        {/* 2. Repeat While True C-Block */}
                        <div className="relative flex flex-col bg-[#72B666] text-white rounded-tr-xl rounded-br-xl rounded-bl-md border-t border-r border-b border-[#8CD180] shadow-sm mt-0">
                          
                          {/* Repeat Header Row */}
                          <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm tracking-wide">repeat</span>
                            
                            {/* While Dropdown Pill */}
                            <div className="flex items-center gap-1 bg-[#569C48] px-2.5 py-1 rounded-lg text-xs font-bold shadow-inner cursor-pointer hover:bg-[#4E8F40] transition-colors border border-[#437D36]">
                              <span>while</span>
                              <ChevronDown size={14} className="text-emerald-100" />
                            </div>

                            {/* True Hexagonal Boolean Pill */}
                            <div className="flex items-center gap-1 bg-[#4D6898] px-3 py-1 rounded-lg text-xs font-bold shadow-inner cursor-pointer hover:bg-[#435C87] transition-colors border border-[#384C70]">
                              <span>true</span>
                              <ChevronDown size={14} className="text-sky-200" />
                            </div>
                          </div>

                          {/* C-Bracket Body */}
                          <div className="flex items-stretch">
                            {/* Left Green Spine with 'do' */}
                            <div className="w-8 sm:w-10 bg-[#72B666] flex flex-col items-center pt-2 shrink-0">
                              <span className="font-extrabold text-xs text-white">do</span>
                            </div>

                            {/* Inner Nested Blocks (UV Sensor vs DC Motor) */}
                            <div className="flex-1 bg-[#E2E8F0]/40 p-2.5 space-y-1.5 rounded-l-md border-l-2 border-[#569C48]/40 min-w-[280px]">
                              
                              {/* UV SENSOR BLOCKS */}
                              {isUvSensor && (
                                <>
                                  {/* Print Sensor 1 Label */}
                                  <div className="bg-[#4AB0A1] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#5DC4B5]">
                                    <span>print</span>
                                    <span className="text-teal-200 font-serif font-black">“</span>
                                    <div className="bg-white text-slate-800 px-3 py-0.5 rounded font-mono font-bold text-xs shadow-inner border border-slate-200">
                                      sensor 1
                                    </div>
                                    <span className="text-teal-200 font-serif font-black">”</span>
                                  </div>

                                  {/* Print Sensor 1 Value */}
                                  <div className="bg-[#4AB0A1] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#5DC4B5]">
                                    <span>print</span>
                                    <div className="bg-[#5F6CD3] text-white px-2.5 py-1 rounded-md flex items-center gap-2 shadow-sm border border-[#7884E0]">
                                      <span>Digital Sensor</span>
                                      <div className="bg-[#4B58B8] px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1">
                                        <span>S1 (GPIO 2)</span>
                                        <ChevronDown size={12} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Print Sensor 2 Label */}
                                  <div className="bg-[#4AB0A1] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#5DC4B5]">
                                    <span>print</span>
                                    <span className="text-teal-200 font-serif font-black">“</span>
                                    <div className="bg-white text-slate-800 px-3 py-0.5 rounded font-mono font-bold text-xs shadow-inner border border-slate-200">
                                      sensor 2
                                    </div>
                                    <span className="text-teal-200 font-serif font-black">”</span>
                                  </div>

                                  {/* Print Sensor 2 Value */}
                                  <div className="bg-[#4AB0A1] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#5DC4B5]">
                                    <span>print</span>
                                    <div className="bg-[#5F6CD3] text-white px-2.5 py-1 rounded-md flex items-center gap-2 shadow-sm border border-[#7884E0]">
                                      <span>Digital Sensor</span>
                                      <div className="bg-[#4B58B8] px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1">
                                        <span>S2 (GPIO 1)</span>
                                        <ChevronDown size={12} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Print Sensor 3 Label */}
                                  <div className="bg-[#4AB0A1] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#5DC4B5]">
                                    <span>print</span>
                                    <span className="text-teal-200 font-serif font-black">“</span>
                                    <div className="bg-white text-slate-800 px-3 py-0.5 rounded font-mono font-bold text-xs shadow-inner border border-slate-200">
                                      sensor 3
                                    </div>
                                    <span className="text-teal-200 font-serif font-black">”</span>
                                  </div>

                                  {/* Print Sensor 3 Value */}
                                  <div className="bg-[#4AB0A1] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#5DC4B5]">
                                    <span>print</span>
                                    <div className="bg-[#5F6CD3] text-white px-2.5 py-1 rounded-md flex items-center gap-2 shadow-sm border border-[#7884E0]">
                                      <span>Digital Sensor</span>
                                      <div className="bg-[#4B58B8] px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1">
                                        <span>S3 (GPIO 3)</span>
                                        <ChevronDown size={12} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Wait Milliseconds Block */}
                                  <div className="bg-[#6580D4] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#8199E8]">
                                    <span>Wait</span>
                                    <div className="bg-white text-slate-800 px-2.5 py-0.5 rounded font-mono font-bold text-xs shadow-inner border border-slate-200">
                                      {uvInterval}
                                    </div>
                                    <div className="bg-[#4D6898] px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                                      <span>milliseconds</span>
                                      <ChevronDown size={12} />
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* DC MOTOR BLOCKS */}
                              {isDcMotor && (
                                <>
                                  {/* Set Motor M1 Speed & Dir */}
                                  <div className="bg-[#5F6CD3] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#7884E0] flex-wrap">
                                    <span>Set Motor</span>
                                    <div className="bg-[#4B58B8] px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                                      <span>M1 (GPIO 15,16)</span>
                                      <ChevronDown size={12} />
                                    </div>
                                    <span>Direction</span>
                                    <div className="bg-[#4B58B8] px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                                      <span>{motorDirection}</span>
                                      <ChevronDown size={12} />
                                    </div>
                                    <span>Speed</span>
                                    <div className="bg-white text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-xs shadow-inner border border-slate-200">
                                      {motorSpeed}%
                                    </div>
                                  </div>

                                  {/* Set Motor M2 Speed & Dir */}
                                  <div className="bg-[#5F6CD3] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#7884E0] flex-wrap">
                                    <span>Set Motor</span>
                                    <div className="bg-[#4B58B8] px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                                      <span>M2 (GPIO 13,14)</span>
                                      <ChevronDown size={12} />
                                    </div>
                                    <span>Direction</span>
                                    <div className="bg-[#4B58B8] px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                                      <span>{motorDirection}</span>
                                      <ChevronDown size={12} />
                                    </div>
                                    <span>Speed</span>
                                    <div className="bg-white text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-xs shadow-inner border border-slate-200">
                                      {motorSpeed}%
                                    </div>
                                  </div>

                                  {/* Wait Stride Duration */}
                                  <div className="bg-[#6580D4] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#8199E8]">
                                    <span>Wait</span>
                                    <div className="bg-white text-slate-800 px-2.5 py-0.5 rounded font-mono font-bold text-xs shadow-inner border border-slate-200">
                                      {Math.round(motorDuration * 1000)}
                                    </div>
                                    <div className="bg-[#4D6898] px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                                      <span>milliseconds</span>
                                      <ChevronDown size={12} />
                                    </div>
                                  </div>

                                  {/* Stop Motors Block */}
                                  <div className="bg-[#E05454] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm border border-[#EF7272]">
                                    <span>Stop All Motors</span>
                                    <div className="bg-[#B93838] px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                                      <span>M1 & M2 (Brake)</span>
                                      <ChevronDown size={12} />
                                    </div>
                                  </div>
                                </>
                              )}

                            </div>
                          </div>

                          {/* Bottom C-Bracket Cap */}
                          <div className="h-2.5 bg-[#72B666] rounded-br-xl rounded-bl-md"></div>
                        </div>

                      </div>
                    </div>

                    {/* Interactive Parameter Sliders Toolbar (Lunar White Theme) */}
                    <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                        <Sliders size={16} className="text-indigo-600" />
                        <span>Tune Block Parameters:</span>
                      </div>

                      {isDcMotor && (
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          {/* Direction Toggle */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">Dir:</span>
                            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                              <button
                                onClick={() => setMotorDirection('FORWARD')}
                                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                                  motorDirection === 'FORWARD' ? 'bg-indigo-600 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                FWD
                              </button>
                              <button
                                onClick={() => setMotorDirection('BACKWARD')}
                                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                                  motorDirection === 'BACKWARD' ? 'bg-amber-600 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                BWD
                              </button>
                            </div>
                          </div>

                          {/* Speed Slider */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">Speed:</span>
                            <input 
                              type="range" 
                              min="25" 
                              max="100" 
                              step="5"
                              value={motorSpeed} 
                              onChange={(e) => setMotorSpeed(Number(e.target.value))}
                              className="w-24 accent-indigo-600 cursor-pointer"
                            />
                            <span className="font-mono text-indigo-700 font-extrabold px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">{motorSpeed}%</span>
                          </div>

                          {/* Duration Slider */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">Time:</span>
                            <input 
                              type="range" 
                              min="0.5" 
                              max="5.0" 
                              step="0.5"
                              value={motorDuration} 
                              onChange={(e) => setMotorDuration(Number(e.target.value))}
                              className="w-20 accent-blue-600 cursor-pointer"
                            />
                            <span className="font-mono text-blue-700 font-extrabold px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100">{motorDuration}s</span>
                          </div>
                        </div>
                      )}

                      {isUvSensor && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500 font-bold">Telemetry Rate (Delay):</span>
                          <input 
                            type="range" 
                            min="50" 
                            max="500" 
                            step="25"
                            value={uvInterval} 
                            onChange={(e) => setUvInterval(Number(e.target.value))}
                            className="w-32 accent-indigo-600 cursor-pointer"
                          />
                          <span className="font-mono text-indigo-700 font-extrabold px-2.5 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">{uvInterval} ms</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 2: PYTHON CODE RAW VIEW */}
                {experimentTab === 'code' && (
                  <div className="rounded-2xl bg-[#060911] border border-slate-800 overflow-hidden shadow-inner">
                    <div className="px-5 py-3 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-cyan-400 font-bold">lab_experiment.py</span>
                      <button
                        onClick={() => handleCopy(activeCode)}
                        className="hover:text-white flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
                      >
                        {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <div className="p-5 font-mono text-xs sm:text-sm text-sky-200 overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
                      <pre className="whitespace-pre">{activeCode}</pre>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Actions Footer (Lunar White Theme) */}
              <div className="p-4 px-6 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenSerialMonitor?.();
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Terminal size={15} className="text-emerald-600" />
                    <span>Serial Monitor</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveExperimentModal(null);
                      onOpenBlockCode?.();
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Code size={15} className="text-indigo-600" />
                    <span>Open in Full Block Studio</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveExperimentModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => onUploadCode?.(activeCode)}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md hover:shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Upload size={15} />
                    <span>Upload & Run on TITAN</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
