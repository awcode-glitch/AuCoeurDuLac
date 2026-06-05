import { Link } from 'react-router-dom';
import { Star, MapPin, ShoppingBag, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ApiVendor } from '../services/api';

interface VendorCardProps {
  vendor: ApiVendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-orange-500 to-pink-600">
        <img
          src={vendor.banner}
          alt={vendor.name}
          className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3 -mt-10 mb-3">
          <div className="relative">
            <img
              src={vendor.avatar}
              alt={vendor.name}
              className="h-20 w-20 rounded-full border-4 border-white object-cover"
            />
            {vendor.verified && (
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                <BadgeCheck className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 mt-8">
            <div className="flex items-start justify-between">
              <div>
                <Link to={`/vendor/${vendor.id}`}>
                  <h3 className="font-semibold text-lg hover:text-orange-600 transition-colors">
                    {vendor.name}
                  </h3>
                </Link>
                {vendor.verified && (
                  <Badge variant="secondary" className="mt-1">
                    Vérifié
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {vendor.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span>{vendor.location}</span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{vendor.rating}</span>
            <span className="text-gray-600">({vendor.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingBag className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">{vendor.products} produits</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {vendor.categories.slice(0, 2).map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
          {vendor.categories.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{vendor.categories.length - 2}
            </Badge>
          )}
        </div>

        <Link to={`/vendor/${vendor.id}`}>
          <Button className="w-full" size="sm">
            Visiter la boutique
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
