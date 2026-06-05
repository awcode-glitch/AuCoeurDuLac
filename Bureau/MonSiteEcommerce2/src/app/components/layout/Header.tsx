import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, User, Bell, Search, Menu, Store, LayoutDashboard, LogOut, Package, MessageCircle, Heart, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { apiUnreadCount, apiUnreadMessages, apiGetProducts, ApiProduct } from '../../services/api';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = useCartStore(s => s.totalItems);
  const cartCount = totalItems();
  const wishlistCount = useWishlistStore(s => s.items.length);

  const { user, logout } = useAuthStore();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadNotifs(0); setUnreadMsgs(0); return; }
    apiUnreadCount().then(r => setUnreadNotifs(r.count)).catch(() => {});
    apiUnreadMessages().then(r => setUnreadMsgs(r.count)).catch(() => {});
  }, [user, location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const [searchInput, setSearchInput]     = useState('');
  const [searchResults, setSearchResults] = useState<ApiProduct[]>([]);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef       = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inDesktop = searchContainerRef.current?.contains(e.target as Node);
      const inMobile  = mobileSearchContainerRef.current?.contains(e.target as Node);
      if (!inDesktop && !inMobile) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setShowDropdown(false); setSearchResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setSearchLoading(true);
      apiGetProducts({ search: value.trim() })
        .then(r => { setSearchResults(r.slice(0, 6)); setShowDropdown(true); })
        .catch(() => {})
        .finally(() => setSearchLoading(false));
    }, 300);
  };

  const closeDropdown = () => { setShowDropdown(false); setSearchInput(''); setSearchResults([]); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchInput.trim())}`);
      closeDropdown();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-600">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                AfroMarket
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm">Accueil</Button>
              </Link>
              <Link to="/marketplace">
                <Button variant={isActive('/marketplace') ? 'default' : 'ghost'} size="sm">Marketplace</Button>
              </Link>
              <Link to="/vendors">
                <Button variant={isActive('/vendors') ? 'default' : 'ghost'} size="sm">Boutiques</Button>
              </Link>
              <Link to="/categories">
                <Button variant={isActive('/categories') ? 'default' : 'ghost'} size="sm">Catégories</Button>
              </Link>
            </nav>
          </div>

          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Rechercher des produits, boutiques..."
                  className="w-full pl-10 pr-8"
                  value={searchInput}
                  onChange={e => handleSearchChange(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && closeDropdown()}
                  autoComplete="off"
                />
                {searchInput && (
                  <button type="button" onClick={closeDropdown}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
                {searchLoading ? (
                  <div className="p-4 text-center text-sm text-gray-400">Recherche en cours...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400">Aucun résultat pour « {searchInput} »</div>
                ) : (
                  <>
                    {searchResults.map(product => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b last:border-b-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category} · {product.vendorName}</p>
                        </div>
                        <span className="text-sm font-semibold text-orange-600 flex-shrink-0">
                          {formatPrice(product.price)}
                        </span>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearch as unknown as React.MouseEventHandler}
                      className="w-full px-4 py-3 text-sm text-orange-600 font-semibold hover:bg-orange-50 transition-colors text-center bg-gray-50"
                    >
                      Voir tous les résultats pour « {searchInput} »
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!user && (
              <>
                <Link to="/register">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex">
                    S'inscrire
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Acheter
                  </Button>
                </Link>
                <Link to="/become-vendor">
                  <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Vendre
                  </Button>
                </Link>
              </>
            )}

            {user && (
              <Link to="/messages" className="relative">
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-5 w-5" />
                  {unreadMsgs > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-500">
                      {unreadMsgs > 9 ? '9+' : unreadMsgs}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                {unreadNotifs > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border-2 border-orange-200 p-0.5 hover:border-orange-400 transition-colors">
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />Mes Commandes
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'customer' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/become-vendor" className="cursor-pointer text-orange-600 font-semibold">
                          <Store className="mr-2 h-4 w-4" />Devenir Vendeur
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {(user.role === 'vendor' || user.role === 'admin') && (
                    <>
                      <DropdownMenuSeparator />
                      {user.role === 'vendor' && (
                        <DropdownMenuItem asChild>
                          <Link to="/vendor/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard Vendeur
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard Admin
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <div ref={mobileSearchContainerRef} className="relative mb-4">
              <form onSubmit={e => { handleSearch(e); setMobileMenuOpen(false); }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-8"
                    value={searchInput}
                    onChange={e => handleSearchChange(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && closeDropdown()}
                    autoComplete="off"
                  />
                  {searchInput && (
                    <button type="button" onClick={closeDropdown}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
                  {searchLoading ? (
                    <div className="p-4 text-center text-sm text-gray-400">Recherche...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">Aucun résultat</div>
                  ) : (
                    <>
                      {searchResults.map(product => (
                        <Link key={product.id} to={`/product/${product.id}`}
                          onClick={() => { closeDropdown(); setMobileMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 border-b last:border-b-0"
                        >
                          <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.category}</p>
                          </div>
                          <span className="text-sm font-semibold text-orange-600 flex-shrink-0">{formatPrice(product.price)}</span>
                        </Link>
                      ))}
                      <button onClick={() => { handleSearch({ preventDefault: () => {} } as React.FormEvent); setMobileMenuOpen(false); }}
                        className="w-full px-4 py-3 text-sm text-orange-600 font-semibold bg-gray-50 text-center">
                        Voir tous les résultats pour « {searchInput} »
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/') ? 'default' : 'ghost'} className="w-full justify-start">Accueil</Button>
            </Link>
            <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/marketplace') ? 'default' : 'ghost'} className="w-full justify-start">Marketplace</Button>
            </Link>
            <Link to="/vendors" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/vendors') ? 'default' : 'ghost'} className="w-full justify-start">Boutiques</Button>
            </Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/categories') ? 'default' : 'ghost'} className="w-full justify-start">Catégories</Button>
            </Link>
            {!user && (
              <Link to="/become-vendor" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  <Store className="mr-2 h-4 w-4" />Devenir Vendeur
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
