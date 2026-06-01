import { useState } from 'react';
import { Check } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from '../context/LanguageContext';
import img3 from '../../imports/image-3.png';
import img4 from '../../imports/image-4.png';
import img5 from '../../imports/image-5.png';

const packsStatic = [
  { id: 0, image: img3, overlayColor: 'from-gray-900/60 to-gray-700/30', price: '20,000', highlight: false, color: 'border-gray-200',                         buttonColor: 'bg-gray-900 hover:bg-gray-800' },
  { id: 1, image: img4, overlayColor: 'from-[#ff2d7a]/70 to-pink-400/30', price: '24,500', highlight: true,  color: 'border-[#ff2d7a] ring-4 ring-pink-100',   buttonColor: 'bg-gradient-to-r from-[#ff2d7a] to-pink-600 hover:shadow-xl', badge: true },
  { id: 2, image: img5, overlayColor: 'from-[#f97316]/70 to-orange-400/30',price: '25,000', highlight: false, color: 'border-[#f97316] ring-2 ring-orange-100', buttonColor: 'bg-gradient-to-r from-[#f97316] to-orange-600 hover:shadow-xl' },
];

export function Packs() {
  const { tr } = useLanguage();
  const packs = packsStatic.map((s, i) => ({ ...s, ...tr.packsData[i] }));
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<{ name: string; price: string } | null>(null);

  const handleBookNow = (packName: string, packPrice: string) => {
    setSelectedPack({ name: packName, price: packPrice });
    setIsBookingModalOpen(true);
  };

  return (
    <section id="packs" className="py-24 bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-orange-100 text-[#f97316] px-4 py-2 rounded-full text-sm font-medium mb-4">
            {tr.packs.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {tr.packs.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {tr.packs.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`relative bg-white rounded-3xl overflow-hidden shadow-xl ${pack.color} border-2 transition-all duration-300 hover:shadow-2xl ${
                pack.highlight ? 'transform md:-translate-y-4' : 'hover:-translate-y-2'
              }`}
            >
              {/* Badge */}
              {'badge' in pack && pack.badge && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-[#f97316] to-orange-500 text-white px-5 py-1.5 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
                    {tr.packs.popular}
                  </div>
                </div>
              )}

              {/* Photo avec titre en overlay */}
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={pack.image}
                  alt={pack.name}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${pack.overlayColor}`} />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold drop-shadow">{pack.name}</h3>
                  <p className="text-sm opacity-90 drop-shadow">{pack.subtitle}</p>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-5xl font-bold text-gray-900">{pack.price}</span>
                    <span className="text-xl text-gray-600">FCFA</span>
                  </div>
                  <p className="text-gray-500 text-sm">{tr.packs.perPerson}</p>
                </div>

                <div className="space-y-3 mb-8">
                  {pack.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${
                        pack.highlight
                          ? 'bg-gradient-to-br from-[#ff2d7a] to-pink-600'
                          : 'bg-gray-100'
                      } flex items-center justify-center`}>
                        <Check className={`w-4 h-4 ${pack.highlight ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className="text-gray-700 flex-1 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleBookNow(pack.name, pack.price)}
                    className={`w-full py-4 rounded-full text-white font-medium transition-all ${pack.buttonColor} transform hover:-translate-y-1`}
                  >
                    {tr.packs.bookNow}
                  </button>
                  <a
                    href="https://wa.me/221711358759"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all text-center"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>


        {selectedPack && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => { setIsBookingModalOpen(false); setSelectedPack(null); }}
            packName={selectedPack.name}
            packPrice={selectedPack.price}
          />
        )}
      </div>
    </section>
  );
}

function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
