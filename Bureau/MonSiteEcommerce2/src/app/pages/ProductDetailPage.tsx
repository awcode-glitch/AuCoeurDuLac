import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Star, ShoppingCart, Heart, Share2, Eye, MapPin, Calendar, MessageCircle, BadgeCheck, Phone } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductCard } from '../components/ProductCard';
import { apiGetProduct, apiGetVendor, apiGetReviews, apiAddReview, apiStartConversation, ApiProduct, ApiVendor, Review } from '../services/api';
import { useAuthStore } from '../store/authStore';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [vendor, setVendor] = useState<ApiVendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const addItem = useCartStore(s => s.addItem);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetProduct(id)
      .then(data => {
        setProduct(data);
        document.title = `${data.name} | AfroMarket`;
        setRelatedProducts(data.related ?? []);
        if (data.vendorId) {
          apiGetVendor(data.vendorId).then(setVendor).catch(() => {});
        }
        apiGetReviews(id).then(setReviews).catch(() => {});
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const alreadyReviewed = user ? reviews.some(r => r.userId === user.id) : false;

  const handleSubmitReview = async () => {
    if (!myRating) { toast.error('Choisissez une note'); return; }
    setSubmitting(true);
    try {
      const review = await apiAddReview(id!, myRating, myComment);
      setReviews(prev => [review, ...prev]);
      setProduct(p => p ? { ...p, reviews: p.reviews + 1, rating: parseFloat(((p.rating * p.reviews + myRating) / (p.reviews + 1)).toFixed(1)) } : p);
      setMyRating(0); setMyComment('');
      toast.success('Avis publié !');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product as any, 1);
    toast.success(`${product.name} ajouté au panier`, {
      action: { label: 'Voir le panier', onClick: () => navigate('/cart') },
    });
  };

  const handleContact = async () => {
    if (!user) { navigate('/login'); return; }
    if (!vendor) return;
    try {
      const conv = await apiStartConversation(vendor.id, product?.id);
      navigate(`/messages?conv=${conv.id}`);
    } catch { navigate('/messages'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Link to="/marketplace"><Button>Retour à la marketplace</Button></Link>
      </div>
    );
  }

  const thumbnails = (product.images?.length ? product.images : [product.image]).filter(Boolean);
  const inStock = product.stock > 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* ── Galerie ── */}
            <div className="p-6 border-r border-gray-100">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] mb-4">
                <img
                  src={thumbnails[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {/* Badge disponibilité */}
                <span className={`absolute top-4 left-4 text-white text-xs font-semibold px-3 py-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}>
                  {inStock ? 'Disponible' : 'Rupture de stock'}
                </span>
                {/* Badge remise */}
                {discount > 0 && (
                  <span className="absolute top-4 right-14 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    -{discount}%
                  </span>
                )}
                {/* Badge populaire */}
                {product.featured && (
                  <Badge className="absolute bottom-4 left-4 bg-orange-500">Populaire</Badge>
                )}
                {/* Favori */}
                <button
                  onClick={() => setIsFavorite(v => !v)}
                  className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Miniatures — affichées seulement si plusieurs images */}
              {thumbnails.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {thumbnails.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Infos produit ── */}
            <div className="p-6 flex flex-col gap-4">

              {/* Titre */}
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-600">
                  <Eye className="h-3.5 w-3.5 text-orange-500" />
                  {product.reviews * 3 + 5} vues
                </span>
                {vendor?.location && (
                  <span className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    {vendor.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-orange-500" />
                  {vendor?.joinDate ? timeAgo(vendor.joinDate) : 'Récemment'}
                </span>
              </div>

              {/* Prix + tags */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                    {inStock ? `En stock (${product.stock})` : 'Épuisé'}
                  </span>
                </div>
              </div>

              {/* Note */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{product.rating} · {product.reviews} avis</span>
              </div>

              {/* Boutons */}
              <div className="flex flex-col gap-2 mt-auto">
                <Button
                  className="w-full h-11 text-base font-semibold bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white gap-2 rounded-xl"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Acheter
                </Button>

                <Button
                  className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
                  onClick={handleContact}
                >
                  <MessageCircle className="h-5 w-5" />
                  Faire une offre
                </Button>

                <Button
                  className="w-full h-11 text-base font-semibold bg-green-600 hover:bg-green-700 text-white gap-2 rounded-xl"
                  onClick={() => {
                    const msg = encodeURIComponent(`Bonjour, je suis intéressé par : ${product.name} — ${formatPrice(product.price)}`);
                    const phone = vendor?.phone?.replace(/\D/g, '') ?? '';
                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                  }}
                >
                  <Phone className="h-5 w-5" />
                  Contacter sur WhatsApp
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 text-base font-semibold gap-2 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    navigator.share?.({ title: product.name, url: window.location.href })
                      ?? navigator.clipboard.writeText(window.location.href).then(() => toast.success('Lien copié !'));
                  }}
                >
                  <Share2 className="h-5 w-5" />
                  Partager
                </Button>
              </div>

              {/* Vendeur */}
              {vendor && (
                <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-4 bg-gray-50">
                  <img src={vendor.avatar} alt={vendor.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/vendor/${vendor.id}`}>
                        <span className="font-semibold text-sm hover:text-orange-600 transition-colors">{vendor.name}</span>
                      </Link>
                      {vendor.verified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{vendor.rating} · {vendor.products} produits</span>
                    </div>
                  </div>
                  <Link to={`/vendor/${vendor.id}`}>
                    <Button size="sm" variant="outline" className="text-xs rounded-lg">
                      Boutique
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Onglets ── */}
          <div className="border-t border-gray-100 p-6">
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="reviews">Avis ({reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="py-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </TabsContent>

              <TabsContent value="details" className="py-6">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 text-sm">Catégorie</span>
                    <span className="font-medium text-sm">{product.category}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 text-sm">Stock</span>
                    <span className="font-medium text-sm">{product.stock} unité{product.stock > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 text-sm">Note</span>
                    <span className="font-medium text-sm">{product.rating} / 5</span>
                  </div>
                  {product.originalPrice && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500 text-sm">Prix original</span>
                      <span className="font-medium text-sm line-through text-gray-400">{formatPrice(product.originalPrice)}</span>
                    </div>
                  )}
                  {product.tags.map((tag, i) => (
                    <div key={i} className="flex justify-between border-b pb-2">
                      <span className="text-gray-500 text-sm">Tag</span>
                      <Badge variant="secondary">{tag}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="py-6 space-y-8">
                {user && !alreadyReviewed && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Laisser un avis</h3>
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button"
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setMyRating(s)}>
                          <Star className={`h-8 w-8 transition-colors ${s <= (hoverRating || myRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                      {myRating > 0 && <span className="ml-2 text-sm text-gray-600 self-center">{['','Très mauvais','Mauvais','Moyen','Bien','Excellent'][myRating]}</span>}
                    </div>
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                      rows={3}
                      placeholder="Décrivez votre expérience avec ce produit..."
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                    />
                    <Button className="mt-3" onClick={handleSubmitReview} disabled={submitting || !myRating}>
                      {submitting ? 'Publication...' : 'Publier mon avis'}
                    </Button>
                  </div>
                )}
                {user && alreadyReviewed && (
                  <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    ✓ Vous avez déjà laissé un avis sur ce produit.
                  </p>
                )}
                {!user && (
                  <div className="bg-gray-50 border rounded-xl p-6 text-center">
                    <p className="text-gray-600 mb-3">Connectez-vous pour laisser un avis</p>
                    <Link to="/login"><Button variant="outline">Se connecter</Button></Link>
                  </div>
                )}
                {reviews.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Aucun avis pour le moment. Soyez le premier !</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="flex items-start gap-4">
                        <img
                          src={review.userAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=f97316&color=fff`}
                          alt={review.userName}
                          className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{review.userName}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment && <p className="text-gray-600 text-sm mb-1">{review.comment}</p>}
                          <span className="text-xs text-gray-400">
                            {new Date(review.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
