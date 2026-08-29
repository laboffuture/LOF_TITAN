import { useNavigate } from 'react-router-dom';
import { Cpu, ChevronRight, Lock, Check, Clock } from 'lucide-react';
import { Carousel } from '../components/Carousel';
import { projects } from '../projects';
import { useAuth } from '../auth/authContext';
import { getKit, isAvailable } from '../auth/kits';
import { Img } from '../components/Img';
import { cld } from '../lib/cld';

const carouselItems = [
  {
    id: 'axes3',
    title: 'Axes 3 DIY Kit',
    description:
      'Advanced multi-axis robotics system engineered for precision motion, intelligent telemetry, and autonomous mission control.',
    image: 'lof-titan/banners/banner-axes3',
    badge: 'DIY Robotics Kit',
    buttonText: 'Explore Now',
  },
  {
    id: 'aquanova',
    title: 'Aqua Nova DIY Kit',
    description:
      'Build a fully functional sensing rover that detects motion and water to navigate unpredictable terrain and aquatic environments.',
    image: 'lof-titan/banners/banner-aquanova-diy',
    badge: 'DIY Sensing Kit',
    buttonText: 'Explore Now',
  },
  {
    id: 'invisible-line',
    title: 'Invisible Line Patrol DIY Kit',
    description:
      'UV light-following 4-bar linkage walking robot engineered for autonomous line detection and kinetic robotic locomotion.',
    image: 'lof-titan/banners/banner-invisible-diy',
    badge: 'DIY Walking Robot',
    buttonText: 'Explore Now',
  },
  {
    id: 'heat-seek-rover',
    title: 'Heat Seek Rover DIY Kit',
    description:
      'Intelligent surrounding scanner with autonomous obstacle avoidance and integrated flame sensing technology for real-time fire detection.',
    image: 'lof-titan/banners/banner-heatseek-diy',
    badge: 'DIY Flame Rover',
    buttonText: 'Explore Now',
  },
  {
    id: 'heartbeat',
    title: 'Heart Beat DJ Bot DIY Kit',
    description:
      'Interactive musical bot that detects a person’s heartbeat pulse and dynamically generates rhythmic tunes and music beats.',
    image: 'lof-titan/banners/banner-heartbeat-diy',
    badge: 'DIY Music Bot',
    buttonText: 'Explore Now',
  },
];

// Kits without content in projects.js are advertised but not yet openable. Previously
// clicking one silently opened a different kit; now it is labelled honestly.
const slides = carouselItems.map((item) => ({
  ...item,
  badge: isAvailable(item.id) ? item.badge : `${item.badge} · Coming Soon`,
}));

export function Dashboard() {
  const navigate = useNavigate();
  const { entitlements } = useAuth();

  const openKit = (kitId) => {
    if (!isAvailable(kitId)) return;
    navigate(`/kit/${kitId}`);
  };

  return (
    <>
      <Carousel items={slides} onItemClick={(item) => openKit(item?.id)} />

      <section className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-xs shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-white">
                Project Store and DIY Kits
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 backdrop-blur-xs">
            {projects.length} Official Kits Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const owned = entitlements.includes(p.id);
            const kitName = getKit(p.id)?.name || p.name;

            return (
              <div
                key={p.id}
                onClick={() => openKit(p.id)}
                className="group rounded-3xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.07] hover:border-cyan-500/50 p-4 sm:p-5 cursor-pointer transition-all duration-300 shadow-md hover:shadow-[0_12px_35px_rgba(6,182,212,0.18)] backdrop-blur-xs flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                <div className="w-full h-56 rounded-2xl overflow-hidden relative bg-slate-950 border border-white/10 shadow-inner group-hover:border-cyan-500/30 transition-colors">
                  <Img
                    id={p.thumbnail || p.heroImage || 'lof-titan/invisible-line/invisible-line-main'}
                    alt={p.name}
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                      owned ? '' : 'opacity-70'
                    }`}
                    onError={(e) => {
                      // Clear srcset too, or the browser re-picks from it and
                      // the fallback src is ignored.
                      e.target.srcset = '';
                      e.target.src = cld('lof-titan/banners/banner-invisible-diy');
                    }}
                  />

                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-950/75 text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-sm">
                      {p.badge || 'DIY Kit'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {owned ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-md">
                        <Check size={11} /> Owned
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-950/80 text-slate-300 border border-white/20 backdrop-blur-md">
                        <Lock size={11} /> Locked
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <span>&#9733;</span>
                      <span>{p.rating || 4.9}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {p.duration || '45 Mins'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-purple-300">
                      {p.difficulty || 'Intermediate'}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {kitName}
                  </h3>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                  <span>{owned ? 'Open Kit & Mission' : 'Preview Kit'}</span>
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Advertised but not yet built */}
          {carouselItems
            .filter((item) => !isAvailable(item.id))
            .map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white/[0.01] border border-dashed border-white/10 p-4 sm:p-5 flex flex-col justify-between gap-4 opacity-60"
              >
                <div className="w-full h-56 rounded-2xl overflow-hidden relative bg-slate-950 border border-white/10 grayscale">
                  <Img
                    id={item.image}
                    alt={item.title}
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-950/80 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                      <Clock size={11} /> Coming Soon
                    </span>
                  </div>
                </div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white line-clamp-1">
                  {getKit(item.id)?.name || item.title}
                </h3>
                <div className="pt-3 border-t border-white/10 text-xs font-bold text-slate-500">
                  Not available yet
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
