import { useState } from 'react';
import { User, MapPin, Phone, Mail, Edit, BadgeCheck, Lock, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { apiUpdateProfile, apiChangePassword } from '../services/api';

const ROLE_LABELS: Record<string, string> = {
  customer: 'Client',
  vendor: 'Vendeur',
  admin: 'Administrateur',
};

const ROLE_COLORS: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-700',
  vendor: 'bg-orange-100 text-orange-700',
  admin: 'bg-purple-100 text-purple-700',
};

export function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const nameParts = (user?.name ?? '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] ?? '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [saving, setSaving] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? '');
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [savingPw,   setSavingPw]   = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8)        { toast.error('Au moins 8 caractères'); return; }
    if (newPw !== confirmPw)     { toast.error('Les mots de passe ne correspondent pas'); return; }
    setSavingPw(true);
    try {
      await apiChangePassword(currentPw, newPw);
      toast.success('Mot de passe mis à jour');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur');
    } finally {
      setSavingPw(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarUrl.trim()) { toast.error('Entrez une URL valide'); return; }
    setSavingAvatar(true);
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || user!.name;
      const updated = await apiUpdateProfile(fullName, phone || undefined, avatarUrl.trim());
      setUser({ ...user!, ...updated });
      setAvatarDialogOpen(false);
      toast.success('Photo mise à jour');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    if (!fullName) { toast.error('Le prénom est requis'); return; }
    setSaving(true);
    try {
      const updated = await apiUpdateProfile(fullName, phone || undefined, undefined, address || undefined);
      setUser({ ...user!, ...updated });
      toast.success('Profil mis à jour');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Carte avatar */}
          <Card>
            <CardContent className="p-6 text-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-orange-100"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              <h2 className="text-xl font-bold mb-1">{user?.name ?? '—'}</h2>
              <p className="text-gray-600 text-sm mb-3">{user?.email ?? '—'}</p>

              {user?.role && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role]}`}>
                  <BadgeCheck className="h-3 w-3" />
                  {ROLE_LABELS[user.role]}
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-2 mt-4 w-full"
                onClick={() => { setAvatarUrl(user?.avatar ?? ''); setAvatarDialogOpen(true); }}
              >
                <Edit className="h-4 w-4" />
                Modifier la photo
              </Button>
            </CardContent>
          </Card>

          {/* Formulaire */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2 mt-1">
                    <Mail className="h-10 w-10 p-2 border rounded-lg text-gray-400 flex-shrink-0" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email ?? ''}
                      readOnly
                      className="flex-1 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="flex gap-2 mt-1">
                    <Phone className="h-10 w-10 p-2 border rounded-lg text-gray-400 flex-shrink-0" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+221 77 123 4567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse de livraison</Label>
                  <div className="flex gap-2 mt-1">
                    <MapPin className="h-10 w-10 p-2 border rounded-lg text-gray-400 flex-shrink-0" />
                    <Input
                      id="address"
                      placeholder="Quartier, Ville, Pays"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Changer le mot de passe */}
        <Card className="lg:col-span-3 mt-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-500" />
              Changer le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentPw">Mot de passe actuel</Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPw"
                    type={showPw ? 'text' : 'password'}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPw">Nouveau mot de passe</Label>
                <Input
                  id="newPw"
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPw">Confirmer</Label>
                <Input
                  id="confirmPw"
                  type={showPw ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Répéter le mot de passe"
                  className={`mt-1 ${confirmPw && newPw !== confirmPw ? 'border-red-400' : ''}`}
                />
                {confirmPw && newPw !== confirmPw && (
                  <p className="text-xs text-red-500 mt-1">Ne correspond pas</p>
                )}
              </div>

              <div className="md:col-span-3">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={savingPw || !currentPw || !newPw || newPw !== confirmPw}
                >
                  {savingPw ? 'Mise à jour...' : 'Changer le mot de passe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialog changement de photo */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la photo de profil</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Prévisualisation */}
            <div className="flex justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Aperçu"
                  className="h-24 w-24 rounded-full object-cover border-4 border-orange-100"
                  onError={e => (e.currentTarget.src = '')}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>URL de la photo</Label>
              <Input
                placeholder="https://exemple.com/ma-photo.jpg"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
              />
              <p className="text-xs text-gray-400">Copiez-collez l'URL d'une image en ligne</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAvatarDialogOpen(false)} disabled={savingAvatar}>
              Annuler
            </Button>
            <Button onClick={handleSaveAvatar} disabled={savingAvatar || !avatarUrl.trim()}>
              {savingAvatar ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
