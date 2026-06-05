import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Star, RefreshCw, Eye, Plus, Pencil, Trash2, Settings, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  apiVendorStats, apiVendorOrders, apiVendorProducts,
  apiVendorDeleteProduct, apiGetVendor, apiVendorUpdateSettings,
  VendorStats, AdminOrder, ApiProduct, ApiVendor, VendorSettingsPayload,
} from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';


const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500', confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500', delivered: 'bg-green-500', cancelled: 'bg-red-500',
};


export function VendorDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats,    setStats]    = useState<VendorStats | null>(null);
  const [orders,   setOrders]   = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading,  setLoading]  = useState(true);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Settings state
  const [vendor,       setVendor]       = useState<ApiVendor | null>(null);
  const [shopName,     setShopName]     = useState('');
  const [shopDesc,     setShopDesc]     = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [shopPhone,    setShopPhone]    = useState('');
  const [shopAvatar,   setShopAvatar]   = useState('');
  const [shopBanner,   setShopBanner]   = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!user?.vendorId) return;
    apiGetVendor(user.vendorId).then(v => {
      setVendor(v);
      setShopName(v.name ?? '');
      setShopDesc(v.description ?? '');
      setShopLocation(v.location ?? '');
      setShopPhone(v.phone ?? '');
      setShopAvatar(v.avatar ?? '');
      setShopBanner(v.banner ?? '');
    }).catch(() => {});
  }, [user?.vendorId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) { toast.error('Le nom de la boutique est requis'); return; }
    setSavingSettings(true);
    try {
      const payload: VendorSettingsPayload = {
        name:        shopName.trim() || undefined,
        description: shopDesc.trim() || undefined,
        location:    shopLocation.trim() || undefined,
        phone:       shopPhone.trim() || undefined,
        avatar:      shopAvatar.trim() || undefined,
        banner:      shopBanner.trim() || undefined,
      };
      const updated = await apiVendorUpdateSettings(payload);
      setVendor(updated);
      toast.success('Paramètres mis à jour');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur');
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      apiVendorStats().then(setStats).catch(() => {}),
      apiVendorOrders().then(setOrders).catch(() => {}),
      apiVendorProducts().then(setProducts).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Dashboard Vendeur | AfroMarket'; }, []);
  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => navigate('/vendor/products/new');
  const openEdit = (p: ApiProduct) => navigate(`/vendor/products/${p.id}/edit`);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce produit définitivement ?')) return;
    setDeletingId(id);
    try {
      await apiVendorDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setStats(s => s ? { ...s, totalProducts: Math.max(0, s.totalProducts - 1) } : s);
      toast.success('Produit supprimé');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur');
    } finally {
      setDeletingId(null);
    }
  };

  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard Vendeur</h1>
            <p className="opacity-90">Gérez votre boutique et suivez vos performances</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {user?.vendorId && (
              <Link to={`/vendor/${user.vendorId}`}>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />Ma boutique
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              className="gap-2 bg-white text-orange-600 hover:bg-orange-50 font-semibold"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4" />Ajouter un produit
            </Button>
            <Button variant="secondary" size="sm" onClick={fetchAll} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Revenus totaux',  value: stats ? formatPrice(stats.totalRevenue) : '—', icon: TrendingUp,  color: 'bg-green-100 text-green-600' },
            { label: 'Commandes',       value: stats?.totalOrders   ?? '—',                    icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
            { label: 'Produits actifs', value: stats?.totalProducts ?? '—',                    icon: Package,     color: 'bg-purple-100 text-purple-600' },
            { label: 'Note moyenne',    value: stats ? `${stats.averageRating} ⭐` : '—',       icon: Star,        color: 'bg-orange-100 text-orange-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="products">
              Produits {products.length > 0 && <Badge className="ml-2 bg-purple-500">{products.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="orders">
              Commandes {orders.length > 0 && <Badge className="ml-2 bg-orange-500">{orders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />Paramètres
            </TabsTrigger>
          </TabsList>

          {/* ── Vue d'ensemble ── */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Commandes récentes</CardTitle></CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">Aucune commande pour le moment</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-mono font-semibold text-sm">{order.id}</p>
                            <p className="text-xs text-gray-500">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={STATUS_COLORS[order.status] ?? 'bg-gray-500'}>
                              {STATUS_LABELS[order.status] ?? order.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Produits les plus vendus</CardTitle></CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">Aucun produit</p>
                  ) : (
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-orange-600 flex-shrink-0">
                            {index + 1}
                          </div>
                          <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.reviews} avis · {product.rating} ⭐</div>
                          </div>
                          <div className="font-semibold text-sm flex-shrink-0">{formatPrice(product.price)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Produits ── */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mes produits ({products.length})</CardTitle>
                <Button onClick={openAdd} className="gap-2">
                  <Plus className="h-4 w-4" />Ajouter un produit
                </Button>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">Vous n'avez pas encore de produits</p>
                    <Button onClick={openAdd} className="gap-2">
                      <Plus className="h-4 w-4" />Ajouter mon premier produit
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                              <div>
                                <div className="font-semibold text-sm">{product.name}</div>
                                <div className="text-xs text-gray-400">{product.reviews} avis</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{product.category}</TableCell>
                          <TableCell className="font-semibold text-sm">{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{product.rating}</span>
                            <span className="text-gray-400 text-sm"> ⭐</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                disabled={deletingId === product.id}
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Paramètres ── */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Paramètres de la boutique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
                  <div>
                    <Label htmlFor="shopName">Nom de la boutique *</Label>
                    <Input
                      id="shopName"
                      value={shopName}
                      onChange={e => setShopName(e.target.value)}
                      className="mt-1"
                      placeholder="Ma boutique AfroMarket"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shopDesc">Description</Label>
                    <Textarea
                      id="shopDesc"
                      rows={3}
                      value={shopDesc}
                      onChange={e => setShopDesc(e.target.value)}
                      className="mt-1"
                      placeholder="Décrivez votre boutique en quelques mots..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shopLocation">Localisation</Label>
                      <Input
                        id="shopLocation"
                        value={shopLocation}
                        onChange={e => setShopLocation(e.target.value)}
                        className="mt-1"
                        placeholder="Dakar, Sénégal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shopPhone">Numéro WhatsApp</Label>
                      <Input
                        id="shopPhone"
                        value={shopPhone}
                        onChange={e => setShopPhone(e.target.value)}
                        className="mt-1"
                        placeholder="+221771234567"
                      />
                      <p className="text-xs text-gray-400 mt-1">Format international, ex : +221771234567</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shopAvatar">URL photo de profil boutique</Label>
                    <Input
                      id="shopAvatar"
                      value={shopAvatar}
                      onChange={e => setShopAvatar(e.target.value)}
                      className="mt-1"
                      placeholder="https://exemple.com/logo.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shopBanner">URL bannière</Label>
                    <Input
                      id="shopBanner"
                      value={shopBanner}
                      onChange={e => setShopBanner(e.target.value)}
                      className="mt-1"
                      placeholder="https://exemple.com/banniere.jpg"
                    />
                  </div>

                  {(shopAvatar || shopBanner) && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      {shopBanner && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Aperçu bannière</p>
                          <img
                            src={shopBanner}
                            alt="bannière"
                            className="w-full h-28 object-cover rounded-lg border"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                      {shopAvatar && (
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-500 font-medium">Aperçu avatar</p>
                          <img
                            src={shopAvatar}
                            alt="avatar"
                            className="h-14 w-14 rounded-full object-cover border-2 border-orange-200"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" disabled={savingSettings} className="gap-2">
                    <Save className="h-4 w-4" />
                    {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Commandes ── */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle>Toutes les commandes ({orders.length})</CardTitle></CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center py-10 text-gray-400">Aucune commande pour le moment</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Articles</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm font-semibold">{order.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{order.customer}</div>
                            <div className="text-xs text-gray-400">{order.customerEmail}</div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item, i) => (
                                <div key={i} className="text-xs text-gray-600">
                                  {item.productName} × {item.quantity}
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-xs text-gray-400">+{order.items.length - 2} autres</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[order.status] ?? 'bg-gray-500'}>
                              {STATUS_LABELS[order.status] ?? order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
