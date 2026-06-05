import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { ProductCard } from '../components/ProductCard';
import { apiGetProductsPaginated, apiGetCategories, apiGetLocations, ApiProduct } from '../services/api';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '../components/ui/sheet';

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
          <Button key={item} variant={page === item ? 'default' : 'outline'} size="icon"
            onClick={() => onPageChange(item as number)}>
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

export function MarketplacePage() {
  const [searchParams] = useSearchParams();

  const [searchQuery,        setSearchQuery]        = useState(() => searchParams.get('search') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get('category');
    return cat ? [cat] : [];
  });
  const [priceRange,       setPriceRange]       = useState([0, 500000]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy,           setSortBy]           = useState('featured');
  const [page,             setPage]             = useState(1);

  const [products,   setProducts]   = useState<ApiProduct[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [locations,  setLocations]  = useState<string[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    document.title = 'Marketplace | AfroMarket';
    apiGetCategories().then(setCategories).catch(() => {});
    apiGetLocations().then(setLocations).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    apiGetProductsPaginated({
      search:   searchQuery || undefined,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      location: selectedLocation || undefined,
      sort:     sortBy,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
      page,
      perPage:  PER_PAGE,
    })
      .then(data => {
        setProducts(data.items);
        setTotal(data.total);
        setTotalPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchQuery, selectedCategories, selectedLocation, sortBy, priceRange, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetPage = () => setPage(1);

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
    resetPage();
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 500000]);
    setSearchQuery('');
    setSelectedLocation('');
    resetPage();
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Catégories</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={() => toggleCategory(category.name)}
              />
              <Label htmlFor={category.id} className="text-sm cursor-pointer">{category.name}</Label>
            </div>
          ))}
        </div>
      </div>

      {locations.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-500" />
            Localisation
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => { setSelectedLocation(''); resetPage(); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedLocation === '' ? 'bg-orange-100 text-orange-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              Toutes les villes
            </button>
            {locations.map(loc => (
              <button
                key={loc}
                onClick={() => { setSelectedLocation(selectedLocation === loc ? '' : loc); resetPage(); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedLocation === loc ? 'bg-orange-100 text-orange-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-4">Prix (FCFA)</h3>
        <Slider
          value={priceRange}
          onValueChange={v => { setPriceRange(v); resetPage(); }}
          max={500000}
          step={5000}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{priceRange[0].toLocaleString()}</span>
          <span>{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />Effacer les filtres
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">Marketplace</h1>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
                className="pl-10"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 md:hidden">
                  <SlidersHorizontal className="h-5 w-5" />Filtres
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader><SheetTitle>Filtres</SheetTitle></SheetHeader>
                <div className="mt-6"><FilterContent /></div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {selectedLocation && (
              <Badge variant="secondary" className="gap-2 bg-orange-100 text-orange-700">
                <MapPin className="h-3 w-3" />{selectedLocation}
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedLocation(''); resetPage(); }} />
              </Badge>
            )}
            {selectedCategories.map(c => (
              <Badge key={c} variant="secondary" className="gap-2">
                {c}<X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(c)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                {totalPages > 1 && (
                  <span className="text-gray-400 text-sm ml-2">— page {page}/{totalPages}</span>
                )}
              </p>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); resetPage(); }}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                <option value="featured">En vedette</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(PER_PAGE)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 mb-4">Aucun produit trouvé</p>
                <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <PaginatorBar page={page} total={totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
