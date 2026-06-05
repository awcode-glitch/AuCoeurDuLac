import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Star, TrendingUp, Bell, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { apiGetNotifications, apiMarkAllRead, apiMarkOneRead, ApiNotification } from '../services/api';

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string }> = {
  order:  { icon: ShoppingBag, color: 'bg-green-100 text-green-600' },
  status: { icon: Package,     color: 'bg-blue-100 text-blue-600' },
  review: { icon: Star,        color: 'bg-yellow-100 text-yellow-600' },
  promo:  { icon: TrendingUp,  color: 'bg-orange-100 text-orange-600' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "À l'instant";
  if (m < 60)  return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d} jour${d > 1 ? 's' : ''}`;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Notifications | AfroMarket'; }, []);

  useEffect(() => {
    apiGetNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAll = async () => {
    await apiMarkAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleMarkOne = async (notif: ApiNotification) => {
    if (!notif.read) {
      await apiMarkOneRead(notif.id).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    if (notif.type === 'order' || notif.type === 'status') navigate('/orders');
    else if (notif.type === 'review') navigate('/marketplace');
    else if (notif.type === 'promo') navigate('/marketplace');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAll} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="max-w-3xl">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Aucune notification</h2>
                <p className="text-gray-500">
                  Les notifications apparaîtront ici lorsque vous passerez une commande, recevrez un avis, etc.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => {
                const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.promo;
                const Icon = cfg.icon;
                return (
                  <Card
                    key={notif.id}
                    onClick={() => handleMarkOne(notif)}
                    className={`cursor-pointer hover:shadow-md transition-all ${notif.read ? 'opacity-75' : 'border-l-4 border-l-orange-500'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm leading-tight">{notif.title}</h3>
                            {!notif.read && <Badge className="bg-orange-500 flex-shrink-0">Nouveau</Badge>}
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{notif.message}</p>
                          <p className="text-xs text-gray-400">{timeAgo(notif.date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
