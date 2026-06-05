import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

export function OrderConfirmationPage() {
  const { state } = useLocation();
  const orderId = state?.orderId ?? '—';
  const total   = state?.total   ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Commande confirmée !</h1>
          <p className="text-gray-600 mb-2">
            Merci pour votre commande. Nous avons bien reçu votre paiement.
          </p>

          <div className="inline-flex flex-col items-center gap-1 my-6 px-6 py-4 bg-orange-50 rounded-xl border border-orange-200">
            <span className="text-sm text-gray-500">Numéro de commande</span>
            <span className="text-2xl font-bold text-orange-600">{orderId}</span>
            {total !== null && (
              <span className="text-sm font-semibold text-gray-700">{formatPrice(total)}</span>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-4 mb-4">
              <Package className="h-6 w-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Prochaines étapes</h3>
                <p className="text-sm text-gray-600">Le vendeur va préparer votre commande</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 ml-10">
              <p>✓ Confirmation enregistrée dans votre espace</p>
              <p>✓ Le vendeur prépare votre commande</p>
              <p>✓ Expédition sous 1-2 jours ouvrables</p>
              <p>✓ Livraison estimée : 2-5 jours ouvrables</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/orders" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                Suivre ma commande
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/marketplace" className="flex-1">
              <Button className="w-full">Continuer mes achats</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
