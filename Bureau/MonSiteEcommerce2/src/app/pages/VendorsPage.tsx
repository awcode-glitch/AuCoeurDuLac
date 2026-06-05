import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { VendorCard } from '../components/VendorCard';
import { apiGetVendors, apiGetLocations, ApiVendor } from '../services/api';
const PER_PAGE = 12;

function PaginatorBar({ page, total, onPageChange }: { page: number; total: number; onPageChange: (p: number) => void }) {
  if (total <= 1) return null;

  const getRange = () => {
    const delta = 2;
    const range: (number | '…')[] = [];
    let prev = 0;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
        if (prev && i - prev > 1) range.push('…');
        range.push(i);
        prev = i;
      }
    }
    return range;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      <Button variant="outline" size="icon" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {getRange().map((item, i) =>
        item === '…' ? (
          <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <Button
            key={item}
            variant={page === item ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(item as number)}
          >
            {item}
          </Button>
        )
      )}
      <Button variant="outline" size="icon" disabled={page === total} onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiGetLocations().then(setLocations).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    apiGetVendors({ search: searchQuery, location: selectedLocation, verified: verifiedOnly || undefined })
      .then(setVendors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchQuery, selectedLocation, verifiedOnly]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedLocation, verifiedOnly]);

  const totalPages = Math.max(1, Math.ceil(vendors.length / PER_PAGE));
  const pageItems = vendors.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Boutiques</h1>
          <p className="text-gray-600 mb-6">Découvrez tous nos vendeurs vérifiés</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher une boutique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={verifiedOnly ? 'default' : 'outline'}
              onClick={() => setVerifiedOnly(!verifiedOnly)}
            >
              Vendeurs vérifiés seulement
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedLocation === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLocation('')}
            >
              Toutes les villes
            </Button>
            {locations.map(loc => (
              <Button
                key={loc}
                variant={selectedLocation === loc ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLocation(selectedLocation === loc ? '' : loc)}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {loc}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {vendors.length} boutique{vendors.length > 1 ? 's' : ''} trouvée{vendors.length > 1 ? 's' : ''}
            {totalPages > 1 && (
              <span className="text-gray-400 text-sm ml-2">— page {page}/{totalPages}</span>
            )}
          </p>
          {(searchQuery || selectedLocation || verifiedOnly) && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={clearFilters}
            >
              Effacer les filtres ×
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-4">Aucune boutique trouvée</p>
            <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageItems.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
            <PaginatorBar page={page} total={totalPages} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </div>
    </div>
  );
}
