import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Building2, Check, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { apiCreateOrder } from '../services/api';

const SHIPPING = 5000;
const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(p);

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, clearCart, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const total    = subtotal + SHIPPING;

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [submitting, setSubmitting] = useState(false);

  const nameParts = (user?.name ?? '').split(' ');
  const [address, setAddress] = useState({
    firstName: nameParts[0] ?? '',
    lastName:  nameParts.slice(1).join(' ') ?? '',
    email:     user?.email ?? '',
    phone:     user?.phone ?? '',
    address:   user?.address ?? '',
    city:      '',
    country:   'Sénégal',
  });

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items.length, navigate]);

  const validateAddress = () => {
    if (!address.firstName.trim()) { toast.error('Le prénom est requis'); return false; }
    if (!address.email.trim())     { toast.error("L'email est requis"); return false; }
    if (!address.phone.trim())     { toast.error('Le téléphone est requis'); return false; }
    if (!address.address.trim())   { toast.error("L'adresse est requise"); return false; }
    if (!address.city.trim())      { toast.error('La ville est requise'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) { setStep(1); return; }
    setSubmitting(true);
    try {
      const order = await apiCreateOrder({
        items: items.map(i => ({
          productId:   i.product.id,
          productName: i.product.name,
          quantity:    i.quantity,
          price:       i.product.price,
          image:       i.product.image,
        })),
        address,
        paymentMethod,
      });
      clearCart();
      navigate('/order-confirmation', { state: { orderId: order.id, total: order.total } });
    } catch {
      toast.error('Erreur lors de la commande, veuillez réessayer');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(a => ({ ...a, [key]: e.target.value }));

  const STEP_LABELS = ['Livraison', 'Paiement', 'Confirmation'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEP_LABELS.map((label, idx) => {
            const s = idx + 1;
            const done   = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full font-semibold text-sm transition-colors ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? <Check className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-xs mt-1 ${active ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className={`h-1 w-16 sm:w-24 mb-4 mx-2 rounded ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Step 1 : Livraison ── */}
            <Card className={step !== 1 ? 'opacity-60' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 1 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  Informations de livraison
                  {step > 1 && <span className="ml-auto text-sm text-green-600 font-normal">✓ Complété</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Prénom *</Label><Input className="mt-1" value={address.firstName} onChange={set('firstName')} placeholder="Votre prénom" /></div>
                  <div><Label>Nom</Label><Input className="mt-1" value={address.lastName} onChange={set('lastName')} placeholder="Votre nom" /></div>
                </div>
                <div><Label>Email *</Label><Input className="mt-1" type="email" value={address.email} onChange={set('email')} placeholder="email@exemple.com" /></div>
                <div><Label>Téléphone *</Label><Input className="mt-1" type="tel" value={address.phone} onChange={set('phone')} placeholder="+221 77 123 4567" /></div>
                <div><Label>Adresse complète *</Label><Input className="mt-1" value={address.address} onChange={set('address')} placeholder="Rue, quartier" /></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Ville *</Label><Input className="mt-1" value={address.city} onChange={set('city')} placeholder="Dakar" /></div>
                  <div><Label>Pays</Label><Input className="mt-1" value={address.country} onChange={set('country')} placeholder="Sénégal" /></div>
                </div>
                {step === 1 && (
                  <Button className="w-full gap-2" onClick={() => { if (validateAddress()) setStep(2); }}>
                    Continuer vers le paiement <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ── Step 2 : Paiement ── */}
            <Card className={step < 2 ? 'opacity-60 pointer-events-none' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  Mode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {[
                    { value: 'mobile', icon: Wallet, title: 'Mobile Money', sub: 'Orange Money, Wave, Free Money' },
                    { value: 'card',   icon: CreditCard, title: 'Carte bancaire', sub: 'Visa, Mastercard' },
                    { value: 'transfer', icon: Building2, title: 'Virement bancaire', sub: 'Transfert direct' },
                  ].map(({ value, icon: Icon, title, sub }) => (
                    <label key={value} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === value ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                      <RadioGroupItem value={value} />
                      <Icon className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">{title}</div>
                        <div className="text-xs text-gray-500">{sub}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                {paymentMethod === 'mobile' && (
                  <div><Label>Numéro Mobile Money</Label>
                    <Input className="mt-1" placeholder="+221 77 123 4567" defaultValue={address.phone} />
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div><Label>Numéro de carte</Label><Input className="mt-1" placeholder="1234 5678 9012 3456" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Expiration</Label><Input className="mt-1" placeholder="MM/AA" /></div>
                      <div><Label>CVV</Label><Input className="mt-1" placeholder="123" /></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Résumé ── */}
          <div>
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Résumé ({items.length} article{items.length > 1 ? 's' : ''})</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.image} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qté : {item.quantity}</p>
                        <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span><span>{formatPrice(SHIPPING)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span><span className="text-orange-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full" size="lg"
                  onClick={step < 2 ? () => { if (validateAddress()) setStep(2); } : handlePlaceOrder}
                  disabled={submitting || items.length === 0}
                >
                  {submitting ? 'Traitement...' : step < 2 ? 'Continuer' : 'Confirmer la commande'}
                </Button>

                <Link to="/cart">
                  <Button variant="outline" className="w-full">Retour au panier</Button>
                </Link>

                <p className="text-xs text-gray-400 text-center">
                  En confirmant, vous acceptez nos conditions générales de vente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
