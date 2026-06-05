import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, Users, TrendingUp, Shield, Shirt, Smartphone, Sparkles, Home, Trophy, UtensilsCrossed, Palette, Gem, Zap, Timer, type LucideIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ProductCard } from '../components/ProductCard';
import { VendorCard } from '../components/VendorCard';
import { apiGetProducts, apiGetVendors, apiGetCategories, ApiProduct, ApiVendor } from '../services/api';

const categoryIcons: Record<string, LucideIcon> = {
  Shirt, Smartphone, Sparkles, Home, Trophy, UtensilsCrossed, Palette, Gem,
};

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);
  const [flashProducts, setFlashProducts] = useState<ApiProduct[]>([]);
  const [topVendors, setTopVendors] = useState<ApiVendor[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 59, s: 59 });

  useEffect(() => {
    document.title = 'AfroMarket — Marketplace africaine';
    apiGetProducts({ featured: true }).then(p => { setFeaturedProducts(p.slice(0, 4)); setFlashProducts(p.filter(p => p.originalPrice).slice(0, 4)); }).catch(() => {});
    apiGetVendors().then(v => setTopVendors(v.slice(0, 4))).catch(() => {});
    apiGetCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 5, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-500">
                #1 Marketplace en Afrique
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Découvrez les meilleurs produits{' '}
                <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  africains
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connectez-vous avec des milliers de vendeurs locaux et trouvez des produits uniques et authentiques.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/marketplace">
                  <Button size="lg" className="gap-2">
                    Explorer la marketplace
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/become-vendor">
                  <Button size="lg" variant="outline" className="gap-2">
                    Devenir vendeur
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-orange-600">12K+</div>
                  <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">234</div>
                  <div className="text-sm text-gray-600">Vendeurs vérifiés</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">1.5K+</div>
                  <div className="text-sm text-gray-600">Produits</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop"
                    alt="Product 1"
                    className="rounded-2xl shadow-2xl"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop"
                    alt="Product 2"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop"
                    alt="Product 3"
                    className="rounded-2xl shadow-2xl"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=500&fit=crop"
                    alt="Product 4"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir AfroMarket ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une plateforme moderne, sécurisée et facile à utiliser pour tous vos achats
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Large sélection</h3>
              <p className="text-sm text-gray-600">
                Des milliers de produits dans toutes les catégories
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-2">Vendeurs vérifiés</h3>
              <p className="text-sm text-gray-600">
                Tous nos vendeurs sont vérifiés pour votre sécurité
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Paiement sécurisé</h3>
              <p className="text-sm text-gray-600">
                Vos transactions sont 100% sécurisées
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Livraison rapide</h3>
              <p className="text-sm text-gray-600">
                Livraison dans toute l'Afrique
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Catégories populaires</h2>
              <p className="text-gray-600">Explorez nos catégories les plus demandées</p>
            </div>
            <Link to="/categories">
              <Button variant="outline" className="gap-2">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => {
              const Icon = categoryIcons[category.icon];
              return (
                <Link
                  key={category.id}
                  to={`/marketplace?category=${category.id}`}
                  className="group p-6 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-pink-600 transition-all duration-300 text-center"
                >
                  <div className="flex items-center justify-center h-10 w-10 mx-auto mb-3 rounded-xl bg-orange-100 group-hover:bg-white/20 transition-colors">
                    {Icon && <Icon className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />}
                  </div>
                  <h3 className="font-semibold group-hover:text-white transition-colors">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flash Sales */}
      {flashProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-red-500 to-orange-500">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Flash Sales</h2>
                  <p className="text-red-100 text-sm">Offres limitées — ne ratez pas !</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <Timer className="h-5 w-5 text-white" />
                <span className="text-white font-mono font-bold text-lg">
                  {String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Produits en vedette</h2>
              <p className="text-gray-600">Les produits les plus populaires du moment</p>
            </div>
            <Link to="/marketplace">
              <Button variant="outline" className="gap-2">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Vendeurs vérifiés</h2>
              <p className="text-gray-600">Découvrez nos meilleurs vendeurs</p>
            </div>
            <Link to="/vendors">
              <Button variant="outline" className="gap-2">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-orange-500 to-pink-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à vendre vos produits ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des centaines de vendeurs qui font confiance à AfroMarket pour développer leur business
          </p>
          <Link to="/become-vendor">
            <Button size="lg" variant="secondary" className="gap-2">
              Créer ma boutique
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
