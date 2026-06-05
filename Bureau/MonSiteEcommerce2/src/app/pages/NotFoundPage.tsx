import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-orange-500 mb-2">404</div>
        <div className="text-6xl mb-6">🛍️</div>
        <h1 className="text-2xl font-bold mb-3">Page introuvable</h1>
        <p className="text-gray-600 mb-8">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Marketplace
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}
