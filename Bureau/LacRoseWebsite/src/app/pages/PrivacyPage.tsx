import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ff2d7a] to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold">Politique de Confidentialité</h1>
          <p className="mt-4 text-white/80">Dernière mise à jour : Mai 2026</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Qui sommes-nous ?</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>Au Coeur du Lac</strong> est une entreprise de tourisme et d'activités de plein air située au Lac Rose (Lac Retba), Dakar, Sénégal.
            Nous proposons des balades en quad, pirogue, cheval et dromadaire.
            <br /><br />
            Contact : <a href="mailto:aucoeurdulac5@gmail.com" className="text-[#ff2d7a] hover:underline">aucoeurdulac5@gmail.com</a> — Tél : <a href="tel:+221711358759" className="text-[#ff2d7a] hover:underline">+221 71 135 87 59</a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Données collectées</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Nous collectons les données suivantes lorsque vous utilisez notre site :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Formulaire de contact :</strong> nom, adresse e-mail, numéro de téléphone, message</li>
            <li><strong>Formulaire de réservation :</strong> nom, e-mail, téléphone, date, nombre de participants</li>
            <li><strong>Newsletter :</strong> adresse e-mail uniquement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation des données</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Vos données sont utilisées exclusivement pour :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Traiter et confirmer vos réservations</li>
            <li>Répondre à vos demandes de contact</li>
            <li>Vous envoyer des informations sur nos offres (si vous y avez consenti)</li>
            <li>Améliorer nos services</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers à des fins commerciales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Conservation des données</h2>
          <p className="text-gray-600 leading-relaxed">
            Vos données sont conservées uniquement le temps nécessaire au traitement de votre demande ou réservation, et au maximum pendant <strong>12 mois</strong> après votre dernière interaction avec nous.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Vos droits</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Vous disposez des droits suivants concernant vos données personnelles :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit de suppression :</strong> demander la suppression de vos données</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:aucoeurdulac5@gmail.com" className="text-[#ff2d7a] hover:underline">aucoeurdulac5@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            Notre site utilise uniquement des cookies techniques essentiels au bon fonctionnement (préférence de langue). Nous n'utilisons pas de cookies publicitaires ou de traçage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sécurité</h2>
          <p className="text-gray-600 leading-relaxed">
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications</h2>
          <p className="text-gray-600 leading-relaxed">
            Nous nous réservons le droit de modifier cette politique à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour.
          </p>
        </section>

        <div className="border-t border-gray-200 pt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ff2d7a] to-pink-600 text-white rounded-full hover:shadow-lg transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
