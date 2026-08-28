import React, { useState } from 'react';
import { 
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
  ExternalLink
} from 'lucide-react';

export function ProjectStoreDetail({ 
  project, 
  onBack, 
  onUploadCode, 
  onOpenBlockCode, 
  onOpenSerialMonitor,
  device 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'safety' | 'requirements' | 'components' | 'assembly' | 'code' | 'challenges' | 'faq'
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState(project.components?.[0]?.id || 'uv-sensor');

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'safety', label: 'Safety Warnings', icon: ShieldAlert },
    { id: 'requirements', label: 'Requirements (BOM)', icon: Layers },
    { id: 'components', label: 'Components Lab', icon: Cpu },
    { id: 'assembly', label: 'Assembly Guide', icon: Wrench },
    { id: 'code', label: 'Firmware Code', icon: FileCode },
    { id: 'challenges', label: 'Missions & Challenges', icon: Trophy },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-100 max-w-7xl mx-auto w-full pb-12">
      
      {/* Top Header / App Store Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/10"
          >
            <ArrowLeft size={16} /> Back to Store
          </button>
          <div className="w-px h-6 bg-white/20" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              {project.category || 'DIY Robotics Kit'}
            </span>
            <h1 className="text-xl md:text-2xl font-heading font-extrabold text-white leading-tight">
              {project.name}
            </h1>
          </div>
        </div>

        {/* Quick Action Deployment Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => onOpenSerialMonitor?.()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition-all shadow-xs active:scale-95"
            title="Open Live REPL Serial Monitor"
          >
            <Terminal size={14} />
            <span>Serial Monitor</span>
          </button>

          <button 
            onClick={() => onOpenBlockCode?.()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-400/40 transition-all shadow-xs active:scale-95"
            title="Open Interactive Visual Block Studio"
          >
            <Code size={14} />
            <span>Block Code Studio</span>
          </button>

          <button 
            onClick={() => onUploadCode?.(project.code)}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md hover:shadow-cyan-500/30 transition-all active:scale-95"
            title="Upload and Execute on LOF TITAN Rover"
          >
            <Upload size={14} />
            <span>Upload & Run</span>
          </button>
        </div>
      </div>

      {/* Hero Media Showcase Card (Play Store Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        
        {/* Left / Center: Big Showcase Media */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center rounded-2xl bg-black/40 border border-white/10 p-4 overflow-hidden relative group">
          <img 
            src={project.heroImage} 
            alt={project.name}
            className="w-full max-h-[380px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = '/assets/banners/banner_invisible_diy.webp';
            }}
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs">
              {project.badge || 'Official Kit'}
            </span>
          </div>
        </div>

        {/* Right: Key Specs, Ratings & Overview */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                <Star size={14} className="fill-current" />
                <span className="font-bold">{project.rating || 4.9}</span>
                <span className="text-slate-400">({project.reviews || 120})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <Clock size={14} className="text-cyan-400" />
                <span>{project.duration || '45 Mins'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <Layers size={14} className="text-purple-400" />
                <span>{project.difficulty || 'Intermediate'}</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
              {project.tagline || project.name}
            </h2>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Quick Hardware Feature Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/10">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Sensors</span>
              <span className="text-sm font-extrabold text-cyan-300">3x UV Photodiodes</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Locomotion</span>
              <span className="text-sm font-extrabold text-purple-300">8-Leg 4-Bar Linkage</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Controller</span>
              <span className="text-sm font-extrabold text-emerald-300">ESP32-S3 TITAN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Play Store Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display Area */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-xl">
        
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" /> Mission Objective
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  In this hands-on robotics mission, you will build and program an **Invisible Line Patrol** walking rover. Unlike ordinary wheeled rovers, this model utilizes an intricate **4-bar linkage mechanism with 8 mechanical walking legs** to crawl and navigate.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Equipped with a forward array of **3 analog UV photodiodes**, the rover detects ultraviolet photon energy invisible to human eyes and follows UV light tracks with autonomous closed-loop feedback!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">What You Will Learn</h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>How optical UV photodiodes convert invisible UV rays into 12-bit analog voltages.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>Kinematics of 4-bar linkage mechanical walking legs driven by DC gearmotors.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>Autonomous differential steering logic and threshold calibration in Blockly & MicroPython.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SAFETY WARNINGS ================= */}
        {activeTab === 'safety' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center gap-3">
              <ShieldAlert size={24} className="text-amber-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-amber-300">Important Safety Protocols</h4>
                <p className="text-xs text-amber-200/90">Please review all hardware, mechanical, and electronic precautions before operating the rover.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hardware Safety */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Wrench size={16} className="text-cyan-400" /> Mechanical & Hardware Safety
                </h4>
                <ul className="space-y-3 text-xs text-slate-300">
                  {project.safetyWarnings?.hardware?.map((item, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Electronics Safety */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" /> Electronics & UV Radiation Safety
                </h4>
                <ul className="space-y-3 text-xs text-slate-300">
                  {project.safetyWarnings?.electronics?.map((item, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRODUCT REQUIREMENTS (BOM) ================= */}
        {activeTab === 'requirements' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-white">Bill of Materials & Components Checklist</h3>
              <p className="text-xs text-slate-400 mt-1">Ensure you have all items assembled and wired to the indicated ports before testing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.requirements?.map((req, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {req.qty}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{req.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: COMPONENTS LAB ================= */}
        {activeTab === 'components' && (
          <div className="space-y-6 animate-fade-in">
            {/* Component Selector Pills */}
            <div className="flex gap-3">
              {project.components?.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setActiveComponentId(comp.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    activeComponentId === comp.id 
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Cpu size={14} />
                  <span>{comp.name.split('(')[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Component Deep Dive */}
            {(() => {
              const comp = project.components?.find(c => c.id === activeComponentId) || project.components?.[0];
              if (!comp) return null;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left: Component Visual & Theory */}
                  <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                      <img 
                        src={comp.image} 
                        alt={comp.name} 
                        className="max-h-48 object-contain rounded-lg shadow-md"
                        onError={(e) => { e.target.src = '/assets/banners/banner_invisible_diy.webp'; }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">{comp.name}</h4>
                      <span className="text-[11px] font-mono text-cyan-400 block mt-1">{comp.pinMapping}</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div>
                        <strong className="text-white block">What is it?</strong>
                        <p className="mt-0.5 text-slate-400">{comp.whatIsIt}</p>
                      </div>
                      <div>
                        <strong className="text-white block">How it works:</strong>
                        <p className="mt-0.5 text-slate-400">{comp.howItWorks}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Interactive Experiment & Code Test */}
                  <div className="lg:col-span-7 space-y-4 p-5 rounded-2xl bg-[#0B0F19] border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                          <Zap size={16} className="text-amber-400" /> {comp.experiment?.title}
                        </h4>
                        <p className="text-xs text-slate-400 whitespace-pre-line mt-1.5">{comp.experiment?.instruction}</p>
                      </div>
                    </div>

                    {/* Test Code Box */}
                    <div className="rounded-xl bg-[#060911] border border-slate-800 overflow-hidden">
                      <div className="px-3 py-1.5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-cyan-400 text-[11px]">test_script.py</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(comp.experiment?.testCode)}
                            className="hover:text-white flex items-center gap-1 text-[11px]"
                          >
                            {copiedCode ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-3 font-mono text-xs text-cyan-200 overflow-x-auto max-h-56 scrollbar-thin scrollbar-thumb-slate-800">
                        <pre className="whitespace-pre">{comp.experiment?.testCode}</pre>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onUploadCode?.(comp.experiment?.testCode)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Upload size={13} />
                        <span>Run Test Script on TITAN</span>
                      </button>
                      <button
                        onClick={() => onOpenSerialMonitor?.()}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Terminal size={13} className="text-emerald-400" />
                        <span>Open Serial Monitor</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB 5: ASSEMBLY GUIDE ================= */}
        {activeTab === 'assembly' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">4-Bar Linkage 8-Leg Assembly Guide</h3>
                <p className="text-xs text-slate-400 mt-1">Follow the 4 mechanical assembly phases to assemble the walking mechanism.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.assembly?.map(item => (
                <div key={item.step} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: FIRMWARE CODE ================= */}
        {activeTab === 'code' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Production MicroPython Script</h3>
                <p className="text-xs text-slate-400">Complete autonomous tracking firmware ready for 1-click deployment on LOF TITAN.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(project.code)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => onUploadCode?.(project.code)}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Upload size={13} />
                  <span>Upload & Run on TITAN</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#060911] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-4 font-mono text-xs text-sky-200 overflow-x-auto max-h-[420px] scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
                <pre className="whitespace-pre">{project.code}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: MISSIONS & CHALLENGES ================= */}
        {activeTab === 'challenges' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-white">Autonomous Robotics Coding Challenges</h3>
              <p className="text-xs text-slate-400 mt-1">Test your programming skills by solving these 3 autonomous mission levels in Block Code Studio!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {project.challenges?.map(ch => (
                <div key={ch.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ch.level === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
                        ch.level === 'Intermediate' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {ch.level}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{ch.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{ch.goal}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-amber-300/90">
                    <strong>💡 Hint:</strong> {ch.hint}
                  </div>

                  <button
                    onClick={() => onOpenBlockCode?.()}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Code size={13} />
                    <span>Solve in Block Studio</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 8: FAQ & TROUBLESHOOTING ================= */}
        {activeTab === 'faq' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-white">Frequently Asked Questions & Hardware Troubleshooting</h3>
              <p className="text-xs text-slate-400 mt-1">Solutions to common walking kinematics and sensor calibration questions.</p>
            </div>

            <div className="space-y-3">
              {project.faq?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                    <HelpCircle size={15} className="text-cyan-400 shrink-0" />
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-xs text-slate-300 pl-6 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
