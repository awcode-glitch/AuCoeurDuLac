import { Phone, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import logo from '../../imports/logo.jpeg';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

type NavbarProps = { onOpenReservation?: () => void };

export function Navbar({ onOpenReservation }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { tr } = useLanguage();

  return (
    <nav aria-label="Navigation principale" className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Au Coeur du Lac" className="h-12 w-12 rounded-full object-cover shadow-md" />
            <div className="text-2xl font-bold">
              <span className="text-[#ff2d7a]">Au Coeur du Lac</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <ul className="flex items-center gap-6" role="menubar">
              <li role="none">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-transparent text-gray-700 hover:text-[#ff2d7a] transition-colors px-4 py-2 rounded-full"
                  style={{ outline: 'none', border: 'none' }}
                >
                  Accueil
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  onClick={() => navigate('/galerie')}
                  className="bg-transparent text-gray-700 hover:text-[#ff2d7a] transition-colors px-4 py-2 rounded-full"
                  style={{ outline: 'none', border: 'none' }}
                >
                  {tr.nav.galerie}
                </button>
              </li>
              {/* Bouton Réserver */}
              <li role="none">
                <button
                  type="button"
                  onClick={() => navigate('/reservation')}
                  className="ml-2 px-8 py-3 bg-white border-2 border-pink-400 text-pink-500 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-all shadow font-medium text-base"
                >
                  {tr.nav.reserver}
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="bg-transparent text-gray-700 hover:text-[#ff2d7a] transition-colors px-4 py-2 rounded-full"
                  style={{ outline: 'none', border: 'none' }}
                >
                  {tr.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <a href="tel:+221711358759" className="flex items-center gap-2 px-6 py-3 bg-[#ff2d7a] text-white rounded-full hover:bg-[#e01d6a] transition-all shadow-lg hover:shadow-xl">
              <Phone className="w-4 h-4" />
              +221 71 135 87 59
            </a>
            <a href="tel:+221781606249" className="flex items-center gap-2 px-6 py-3 bg-[#ff2d7a] text-white rounded-full hover:bg-[#e01d6a] transition-all shadow-lg hover:shadow-xl">
              <Phone className="w-4 h-4" />
              +221 78 160 62 49
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-[#ff2d7a] rounded-lg transition-colors"
              onClick={() => { setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Accueil
            </a>
            <button
              type="button"
              onClick={() => { setIsMenuOpen(false); navigate('/reservation'); }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-[#ff2d7a] rounded-lg transition-colors"
            >
              {tr.nav.reserver}
            </button>
            <a
              href="/galerie"
              className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-[#ff2d7a] rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {tr.nav.galerie}
            </a>
            <a
              href="#contact"
              className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-[#ff2d7a] rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {tr.nav.contact}
            </a>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
            <a
              href="tel:+221711358759"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ff2d7a] text-white rounded-full hover:bg-[#e01d6a] transition-all"
            >
              <Phone className="w-4 h-4" />
              +221 71 135 87 59
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
