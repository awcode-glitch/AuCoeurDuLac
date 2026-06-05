import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { apiVendorApply } from '../services/api';

const CATEGORIES = [
  'Mode & Vêtements', 'Électronique', 'Beauté & Santé',
  'Maison & Jardin', 'Artisanat', 'Alimentation', 'Bijoux', 'Sport & Loisirs',
];

export function BecomeVendorPage() {
  const navigate  = useNavigate();
  const { user, setUser, token } = useAuthStore();

  const [step, setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [shopName,     setShopName]     = useState('');
  const [description,  setDescription]  = useState('');
  const [category,     setCategory]     = useState(CATEGORIES[0]);
  const [location,     setLocation]     = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Store className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
            <p className="text-gray-600 mb-6">Connectez-vous pour créer votre boutique</p>
            <Link to="/login">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role === 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Vous êtes déjà vendeur</h2>
            <p className="text-gray-600 mb-6">Accédez à votre dashboard pour gérer votre boutique</p>
            <Button onClick={() => navigate('/vendor/dashboard')} className="w-full">
              Mon dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!shopName.trim()) { toast.error('Le nom de la boutique est requis'); return; }
    if (!location.trim()) { toast.error('La localisation est requise'); return; }

    setSubmitting(true);
    try {
      const { token: newToken, user: updatedUser } = await apiVendorApply({
        shopName, description, category, location,
      });
      setUser({ ...updatedUser, role: 'vendor' } as typeof user);
      useAuthStore.setState({ token: newToken });
      toast.success('Félicitations ! Votre boutique a été créée');
      navigate('/vendor/dashboard');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Devenez vendeur sur AfroMarket
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Rejoignez des centaines de vendeurs qui développent leur business avec nous
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            {[1, 2].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center h-12 w-12 rounded-full font-semibold transition-colors ${step > s ? 'bg-orange-600 text-white' : step === s ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <Check className="h-6 w-6" /> : s}
                </div>
                {i < 1 && <div className={`h-1 w-24 transition-colors ${step > s ? 'bg-orange-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* ── Étape 1 : Boutique ── */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de votre boutique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="shopName">Nom de la boutique *</Label>
                  <Input
                    id="shopName"
                    placeholder="Ex: Afro Fashion"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre boutique et vos produits..."
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie principale</Label>
                  <select
                    id="category"
                    className="mt-1 w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Dakar, Sénégal"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    if (!shopName.trim()) { toast.error('Le nom de la boutique est requis'); return; }
                    if (!location.trim()) { toast.error('La localisation est requise'); return; }
                    setStep(2);
                  }}
                >
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Étape 2 : Récapitulatif + confirmation ── */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Confirmer votre boutique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nom de la boutique</span>
                    <span className="font-semibold">{shopName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Catégorie</span>
                    <span className="font-semibold">{category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Localisation</span>
                    <span className="font-semibold">{location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Propriétaire</span>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                </div>

                {description && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Description</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{description}</p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    En soumettant, votre compte passera au rôle <strong>Vendeur</strong> et votre boutique sera créée immédiatement. Vous pourrez la personnaliser depuis votre dashboard.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Retour
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1 gap-2">
                    {submitting ? 'Création...' : 'Créer ma boutique'}
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Avantages */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Check,   color: 'bg-green-100 text-green-600',  title: '0% de commission',  sub: 'Les 3 premiers mois' },
            { icon: Store,   color: 'bg-blue-100 text-blue-600',    title: 'Visibilité maximale', sub: '12K+ utilisateurs actifs' },
            { icon: ArrowRight, color: 'bg-purple-100 text-purple-600', title: 'Paiements rapides', sub: 'Sous 48h' },
          ].map(({ icon: Icon, color, title, sub }) => (
            <Card key={title}>
              <CardContent className="p-6 text-center">
                <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
