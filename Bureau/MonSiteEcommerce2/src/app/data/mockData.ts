// Mock data for the African marketplace platform

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  rating: number;
  reviews: number;
  stock: number;
  tags: string[];
  featured?: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  rating: number;
  reviews: number;
  products: number;
  location: string;
  verified: boolean;
  joinDate: string;
  categories: string[];
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export const categories = [
  { id: '1', name: 'Mode & Vêtements', icon: 'Shirt' },
  { id: '2', name: 'Électronique', icon: 'Smartphone' },
  { id: '3', name: 'Beauté & Santé', icon: 'Sparkles' },
  { id: '4', name: 'Maison & Jardin', icon: 'Home' },
  { id: '5', name: 'Sport & Loisirs', icon: 'Trophy' },
  { id: '6', name: 'Alimentation', icon: 'UtensilsCrossed' },
  { id: '7', name: 'Artisanat', icon: 'Palette' },
  { id: '8', name: 'Bijoux', icon: 'Gem' },
];

export const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'Afro Fashion',
    description: 'Vêtements traditionnels africains modernes et accessoires de qualité',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
    rating: 4.8,
    reviews: 342,
    products: 156,
    location: 'Dakar, Sénégal',
    verified: true,
    joinDate: '2023-01-15',
    categories: ['Mode & Vêtements', 'Artisanat'],
  },
  {
    id: 'v2',
    name: 'Tech Afrika',
    description: 'Les dernières technologies et gadgets électroniques',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop',
    rating: 4.9,
    reviews: 589,
    products: 234,
    location: 'Lagos, Nigeria',
    verified: true,
    joinDate: '2022-08-20',
    categories: ['Électronique'],
  },
  {
    id: 'v3',
    name: 'Beauty Queen',
    description: 'Produits de beauté naturels et cosmétiques africains',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop',
    rating: 4.7,
    reviews: 276,
    products: 98,
    location: 'Abidjan, Côte d\'Ivoire',
    verified: true,
    joinDate: '2023-03-10',
    categories: ['Beauté & Santé'],
  },
  {
    id: 'v4',
    name: 'Artisan Craft',
    description: 'Artisanat authentique et créations uniques faites main',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&h=400&fit=crop',
    rating: 4.9,
    reviews: 198,
    products: 67,
    location: 'Accra, Ghana',
    verified: true,
    joinDate: '2022-11-05',
    categories: ['Artisanat', 'Bijoux'],
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Robe Wax Africaine Premium',
    description: 'Magnifique robe en tissu wax authentique, confectionnée à la main. Coupe moderne et confortable.',
    price: 45000,
    originalPrice: 60000,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop',
    category: 'Mode & Vêtements',
    vendorId: 'v1',
    vendorName: 'Afro Fashion',
    vendorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    rating: 4.8,
    reviews: 45,
    stock: 12,
    tags: ['Wax', 'Fait main', 'Premium'],
    featured: true,
  },
  {
    id: 'p2',
    name: 'Smartphone Galaxy A54 5G',
    description: 'Smartphone dernière génération avec écran AMOLED 120Hz, 128GB de stockage.',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
    category: 'Électronique',
    vendorId: 'v2',
    vendorName: 'Tech Afrika',
    vendorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    rating: 4.9,
    reviews: 128,
    stock: 24,
    tags: ['5G', 'Samsung', 'Neuf'],
    featured: true,
  },
  {
    id: 'p3',
    name: 'Beurre de Karité Bio 250g',
    description: 'Beurre de karité 100% naturel et bio, parfait pour les soins de la peau et des cheveux.',
    price: 8500,
    originalPrice: 12000,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
    category: 'Beauté & Santé',
    vendorId: 'v3',
    vendorName: 'Beauty Queen',
    vendorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    rating: 4.9,
    reviews: 89,
    stock: 50,
    tags: ['Bio', 'Naturel', 'Artisanal'],
    featured: true,
  },
  {
    id: 'p4',
    name: 'Panier Artisanal en Raphia',
    description: 'Panier tressé à la main en raphia naturel, idéal pour le rangement ou la décoration.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=600&fit=crop',
    category: 'Artisanat',
    vendorId: 'v4',
    vendorName: 'Artisan Craft',
    vendorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 4.7,
    reviews: 34,
    stock: 8,
    tags: ['Fait main', 'Écologique', 'Unique'],
  },
  {
    id: 'p5',
    name: 'Casque Audio Sans Fil',
    description: 'Casque Bluetooth avec réduction de bruit active, autonomie 30h.',
    price: 45000,
    originalPrice: 55000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    category: 'Électronique',
    vendorId: 'v2',
    vendorName: 'Tech Afrika',
    vendorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    rating: 4.8,
    reviews: 67,
    stock: 15,
    tags: ['Bluetooth', 'Noise Cancelling'],
    featured: true,
  },
  {
    id: 'p6',
    name: 'Montre Connectée Sport',
    description: 'Montre intelligente avec suivi fitness, GPS intégré et notifications smartphone.',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    category: 'Électronique',
    vendorId: 'v2',
    vendorName: 'Tech Afrika',
    vendorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    rating: 4.6,
    reviews: 92,
    stock: 20,
    tags: ['Sport', 'GPS', 'Fitness'],
  },
  {
    id: 'p7',
    name: 'Chemise Bazin Brodée',
    description: 'Chemise homme en bazin de qualité supérieure avec broderies traditionnelles.',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop',
    category: 'Mode & Vêtements',
    vendorId: 'v1',
    vendorName: 'Afro Fashion',
    vendorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    rating: 4.9,
    reviews: 56,
    stock: 18,
    tags: ['Bazin', 'Broderie', 'Élégant'],
  },
  {
    id: 'p8',
    name: 'Collier Perles Africaines',
    description: 'Magnifique collier artisanal en perles colorées, design unique et authentique.',
    price: 12000,
    originalPrice: 18000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
    category: 'Bijoux',
    vendorId: 'v4',
    vendorName: 'Artisan Craft',
    vendorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 4.8,
    reviews: 41,
    stock: 6,
    tags: ['Perles', 'Unique', 'Artisanal'],
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    date: '2024-05-20',
    status: 'delivered',
    total: 93500,
    items: [
      {
        productId: 'p1',
        productName: 'Robe Wax Africaine Premium',
        quantity: 1,
        price: 45000,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&h=100&fit=crop',
      },
      {
        productId: 'p5',
        productName: 'Casque Audio Sans Fil',
        quantity: 1,
        price: 45000,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      },
    ],
    customer: {
      name: 'Aminata Diallo',
      email: 'aminata.diallo@example.com',
      phone: '+221 77 123 4567',
      address: 'Plateau, Dakar, Sénégal',
    },
  },
  {
    id: 'ORD-2024-002',
    date: '2024-05-21',
    status: 'shipped',
    total: 280000,
    items: [
      {
        productId: 'p2',
        productName: 'Smartphone Galaxy A54 5G',
        quantity: 1,
        price: 280000,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
      },
    ],
    customer: {
      name: 'Kwame Mensah',
      email: 'kwame.mensah@example.com',
      phone: '+233 24 567 8901',
      address: 'Osu, Accra, Ghana',
    },
  },
  {
    id: 'ORD-2024-003',
    date: '2024-05-22',
    status: 'confirmed',
    total: 23500,
    items: [
      {
        productId: 'p3',
        productName: 'Beurre de Karité Bio 250g',
        quantity: 2,
        price: 8500,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=100&h=100&fit=crop',
      },
      {
        productId: 'p4',
        productName: 'Panier Artisanal en Raphia',
        quantity: 1,
        price: 15000,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=100&h=100&fit=crop',
      },
    ],
    customer: {
      name: 'Fatou Ndiaye',
      email: 'fatou.ndiaye@example.com',
      phone: '+225 07 89 12 34',
      address: 'Cocody, Abidjan, Côte d\'Ivoire',
    },
  },
];

export const dashboardStats = {
  vendor: {
    totalRevenue: 2450000,
    totalOrders: 156,
    totalProducts: 45,
    totalCustomers: 89,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    recentOrders: mockOrders,
  },
  admin: {
    totalRevenue: 12450000,
    totalVendors: 234,
    totalProducts: 1567,
    totalOrders: 3456,
    activeUsers: 12567,
    revenueGrowth: 18.7,
    vendorsGrowth: 15.2,
    ordersGrowth: 22.1,
  },
};
