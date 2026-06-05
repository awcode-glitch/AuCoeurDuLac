import { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  apiGetConversations, apiGetMessages, apiSendMessage,
  ApiConversation, ApiMessage,
} from '../services/api';
import { toast } from 'sonner';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function MessagesPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [selectedConv, setSelectedConv] = useState<ApiConversation | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isVendor = user?.role === 'vendor';

  useEffect(() => { document.title = 'Messages | AfroMarket'; }, []);

  useEffect(() => {
    apiGetConversations()
      .then(convs => {
        setConversations(convs);
        const paramId = Number(searchParams.get('conv'));
        if (paramId) {
          const target = convs.find(c => c.id === paramId);
          if (target) { selectConv(target, convs); return; }
        }
        if (convs.length > 0) selectConv(convs[0], convs);
      })
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-poll for new messages every 5 s when a conversation is open
  useEffect(() => {
    if (!selectedConv) return;
    const interval = setInterval(() => {
      apiGetMessages(selectedConv.id)
        .then(msgs => {
          setMessages(prev => {
            if (msgs.length === prev.length) return prev;
            return msgs;
          });
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConv?.id]);

  const selectConv = (conv: ApiConversation, convList?: ApiConversation[]) => {
    setSelectedConv(conv);
    setMobileShowChat(true);
    setLoadingMsgs(true);
    apiGetMessages(conv.id)
      .then(msgs => {
        setMessages(msgs);
        const list = convList ?? conversations;
        setConversations(list.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
      })
      .catch(() => toast.error('Impossible de charger les messages'))
      .finally(() => setLoadingMsgs(false));
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedConv) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      const msg = await apiSendMessage(selectedConv.id, content);
      setMessages(prev => [...prev, msg]);
      setConversations(prev => prev.map(c =>
        c.id === selectedConv.id
          ? { ...c, lastMessage: content, lastMessageAt: msg.createdAt }
          : c
      ));
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur lors de l\'envoi');
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(c => {
    const name = isVendor ? c.buyerName : c.vendorName;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const otherName   = selectedConv ? (isVendor ? selectedConv.buyerName   : selectedConv.vendorName)   : '';
  const otherAvatar = selectedConv ? (isVendor ? selectedConv.buyerAvatar  : selectedConv.vendorAvatar) : '';
  const myId = String(user?.id ?? '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>

          {/* ── Liste des conversations ── */}
          <Card className={`lg:col-span-1 flex flex-col overflow-hidden ${mobileShowChat ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 px-6 text-center">
                  <MessageCircle className="h-12 w-12" />
                  <p className="text-sm">Aucune conversation pour l'instant</p>
                </div>
              ) : (
                filtered.map(conv => {
                  const name   = isVendor ? conv.buyerName   : conv.vendorName;
                  const avatar = isVendor ? conv.buyerAvatar  : conv.vendorAvatar;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConv(conv)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConv?.id === conv.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm truncate">{name}</h3>
                            {conv.unread > 0 && (
                              <Badge className="bg-orange-500 flex-shrink-0 text-xs h-5 w-5 flex items-center justify-center p-0">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Nouvelle conversation'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(conv.lastMessageAt)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* ── Zone de chat ── */}
          <Card className={`lg:col-span-2 flex flex-col overflow-hidden ${mobileShowChat ? 'flex' : 'hidden lg:flex'}`}>
            {!selectedConv ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                <MessageCircle className="h-16 w-16" />
                <p className="text-lg font-medium">Sélectionnez une conversation</p>
              </div>
            ) : (
              <>
                {/* Header conversation */}
                <div className="p-4 border-b flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="lg:hidden mr-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <img src={otherAvatar} alt={otherName} className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <h2 className="font-semibold">{otherName}</h2>
                    {selectedConv.productId && (
                      <p className="text-xs text-orange-600">À propos d'un produit</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                      <p className="text-sm">Démarrez la conversation !</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === myId;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                            isMe ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-orange-100' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Écrivez votre message..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sending || !text.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
