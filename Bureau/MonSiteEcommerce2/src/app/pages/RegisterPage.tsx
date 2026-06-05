import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Au moins 8 caractères', test: pw => pw.length >= 8 },
  { label: 'Une majuscule', test: pw => /[A-Z]/.test(pw) },
  { label: 'Un chiffre', test: pw => /\d/.test(pw) },
];

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, error, loading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    clearError();
  };

  const passwordsMatch = form.password === form.confirm && form.confirm !== '';
  const passwordValid = PASSWORD_RULES.every(r => r.test(form.password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !passwordValid) return;
    const ok = await register(form.name, form.email, form.password, form.phone || undefined);
    if (ok) navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600">
              <Store className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              AfroMarket
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-gray-600 mt-1">Rejoignez notre communauté</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Aminata Diallo"
                  value={form.name}
                  onChange={set('name')}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  Téléphone <span className="text-gray-400 font-normal">(facultatif)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+221 77 123 4567"
                  value={form.phone}
                  onChange={set('phone')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {form.password && (
                  <ul className="mt-2 space-y-1">
                    {PASSWORD_RULES.map(rule => {
                      const ok = rule.test(form.password);
                      return (
                        <li key={rule.label} className={`flex items-center gap-2 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                          {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div>
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={set('confirm')}
                    required
                    className={`pr-10 ${form.confirm && !passwordsMatch ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.confirm && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Les mots de passe correspondent
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!passwordValid || !passwordsMatch || loading}
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-orange-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
