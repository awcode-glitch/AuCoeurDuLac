import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { useWishlistStore } from '../store/wishlistStore';

export function WishlistPage() {
  const { items, clear } = useWishlistStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-7 w-7 fill-red-500 text-red-500" />
            <h1 className="text-3xl font-bold">Ma Wishlist</h1>
            <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={clear} className="gap-2 text-red-500 border-red-200 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Tout supprimer
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-red-300" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Votre wishlist est vide</h2>
            <p className="text-gray-500 mb-6">Ajoutez des produits en cliquant sur le cœur</p>
            <Link to="/marketplace">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700">
                Explorer la marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
