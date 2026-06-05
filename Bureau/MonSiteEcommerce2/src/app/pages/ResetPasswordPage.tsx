import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { apiResetPassword } from '../services/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const [token, setToken]         = useState(searchParams.get('token') ?? '');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPw.length < 8)     { setError('Au moins 8 caractères'); return; }
    if (newPw !== confirmPw)  { setError('Les mots de passe ne correspondent pas'); return; }
    if (!token.trim())        { setError('Token requis'); return; }
    setLoading(true);
    try {
      await apiResetPassword(token.trim(), newPw);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="text-gray-600 mt-1">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {success ? (
              <div className="text-center py-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Mot de passe réinitialisé !</h2>
                <p className="text-gray-600 text-sm mb-4">Redirection vers la connexion...</p>
                <Link to="/login"><Button>Se connecter</Button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!searchParams.get('token') && (
                  <div>
                    <Label htmlFor="token">Token de réinitialisation</Label>
                    <Input
                      id="token"
                      placeholder="Collez votre token ici"
                      value={token}
                      onChange={e => { setToken(e.target.value); setError(''); }}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="newPw">Nouveau mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="8 caractères minimum"
                      value={newPw}
                      onChange={e => { setNewPw(e.target.value); setError(''); }}
                      required
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPw">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Répéter le mot de passe"
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setError(''); }}
                    required
                    className={`mt-1 ${confirmPw && newPw !== confirmPw ? 'border-red-400' : ''}`}
                  />
                  {confirmPw && newPw !== confirmPw && (
                    <p className="text-xs text-red-500 mt-1">Ne correspond pas</p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading || !token || !newPw || newPw !== confirmPw}>
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-sm text-gray-500 hover:text-orange-600">
                    Retour à la connexion
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
