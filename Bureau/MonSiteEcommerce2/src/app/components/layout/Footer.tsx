import { Link } from 'react-router-dom';
import { Store, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-600">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                AfroMarket
              </span>
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              La marketplace africaine qui connecte vendeurs et acheteurs à travers le continent.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">À propos</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="cursor-default">Qui sommes-nous</span></li>
              <li><span className="cursor-default">Comment ça marche</span></li>
              <li>
                <Link to="/become-vendor" className="hover:text-orange-600 transition-colors">
                  Devenir vendeur
                </Link>
              </li>
              <li><span className="cursor-default">Carrières</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="cursor-default">Centre d'aide</span></li>
              <li><span className="cursor-default">FAQ</span></li>
              <li><span className="cursor-default">Livraison</span></li>
              <li><span className="cursor-default">Retours</span></li>
              <li><span className="cursor-default">Conditions d'utilisation</span></li>
              <li><span className="cursor-default">Politique de confidentialité</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-orange-600" />
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                <span>+221 77 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-600" />
                <span>contact@afromarket.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} AfroMarket. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
