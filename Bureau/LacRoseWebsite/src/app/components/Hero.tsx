import { ArrowRight, MapPin, Shield, Camera, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Hero() {
  const { tr } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Vidéo de fond */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover" style={{ objectPosition: '50% 30%' }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <div className="bg-gradient-to-r from-[#ff2d7a] to-[#f97316] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              {tr.hero.badge}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg">
            {tr.hero.title1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d7a] to-[#f97316]">
              {tr.hero.title2}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow">
            {tr.hero.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="#packs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff2d7a] text-white rounded-full hover:bg-[#e01d6a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {tr.hero.bookNow}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <MapPin className="w-8 h-8 text-[#ff2d7a] mx-auto mb-3" />
              <div className="text-sm text-white/80">{tr.hero.location}</div>
              <div className="font-semibold text-white">Lac Rose, Dakar</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <Shield className="w-8 h-8 text-[#f97316] mx-auto mb-3" />
              <div className="text-sm text-white/80">{tr.hero.activities}</div>
              <div className="font-semibold text-white">{tr.hero.secure}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <Camera className="w-8 h-8 text-[#ff2d7a] mx-auto mb-3" />
              <div className="text-sm text-white/80">{tr.hero.photos}</div>
              <div className="font-semibold text-white">{tr.hero.souvenirs}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <Clock className="w-8 h-8 text-[#f97316] mx-auto mb-3" />
              <div className="text-sm text-white/80">{tr.hero.hours}</div>
              <div className="font-semibold text-white">{tr.hero.flexible}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
