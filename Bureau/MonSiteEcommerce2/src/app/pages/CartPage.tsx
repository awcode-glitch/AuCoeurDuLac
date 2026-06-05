import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useCartStore } from '../store/cartStore';

const SHIPPING = 5000;

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

export function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const total = subtotal + SHIPPING;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
          <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer vos achats</p>
          <Link to="/marketplace">
            <Button className="gap-2">
              Découvrir la marketplace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Mon panier ({items.length} article{items.length > 1 ? 's' : ''})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div key={item.product.id}>
                      <div className="flex gap-4">
                        <Link to={`/product/${item.product.id}`}>
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-24 w-24 rounded-lg object-cover"
                          />
                        </Link>

                        <div className="flex-1">
                          <Link to={`/product/${item.product.id}`}>
                            <h3 className="font-semibold mb-1 hover:text-orange-600 transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <Link to={`/vendor/${item.product.vendorId}`}>
                            <p className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                              {item.product.vendorName}
                            </p>
                          </Link>
                          <p className="text-lg font-bold mt-2">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>

                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 font-semibold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {index < items.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-semibold">{formatPrice(SHIPPING)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-orange-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="w-full mb-3 gap-2" size="lg">
                    Passer la commande
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/marketplace">
                  <Button variant="outline" className="w-full">
                    Continuer mes achats
                  </Button>
                </Link>

                <div className="mt-6 p-4 bg-green-50 rounded-lg space-y-1">
                  <p className="text-sm text-green-800">✓ Paiement 100% sécurisé</p>
                  <p className="text-sm text-green-800">✓ Livraison suivie</p>
                  <p className="text-sm text-green-800">✓ Retours gratuits sous 30 jours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
