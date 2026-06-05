import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, Smartphone, Sparkles, Home, Trophy, UtensilsCrossed, Palette, Gem, type LucideIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { apiGetCategories, apiGetProducts, ApiProduct } from '../services/api';

const categoryIcons: Record<string, LucideIcon> = {
  Shirt, Smartphone, Sparkles, Home, Trophy, UtensilsCrossed, Palette, Gem,
};

const categoryColors: Record<string, string> = {
  '1': 'from-orange-400 to-pink-500',
  '2': 'from-blue-400 to-cyan-500',
  '3': 'from-purple-400 to-pink-400',
  '4': 'from-green-400 to-teal-500',
  '5': 'from-yellow-400 to-orange-400',
  '6': 'from-red-400 to-orange-500',
  '7': 'from-indigo-400 to-purple-500',
  '8': 'from-yellow-300 to-yellow-500',
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGetCategories(),
      apiGetProducts(),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Catégories</h1>
          <p className="text-gray-600">Explorez nos produits par catégorie</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {categories.map(category => {
          const Icon = categoryIcons[category.icon];
          const categoryProducts = products.filter(p => p.category === category.name).slice(0, 4);
          const total = products.filter(p => p.category === category.name).length;
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category.id}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br ${categoryColors[category.id] ?? 'from-gray-400 to-gray-500'} shadow-md`}>
                    {Icon && <Icon className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-sm text-gray-500">
                      {total} produit{total > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Link to={`/marketplace?category=${encodeURIComponent(category.name)}`}>
                  <Button variant="outline" className="gap-2">
                    Voir tout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
