import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { ApiProduct, apiToggleWishlist } from '../services/api';

interface ProductCardProps {
  product: ApiProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const { toggle, has } = useWishlistStore();
  const { user } = useAuthStore();
  const isFavorite = has(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product);
    if (user) {
      apiToggleWishlist(product.id).catch(() => toggle(product)); // rollback si erreur
    }
  };
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {product.featured && (
            <Badge className="absolute top-3 left-3 bg-orange-500">
              Populaire
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-red-500">
              -{discount}%
            </Badge>
          )}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
            />
          </button>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <img
            src={product.vendorAvatar}
            alt={product.vendorName}
            className="h-6 w-6 rounded-full"
          />
          <span className="text-sm text-gray-600">{product.vendorName}</span>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.reviews})
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
          </span>
        </div>

        <div className="flex gap-2">
          <Link to={`/product/${product.id}`} className="flex-1">
            <Button className="w-full" size="sm">
              Voir détails
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
