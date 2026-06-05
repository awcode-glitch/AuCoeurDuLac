import { useEffect, useState } from 'react';
import { Users, ShoppingBag, DollarSign, Package, RefreshCw, ChevronDown, Plus, Pencil, Trash2, ShieldCheck, ShieldOff, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  apiAdminStats, apiAdminOrders, apiAdminUsers, apiAdminUpdateOrderStatus,
  apiAdminAddProduct, apiAdminUpdateProduct, apiAdminDeleteProduct, apiAdminVerifyVendor,
  apiAdminAddCategory, apiAdminDeleteCategory,
  apiGetVendors, apiGetProducts, apiGetCategories,
  AdminStats, AdminOrder, ApiUser, ApiVendor, ApiProduct,
} from '../services/api';
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

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  image: '', category: '', stock: '0', tags: '',
  vendorId: '', featured: false,
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🛍️');
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => { document.title = 'Administration | AfroMarket'; }, []);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      apiAdminStats().then(setStats).catch(() => {}),
      apiAdminOrders().then(setOrders).catch(() => {}),
      apiAdminUsers().then(setUsers).catch(() => {}),
      apiGetVendors().then(setVendors).catch(() => {}),
      apiGetProducts().then(setProducts).catch(() => {}),
      apiGetCategories().then(setCategories).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: ApiProduct) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      image: p.image ?? '',
      category: p.category ?? '',
      stock: String(p.stock),
      tags: (p.tags ?? []).join(', '),
      vendorId: p.vendorId ?? '',
      featured: p.featured ?? false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error('Prix invalide'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        image: form.image.trim(),
        category: form.category.trim(),
        stock: Number(form.stock) || 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        vendorId: form.vendorId || undefined,
        featured: form.featured,
      };
      if (editingProduct) {
        const updated = await apiAdminUpdateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success('Produit mis à jour');
      } else {
        const created = await apiAdminAddProduct(payload);
        setProducts(prev => [created, ...prev]);
        if (stats) setStats({ ...stats, totalProducts: stats.totalProducts + 1 });
        toast.success('Produit ajouté');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await apiAdminDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (stats) setStats({ ...stats, totalProducts: Math.max(0, stats.totalProducts - 1) });
      toast.success('Produit supprimé');
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur lors de la suppression');
    }
  };

  const handleVerify = async (vendorId: string) => {
    try {
      const updated = await apiAdminVerifyVendor(vendorId);
      setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
      toast.success(updated.verified ? 'Vendeur vérifié' : 'Vérification retirée');
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur');
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await apiAdminUpdateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Commande ${orderId} → ${STATUS_LABELS[status]}`);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const f = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) { toast.error('Le nom est requis'); return; }
    setSavingCat(true);
    try {
      const created = await apiAdminAddCategory(catName.trim(), catIcon.trim() || '🛍️');
      setCategories(prev => [...prev, created]);
      setCatName('');
      setCatIcon('🛍️');
      toast.success(`Catégorie "${created.name}" ajoutée`);
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;
    try {
      await apiAdminDeleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Catégorie supprimée');
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard Administrateur</h1>
            <p className="opacity-90">Vue d'ensemble en temps réel</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAll} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Revenus totaux', value: stats ? formatPrice(stats.totalRevenue) : '—', icon: DollarSign, color: 'bg-green-100 text-green-600' },
            { label: 'Commandes', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
            { label: 'Produits', value: stats?.totalProducts ?? '—', icon: Package, color: 'bg-purple-100 text-purple-600' },
            { label: 'Vendeurs', value: stats?.totalVendors ?? '—', icon: Users, color: 'bg-blue-100 text-blue-600' },
            { label: 'Clients', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-pink-100 text-pink-600' },
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

        <Tabs defaultValue="orders">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="orders">
              Commandes {orders.length > 0 && <Badge className="ml-2 bg-orange-500">{orders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="vendors">Vendeurs</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="categories" className="gap-1">
              <Tag className="h-3.5 w-3.5" />Catégories
            </TabsTrigger>
          </TabsList>

          {/* ── Commandes ── */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les commandes ({orders.length})</CardTitle>
              </CardHeader>
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
                        <TableHead className="text-right">Action</TableHead>
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
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                  Changer <ChevronDown className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <DropdownMenuItem
                                    key={value}
                                    onClick={() => handleStatusChange(order.id, value)}
                                    className={order.status === value ? 'font-semibold' : ''}
                                  >
                                    {label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Vendeurs ── */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader><CardTitle>Vendeurs ({vendors.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Produits</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map(vendor => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={vendor.avatar} alt={vendor.name} className="h-10 w-10 rounded-full object-cover" />
                            <div>
                              <div className="font-semibold">{vendor.name}</div>
                              <div className="text-xs text-gray-500">{vendor.description.slice(0, 45)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{vendor.location}</TableCell>
                        <TableCell>{vendor.products}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{vendor.rating}</span>
                          <span className="text-gray-400 text-sm"> ({vendor.reviews})</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={vendor.verified ? 'bg-green-500' : 'bg-yellow-500'}>
                            {vendor.verified ? 'Vérifié' : 'En attente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerify(vendor.id)}
                            className={`gap-1 ${vendor.verified ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                          >
                            {vendor.verified
                              ? <><ShieldOff className="h-3 w-3" /> Retirer</>
                              : <><ShieldCheck className="h-3 w-3" /> Vérifier</>
                            }
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Produits ── */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produits ({products.length})</CardTitle>
                <Button size="sm" onClick={openAdd} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4" /> Ajouter un produit
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Stock</TableHead>
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
                              <div className="text-xs text-gray-400">{product.rating} ⭐ ({product.reviews} avis)</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{product.vendorName}</TableCell>
                        <TableCell className="text-sm">{product.category}</TableCell>
                        <TableCell className="font-semibold text-sm">{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(product)} className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Catégories ── */}
          <TabsContent value="categories">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-4 w-4" />Ajouter une catégorie</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-1">
                      <Label>Nom *</Label>
                      <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="ex: Artisanat" />
                    </div>
                    <div className="space-y-1">
                      <Label>Icône (emoji)</Label>
                      <Input value={catIcon} onChange={e => setCatIcon(e.target.value)} placeholder="🛍️" className="text-xl" maxLength={4} />
                    </div>
                    <Button type="submit" disabled={savingCat} className="w-full bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {savingCat ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Catégories existantes ({categories.length})</CardTitle></CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">Aucune catégorie</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{(cat as any).icon ?? '🛍️'}</span>
                            <span className="font-medium">{cat.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Utilisateurs ── */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Utilisateurs ({users.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Rôle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                        <TableCell className="text-sm text-gray-600">{user.phone ?? '—'}</TableCell>
                        <TableCell>
                          <Badge className={
                            user.role === 'admin' ? 'bg-purple-500' :
                            user.role === 'vendor' ? 'bg-orange-500' : 'bg-blue-500'
                          }>
                            {user.role === 'admin' ? 'Admin' : user.role === 'vendor' ? 'Vendeur' : 'Client'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Dialog Ajouter / Modifier Produit ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Nom du produit *</Label>
              <Input value={form.name} onChange={f('name')} placeholder="ex: Robe Wax Premium" />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={f('description')}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Description du produit..."
              />
            </div>

            <div className="space-y-1">
              <Label>Prix (XOF) *</Label>
              <Input type="number" min="0" value={form.price} onChange={f('price')} placeholder="15000" />
            </div>

            <div className="space-y-1">
              <Label>Prix barré (XOF)</Label>
              <Input type="number" min="0" value={form.originalPrice} onChange={f('originalPrice')} placeholder="20000" />
            </div>

            <div className="space-y-1">
              <Label>Catégorie</Label>
              <select
                value={form.category}
                onChange={f('category')}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sélectionner...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Stock</Label>
              <Input type="number" min="0" value={form.stock} onChange={f('stock')} />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>URL de l'image</Label>
              <Input value={form.image} onChange={f('image')} placeholder="https://..." />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Tags (séparés par des virgules)</Label>
              <Input value={form.tags} onChange={f('tags')} placeholder="ex: africain, mode, coton" />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Vendeur (ID)</Label>
              <select
                value={form.vendorId}
                onChange={f('vendorId')}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Aucun vendeur</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="featured" className="cursor-pointer">Produit mis en avant (featured)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? 'Sauvegarde...' : editingProduct ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
