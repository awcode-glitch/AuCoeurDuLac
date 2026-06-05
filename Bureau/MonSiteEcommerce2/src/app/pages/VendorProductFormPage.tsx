import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, ImageIcon, Info, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  apiVendorAddProduct, apiVendorUpdateProduct, apiVendorProducts,
  apiUploadImage, ProductPayload, ApiProduct,
} from '../services/api';

const CATEGORIES = [
  'Mode & Vêtements', 'Électronique', 'Beauté & Santé',
  'Maison & Jardin', 'Artisanat', 'Alimentation', 'Bijoux', 'Sport & Loisirs',
];

const ETATS = ['Neuf', 'Très bon état', 'Bon état', 'État correct', 'Occasion'];

const LOCATIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack',
  'Rufisque', 'Mbour', 'Touba', 'Diourbel', 'Autre',
];

const EMPTY: ProductPayload & { etat: string; location: string; tagInput: string } = {
  name: '', description: '', price: 0, originalPrice: null,
  image: '', category: '', stock: 1, tags: [],
  etat: '', location: '', tagInput: '',
};

export function VendorProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit) return;
    apiVendorProducts().then(products => {
      const p = products.find(p => p.id === id);
      if (!p) return;
      setForm({
        name: p.name, description: p.description ?? '',
        price: p.price, originalPrice: p.originalPrice ?? null,
        image: p.image, category: p.category,
        stock: p.stock, tags: p.tags ?? [],
        etat: p.tags?.[0] ?? '', location: '',
        tagInput: '',
      });
      setImages(p.images?.length ? p.images : [p.image].filter(Boolean));
    }).catch(() => {});
  }, [id, isEdit]);

  const set = (key: string, value: unknown) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name = 'Le titre est requis';
    if (!form.description.trim()) e.description = 'La description est requise';
    if (!form.category)       e.category = 'La catégorie est requise';
    if (form.price <= 0)      e.price = 'Le prix est requis';
    if (!form.etat)           e.etat = "L'état de l'article est requis";
    if (!form.location)       e.location = 'La localisation est requise';
    if (images.length === 0)  e.image = 'Au moins une image est requise';
    return e;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 5 - images.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    setUploadProgress(0);
    try {
      const urls: string[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const url = await apiUploadImage(toUpload[i], pct =>
          setUploadProgress(Math.round(((i + pct / 100) / toUpload.length) * 100))
        );
        urls.push(url);
      }
      setUploadProgress(100);
      const next = [...images, ...urls];
      setImages(next);
      set('image', next[0]);
      setErrors(er => { const n = { ...er }; delete n.image; return n; });
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (i: number) => {
    const next = images.filter((_, idx) => idx !== i);
    setImages(next);
    set('image', next[0] ?? '');
  };

  const handleAddTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      set('tags', [...form.tags, tag]);
      set('tagInput', '');
    }
  };

  const handleSubmit = async (publish: boolean) => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error('Veuillez remplir tous les champs requis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    const mainImage = images[0] ?? '';
    const payload: ProductPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      originalPrice: form.originalPrice || null,
      image: mainImage,
      images: images.filter(Boolean),
      category: form.category,
      stock: publish ? form.stock : 0,
      tags: [form.etat, form.location, ...form.tags].filter(Boolean),
    };
    try {
      if (isEdit) {
        await apiVendorUpdateProduct(id!, payload);
        toast.success('Produit mis à jour');
      } else {
        await apiVendorAddProduct(payload);
        toast.success(publish ? 'Produit publié !' : 'Produit enregistré (en attente)');
      }
      navigate('/vendor/dashboard');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const frais = form.price <= 10000 ? 200 : form.price <= 25000 ? Math.round(form.price * 0.025) : Math.round(form.price * 0.04);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-5 flex items-center gap-4">
          <Link to="/vendor/dashboard">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Modifier l\'article' : 'Vendre un article'}</h1>
            <p className="text-orange-100 text-sm">Remplissez le formulaire pour publier votre article</p>
          </div>
        </div>
      </div>

      {/* Bandeau frais */}
      <div className="bg-orange-50 border-b border-orange-100">
        <div className="container mx-auto px-4 py-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800">
            <span className="font-semibold">Frais de publication :</span> Les frais sont calculés selon le prix de votre article :
            200 FCFA (0–10 000 FCFA), 2,5% (10 001–25 000 FCFA), ou 4% (au-delà).
            Si vous ne payez pas maintenant, l'article sera enregistré en attente de paiement.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">

        {/* ── Informations de l'article ── */}
        <Section title="Informations de l'article">
          <Field label="Titre *" error={errors.name}>
            <Input
              placeholder="Ex: T-shirt rouge Nike"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className={errors.name ? 'border-red-400' : ''}
            />
          </Field>
          <Field label="Description *" error={errors.description}>
            <Textarea
              placeholder="Décrivez votre article en détail..."
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={errors.description ? 'border-red-400' : ''}
            />
          </Field>
        </Section>

        {/* ── Catégorie ── */}
        <Section title="Catégories">
          <Field label="Catégorie *" error={errors.category}>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={`w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Sélectionner</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </Section>

        {/* ── Détails ── */}
        <Section title="Détails de l'article">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prix (FCFA) *" error={errors.price}>
              <Input
                type="number" min="0"
                placeholder="15000"
                value={form.price || ''}
                onChange={e => set('price', parseFloat(e.target.value) || 0)}
                className={errors.price ? 'border-red-400' : ''}
              />
            </Field>
            <Field label="Prix barré (optionnel)">
              <Input
                type="number" min="0"
                placeholder="20000"
                value={form.originalPrice || ''}
                onChange={e => set('originalPrice', parseFloat(e.target.value) || null)}
              />
            </Field>
            <Field label="État *" error={errors.etat}>
              <select
                value={form.etat}
                onChange={e => set('etat', e.target.value)}
                className={`w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${errors.etat ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Sélectionner</option>
                {ETATS.map(e => <option key={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Localisation *" error={errors.location}>
              <select
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className={`w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${errors.location ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Sélectionner</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Stock">
              <Input
                type="number" min="1"
                value={form.stock}
                onChange={e => set('stock', parseInt(e.target.value) || 1)}
              />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags (optionnel — max 5)">
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Taille M, Coton, Importé..."
                value={form.tagInput}
                onChange={e => set('tagInput', e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag} disabled={form.tags.length >= 5}>
                Ajouter
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => set('tags', form.tags.filter(t => t !== tag))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Field>
        </Section>

        {/* ── Images ── */}
        <Section title="Images" error={errors.image}>
          <p className="text-xs text-gray-500 mb-3">Ajoutez jusqu'à 5 photos — la première sera l'image principale</p>

          {/* Miniatures */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <div className={`h-20 w-20 rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-orange-500' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                  {i === 0 && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Zone cliquable upload */}
          {images.length < 5 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 text-orange-400 mx-auto mb-2 animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-orange-400 mx-auto mb-2" />
                )}
                <p className="font-semibold text-gray-700">
                  {uploading ? `Envoi en cours... ${uploadProgress}%` : 'Cliquez pour ajouter des photos'}
                </p>
                {uploading && (
                  <div className="mt-3 w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                {!uploading && (
                  <p className="text-sm text-gray-400 mt-1">
                    PNG, JPG, WEBP — max 10 Mo — {5 - images.length} emplacement{5 - images.length > 1 ? 's' : ''} restant{5 - images.length > 1 ? 's' : ''}
                  </p>
                )}
              </button>
            </>
          )}
        </Section>

        {/* ── Paiement / Publication ── */}
        <Section title="Publication">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-orange-800">Frais de publication</span>
              <span className="font-bold text-orange-600">{form.price > 0 ? frais.toLocaleString() : '0'} FCFA</span>
            </div>
            {form.price > 0 && (
              <p className="text-xs text-orange-700">{form.price.toLocaleString()} FCFA du prix de l'article</p>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Payez maintenant pour que votre article soit immédiatement visible par tous les utilisateurs,
            ou enregistrez-le sans payer (il restera en attente et visible uniquement par vous).
          </p>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 font-semibold"
              onClick={() => handleSubmit(true)}
              disabled={saving}
            >
              {saving ? 'Publication...' : `Payer et publier (${form.price > 0 ? frais.toLocaleString() : 0} FCFA)`}
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-semibold border-orange-300 text-orange-600 hover:bg-orange-50"
              onClick={() => handleSubmit(false)}
              disabled={saving}
            >
              Publier sans payer
            </Button>
          </div>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children, error }: { title: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-1 block">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
