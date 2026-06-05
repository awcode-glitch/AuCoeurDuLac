import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, BadgeCheck, MessageCircle, Calendar, Package, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductCard } from '../components/ProductCard';
import { apiGetVendor, apiStartConversation, apiGetVendorReviews, apiAddVendorReview, ApiVendor, ApiProduct, VendorReview } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

function ShareButton({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 ${color}`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

export function VendorShopPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [vendor, setVendor] = useState<(ApiVendor & { productList: ApiProduct[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reviews, setReviews]       = useState<VendorReview[]>([]);
  const [myRating, setMyRating]     = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetVendor(id)
      .then(v => { setVendor(v); document.title = `${v.name} | AfroMarket`; })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    apiGetVendorReviews(id).then(setReviews).catch(() => {});
  }, [id]);

  const alreadyReviewed = user ? reviews.some(r => r.userId === user.id) : false;

  const handleSubmitReview = async () => {
    if (!myRating) { toast.error('Choisissez une note'); return; }
    setSubmitting(true);
    try {
      const review = await apiAddVendorReview(id!, myRating, myComment);
      setReviews(prev => [review, ...prev]);
      setVendor(v => v ? {
        ...v,
        reviews: v.reviews + 1,
        rating: parseFloat(((v.rating * v.reviews + myRating) / (v.reviews + 1)).toFixed(1)),
      } : v);
      setMyRating(0); setMyComment('');
      toast.success('Avis publié !');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContact = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const conv = await apiStartConversation(vendor!.id);
      navigate(`/messages?conv=${conv.id}`);
    } catch { navigate('/messages'); }
  };

  const shareUrl = window.location.href;
  const shareText = vendor ? `Découvrez la boutique ${vendor.name} sur AfroMarket !` : '';

  const vendorPhone = vendor?.phone?.replace(/\D/g, '') ?? '';
  const handleShareWhatsApp = () => window.open(`https://wa.me/${vendorPhone}?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  const handleShareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const handleShareTikTok = () => {
    navigator.clipboard.writeText(shareUrl).then(() => toast.success('Lien copié ! Colle-le sur TikTok'));
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => toast.success('Lien copié !'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-64 bg-gray-200 animate-pulse" />
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 mb-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex gap-6">
                <div className="h-32 w-32 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Boutique non trouvée</h1>
        <Link to="/vendors"><Button>Retour aux boutiques</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière */}
      <div className="relative h-64 overflow-hidden">
        <img src={vendor.banner} alt={vendor.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Carte principale */}
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={vendor.avatar} alt={vendor.name}
                  className="h-28 w-28 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
                {vendor.verified && (
                  <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center">
                    <BadgeCheck className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{vendor.name}</h1>
                      {vendor.verified && (
                        <Badge className="bg-blue-500 text-xs">
                          <BadgeCheck className="h-3 w-3 mr-1" />Vérifié
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" />
                        {vendor.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{vendor.rating}</span>
                        <span>({vendor.reviews} avis)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-orange-500" />
                        Membre depuis {new Date(vendor.joinDate).getFullYear()}
                      </span>
                    </div>
                  </div>

                  {/* Boutons action */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button className="gap-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700" onClick={handleContact}>
                      <MessageCircle className="h-4 w-4" />Contacter
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{vendor.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {vendor.categories.map((cat, i) => (
                    <Badge key={i} variant="secondary">{cat}</Badge>
                  ))}
                </div>

                {/* Boutons partage social */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 self-center font-medium">Partager :</span>
                  <ShareButton icon="💬" label="WhatsApp" color="bg-green-500" onClick={handleShareWhatsApp} />
                  <ShareButton icon="📘" label="Facebook" color="bg-blue-600" onClick={handleShareFacebook} />
                  <ShareButton icon="🎵" label="TikTok" color="bg-gray-900" onClick={handleShareTikTok} />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    🔗 Copier le lien
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <Package className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-600">{vendor.products}</div>
                <div className="text-xs text-gray-600">Produits</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-yellow-600">{vendor.rating}</div>
                <div className="text-xs text-gray-600">Note moyenne</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-600">{vendor.reviews}</div>
                <div className="text-xs text-gray-600">Avis clients</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <BadgeCheck className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-600">
                  {vendor.verified ? '✓' : '—'}
                </div>
                <div className="text-xs text-gray-600">Vendeur vérifié</div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="products" className="mb-12">
          <TabsList>
            <TabsTrigger value="products">Produits ({vendor.productList.length})</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({vendor.reviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {vendor.productList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <p className="text-gray-600">Aucun produit disponible pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {vendor.productList.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="bg-white rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">À propos de {vendor.name}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{vendor.description}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Localisation</span>
                  <span className="font-medium text-sm">{vendor.location}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Membre depuis</span>
                  <span className="font-medium text-sm">{new Date(vendor.joinDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Produits actifs</span>
                  <span className="font-medium text-sm">{vendor.productList.length}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Statut</span>
                  <span className={`font-medium text-sm ${vendor.verified ? 'text-blue-600' : 'text-gray-500'}`}>
                    {vendor.verified ? 'Vendeur vérifié ✓' : 'En cours de vérification'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 space-y-6">
            {/* Formulaire */}
            {user && !alreadyReviewed && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Laisser un avis</h3>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setMyRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 ${star <= (hoverRating || myRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  {myRating > 0 && (
                    <span className="ml-2 self-center text-sm text-gray-500">{myRating}/5</span>
                  )}
                </div>
                <textarea
                  value={myComment}
                  onChange={e => setMyComment(e.target.value)}
                  placeholder="Partagez votre expérience avec cette boutique..."
                  rows={3}
                  className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !myRating}
                  className="mt-3 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {submitting ? 'Publication...' : 'Publier mon avis'}
                </button>
              </div>
            )}
            {user && alreadyReviewed && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium">
                ✓ Vous avez déjà laissé un avis sur cette boutique
              </div>
            )}
            {!user && (
              <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-600 text-center">
                <span className="font-semibold cursor-pointer text-orange-600" onClick={() => navigate('/login')}>Connectez-vous</span> pour laisser un avis
              </div>
            )}

            {/* Liste des avis */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun avis pour le moment — soyez le premier !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      {review.userAvatar ? (
                        <img src={review.userAvatar} alt={review.userName} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{review.userName[0]}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{review.userName}</span>
                          <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
