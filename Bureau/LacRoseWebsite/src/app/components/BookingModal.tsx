import { useState } from 'react';
import { X, Calendar, Users, CheckCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packName: string;
  packPrice: string;
}

export interface BookingData {
  packName: string;
  packPrice: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: Date;
  numberOfPeople: number;
  totalAmount: number;
}

export function BookingModal({ isOpen, onClose, packName, packPrice }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  if (!isOpen) return null;

  const pricePerPerson = parseInt(packPrice.replace(/[^0-9]/g, ''));
  const totalAmount = pricePerPerson * numberOfPeople;
  const disabledDays = { before: new Date() };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate) { setError('Veuillez sélectionner une date.'); return; }
    if (!customerEmail.includes('@')) { setError('Veuillez saisir une adresse email valide.'); return; }
    if (!/^\+?[0-9]{8,15}$/.test(customerPhone.replace(/\s+/g, ''))) {
      setError('Veuillez saisir un numéro de téléphone valide.'); return;
    }

    setStatus('sending');

    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `🏍️ Nouvelle demande de réservation — ${packName}`,
        name: customerName,
        email: customerEmail,
        message: `
Nouvelle demande de réservation !

👤 Nom : ${customerName}
📧 Email : ${customerEmail}
📞 Téléphone : ${customerPhone}

🏍️ Pack : ${packName}
📅 Date souhaitée : ${selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
👥 Personnes : ${numberOfPeople}
💰 Total estimé : ${totalAmount.toLocaleString()} FCFA
        `.trim(),
      }),
    });

    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée !</h2>
          <p className="text-gray-600 mb-2">
            Merci <strong>{customerName}</strong>, votre demande de réservation pour le <strong>{packName}</strong> a bien été reçue.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Notre équipe vous contactera très prochainement au <strong>{customerPhone}</strong> ou par email pour confirmer votre réservation.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#ff2d7a] to-pink-600 text-white font-semibold hover:shadow-xl transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#ff2d7a] to-pink-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Réserver {packName}</h2>
            <p className="text-pink-100">Complétez vos informations</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            aria-label="Fermer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8" aria-live="polite">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#ff2d7a]" />
                Sélectionnez une date
              </h3>
              <div className="border border-gray-200 rounded-2xl p-4 booking-calendar">
                <DayPicker mode="single" selected={selectedDate} onSelect={setSelectedDate}
                  disabled={disabledDays} className="mx-auto" />
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#ff2d7a]" />
                  Nombre de personnes
                </label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold">-</button>
                  <span className="text-2xl font-bold text-gray-900 w-12 text-center">{numberOfPeople}</span>
                  <button type="button" onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold">+</button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos informations</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                  <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff2d7a] focus:border-transparent"
                    placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff2d7a] focus:border-transparent"
                    placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                  <input type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff2d7a] focus:border-transparent"
                    placeholder="+221 XX XXX XX XX" />
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl border border-pink-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Prix par personne</span>
                  <span className="font-semibold">{packPrice} FCFA</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Nombre de personnes</span>
                  <span className="font-semibold">{numberOfPeople}</span>
                </div>
                <div className="border-t border-pink-200 my-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total estimé</span>
                  <span className="text-2xl font-bold text-[#ff2d7a]">{totalAmount.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={status === 'sending'}
              className="flex-1 py-4 rounded-full bg-gradient-to-r from-[#ff2d7a] to-pink-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-60">
              {status === 'sending' ? '⏳ Envoi...' : '✅ Valider ma réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
