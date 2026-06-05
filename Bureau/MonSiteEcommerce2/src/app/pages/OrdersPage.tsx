import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Package, CheckCircle2, Truck, Home, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { apiGetOrders, apiCancelOrder } from '../services/api';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
type StatusKey = typeof STATUS_STEPS[number] | 'cancelled';

const STATUS_META: Record<StatusKey, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'En attente',  color: 'text-yellow-600', bg: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmée',   color: 'text-blue-600',   bg: 'bg-blue-500',   icon: CheckCircle2 },
  shipped:   { label: 'Expédiée',    color: 'text-purple-600', bg: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Livrée',      color: 'text-green-600',  bg: 'bg-green-500',  icon: Home },
  cancelled: { label: 'Annulée',     color: 'text-red-600',    bg: 'bg-red-500',    icon: XCircle },
};

const TIMELINE_STEPS: { key: StatusKey; label: string; icon: React.ElementType }[] = [
  { key: 'pending',   label: 'Commande reçue',   icon: Clock },
  { key: 'confirmed', label: 'Confirmée',         icon: CheckCircle2 },
  { key: 'shipped',   label: 'En livraison',      icon: Truck },
  { key: 'delivered', label: 'Livrée',            icon: Home },
];

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm font-medium mt-3">
        <XCircle className="h-5 w-5" />
        Commande annulée
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number]);
  return (
    <div className="flex items-center gap-0 mt-4 w-full overflow-x-auto pb-1">
      {TIMELINE_STEPS.map((step, idx) => {
        const done    = idx <= currentIdx;
        const active  = idx === currentIdx;
        const Icon    = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                done
                  ? active
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-200 text-gray-300'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs mt-1 text-center whitespace-nowrap ${done ? (active ? 'text-orange-600 font-semibold' : 'text-green-600 font-medium') : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onCancelled }: { order: any; onCancelled: (id: string) => void }) {
  const [expanded,   setExpanded]   = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const meta = STATUS_META[order.status as StatusKey] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;

  const handleCancel = async () => {
    if (!window.confirm('Annuler cette commande ?')) return;
    setCancelling(true);
    try {
      const numericId = parseInt(order.id.slice(4), 10);
      await apiCancelOrder(numericId);
      toast.success('Commande annulée');
      onCancelled(order.id);
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono font-bold text-base">{order.id}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${meta.bg} gap-1 text-white`}>
              <StatusIcon className="h-3 w-3" />
              {meta.label}
            </Badge>
          </div>
        </div>
        <OrderTimeline status={order.status} />
      </CardHeader>

      <CardContent className="pt-0">
        {/* Résumé articles */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item: any, i: number) => (
              <img key={i} src={item.image} alt={item.productName}
                className="h-10 w-10 rounded-lg object-cover border-2 border-white" />
            ))}
            {order.items.length > 3 && (
              <div className="h-10 w-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-500">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {order.items.map((i: any) => i.productName).join(', ')}
            </p>
            <p className="text-xs text-gray-400">{order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
          </div>
          <p className="text-lg font-bold text-gray-900 flex-shrink-0">{formatPrice(order.total)}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-sm text-orange-600 font-medium hover:underline"
          >
            {expanded ? <><ChevronUp className="h-4 w-4" />Masquer le détail</> : <><ChevronDown className="h-4 w-4" />Voir le détail</>}
          </button>
          {order.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              {cancelling ? 'Annulation...' : 'Annuler'}
            </Button>
          )}
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-4">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.image} alt={item.productName} className="h-14 w-14 rounded-xl object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qté : {item.quantity}</p>
                </div>
                <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Mes Commandes | AfroMarket';
    apiGetOrders()
      .then((data: any) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelled = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
  };

  const filter = (status?: string) => status ? orders.filter(o => o.status === status) : orders;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Mes Commandes</h1>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Toutes ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="shipped">Expédiées</TabsTrigger>
            <TabsTrigger value="delivered">Livrées</TabsTrigger>
          </TabsList>

          {(['all', 'pending', 'shipped', 'delivered'] as const).map(tab => (
            <TabsContent key={tab} value={tab}>
              {filter(tab === 'all' ? undefined : tab).length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
                    <Link to="/marketplace"><Button>Découvrir la marketplace</Button></Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filter(tab === 'all' ? undefined : tab).map((order: any) => (
                    <OrderCard key={order.id} order={order} onCancelled={handleCancelled} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
