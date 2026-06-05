import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { apiForgotPassword } from '../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [devToken, setDevToken] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiForgotPassword(email.trim());
      setSent(true);
      if (res.dev_token) setDevToken(res.dev_token);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center px-4">
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
          <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          <p className="text-gray-600 mt-1">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center py-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Lien envoyé !</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Si cet email est enregistré, un lien de réinitialisation a été envoyé.
                </p>
                {devToken && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">Mode développement — token :</p>
                    <code className="text-xs text-yellow-700 break-all">{devToken}</code>
                    <Link to={`/reset-password?token=${devToken}`} className="block mt-2 text-xs text-orange-600 font-semibold hover:underline">
                      → Réinitialiser le mot de passe
                    </Link>
                  </div>
                )}
                <Link to="/login">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    required
                    className="mt-1"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </Button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-gray-500 hover:text-orange-600 flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
