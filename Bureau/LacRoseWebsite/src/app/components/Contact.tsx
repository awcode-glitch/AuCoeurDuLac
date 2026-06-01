import { Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Contact() {
  const { tr } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            {tr.contact.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{tr.contact.title}</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{tr.contact.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-[#ff2d7a] to-pink-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{tr.contact.phone}</h3>
            <a href="tel:+221711358759" className="text-pink-300 hover:text-pink-200 transition-colors">+221 71 135 87 59</a>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{tr.contact.whatsapp}</h3>
            <a href="https://wa.me/221711358759" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-green-200 transition-colors">
              {tr.contact.chatNow}
            </a>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-[#f97316] to-orange-600 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{tr.contact.location}</h3>
            <p className="text-gray-300">Lac Rose<br />Dakar, Sénégal</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{tr.contact.email}</h3>
            <a href="mailto:aucoeurdulac5@gmail.com" className="text-blue-300 hover:text-blue-200 transition-colors">aucoeurdulac5@gmail.com</a>
          </div>
        </div>

      </div>
    </section>
  );
}
