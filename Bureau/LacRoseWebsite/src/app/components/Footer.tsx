import { Instagram, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { tr } = useLanguage();

  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-[#ff2d7a]">Au Coeur du Lac</span>
            </h3>
            <p className="text-gray-400 mb-4">{tr.footer.description}</p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/lac_rose_visite221?igsh=aWhxMDdkZ2h6NTIx" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff2d7a] transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://vm.tiktok.com/ZS9YU9GtF7QgT-6yUE2/" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ff2d7a] transition-all">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" stroke="currentColor">
                  <path d="M30 6v24a6 6 0 1 1-6-6h6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M30 6c0 6 4 10 10 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{tr.footer.experiences}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#galerie" className="hover:text-[#ff2d7a] transition-colors">Quad</a></li>
              <li><a href="#galerie" className="hover:text-[#ff2d7a] transition-colors">{tr.gallery.cheval}</a></li>
              <li><a href="#galerie" className="hover:text-[#ff2d7a] transition-colors">{tr.gallery.dromadaire}</a></li>
              <li><a href="#galerie" className="hover:text-[#ff2d7a] transition-colors">{tr.gallery.pirogue}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{tr.footer.informations}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/privacy" className="hover:text-[#ff2d7a] transition-colors">{tr.footer.privacy}</Link></li>
              <li><a href="#faq" className="hover:text-[#ff2d7a] transition-colors">{tr.footer.faq}</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">{tr.footer.rights}</p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            {tr.footer.madeWith} <Heart className="w-4 h-4 text-[#ff2d7a] fill-current mx-1" /> {tr.footer.inSenegal}
          </p>
        </div>
      </div>
    </footer>
  );
}
