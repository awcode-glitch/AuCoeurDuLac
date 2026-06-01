import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? '';
const RATE_LIMIT_MS = 60 * 1000; // 1 minute entre chaque envoi

export function LocalisationContact() {
  const { tr } = useLanguage();
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', sujet: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'ratelimit'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastSent = parseInt(localStorage.getItem('lac_last_contact') ?? '0');
    if (Date.now() - lastSent < RATE_LIMIT_MS) {
      setStatus('ratelimit');
      return;
    }

    setStatus('sending');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: form.nom,
          email: form.email,
          phone: form.telephone,
          subject: `[${form.sujet}] Message de ${form.nom}`,
          message: form.message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        localStorage.setItem('lac_last_contact', Date.now().toString());
        setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="localisation-contact" className="py-24 bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center text-gray-900">{tr.locContact.title}</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl border border-pink-100 flex flex-col gap-6">

            <div>
              <label htmlFor="nom" className="block mb-2 font-semibold text-gray-700">{tr.locContact.name}</label>
              <input type="text" id="nom" name="nom" value={form.nom} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff2d7a] focus:ring-1 focus:ring-[#ff2d7a]"
                placeholder={tr.locContact.namePlaceholder} />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">{tr.locContact.email}</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff2d7a] focus:ring-1 focus:ring-[#ff2d7a]"
                placeholder={tr.locContact.emailPlaceholder} />
            </div>

            <div>
              <label htmlFor="telephone" className="block mb-2 font-semibold text-gray-700">Téléphone</label>
              <input type="tel" id="telephone" name="telephone" value={form.telephone} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff2d7a] focus:ring-1 focus:ring-[#ff2d7a]"
                placeholder="+221 XX XXX XX XX" />
            </div>

            <div>
              <label htmlFor="sujet" className="block mb-2 font-semibold text-gray-700">Sujet</label>
              <select id="sujet" name="sujet" value={form.sujet} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#ff2d7a] focus:ring-1 focus:ring-[#ff2d7a]">
                <option value="" disabled>Choisissez un sujet</option>
                <option value="Réservation">Réservation</option>
                <option value="Demande d'information">Demande d'information</option>
                <option value="Demande pour un groupe">Demande pour un groupe</option>
                <option value="Autre demande">Autre demande</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 font-semibold text-gray-700">{tr.locContact.message}</label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff2d7a] focus:ring-1 focus:ring-[#ff2d7a]"
                placeholder={tr.locContact.messagePlaceholder} />
            </div>

            <button type="submit" disabled={status === 'sending'}
              className="w-full py-3 rounded-lg bg-white text-[#ff2d7a] font-bold text-lg hover:bg-pink-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {status === 'sending' ? '⏳ Envoi...' : tr.locContact.send}
            </button>

            {status === 'success' && (
              <div className="text-green-600 font-semibold text-center">✅ {tr.locContact.thanks}</div>
            )}
            {status === 'error' && (
              <div className="text-red-500 font-semibold text-center">❌ Erreur lors de l'envoi. Réessayez.</div>
            )}
            {status === 'ratelimit' && (
              <div className="text-orange-500 font-semibold text-center">⏳ Veuillez attendre 1 minute avant de renvoyer un message.</div>
            )}
          </form>

          <div className="flex flex-col gap-3">
            <a
              href="https://www.google.com/maps/place/14%C2%B050'01.3%22N+17%C2%B014'54.9%22W/@14.8336926,-17.2485886,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white border-2 border-[#ff2d7a] text-[#ff2d7a] font-semibold rounded-full hover:bg-pink-50 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Ouvrir avec Google Maps
            </a>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-pink-100 h-full min-h-[500px]">
            <iframe
              title="Carte Lac Rose Dakar"
              src="https://maps.google.com/maps?q=14.8336926,-17.2485886&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '500px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
