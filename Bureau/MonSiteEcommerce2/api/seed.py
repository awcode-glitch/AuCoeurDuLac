"""Peuple la base de données avec les données de démonstration."""
import json
from app import app
from models import db, Category, Vendor, Product, User
from werkzeug.security import generate_password_hash

CATEGORIES = [
    {'id': 1, 'name': 'Mode & Vêtements',  'icon': 'Shirt'},
    {'id': 2, 'name': 'Électronique',       'icon': 'Smartphone'},
    {'id': 3, 'name': 'Beauté & Santé',     'icon': 'Sparkles'},
    {'id': 4, 'name': 'Maison & Jardin',    'icon': 'Home'},
    {'id': 5, 'name': 'Sport & Loisirs',    'icon': 'Trophy'},
    {'id': 6, 'name': 'Alimentation',       'icon': 'UtensilsCrossed'},
    {'id': 7, 'name': 'Artisanat',          'icon': 'Palette'},
    {'id': 8, 'name': 'Bijoux',             'icon': 'Gem'},
]

VENDORS = [
    {
        'id': 'v1', 'name': 'Afro Fashion',
        'description': 'Vêtements traditionnels africains modernes et accessoires de qualité',
        'avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
        'banner': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
        'rating': 4.8, 'reviews': 342, 'products_count': 156,
        'location': 'Dakar, Sénégal', 'verified': True,
        'join_date': '2023-01-15',
        'categories': json.dumps(['Mode & Vêtements', 'Artisanat']),
    },
    {
        'id': 'v2', 'name': 'Tech Afrika',
        'description': 'Les dernières technologies et gadgets électroniques',
        'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        'banner': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop',
        'rating': 4.9, 'reviews': 589, 'products_count': 234,
        'location': 'Lagos, Nigeria', 'verified': True,
        'join_date': '2022-08-20',
        'categories': json.dumps(['Électronique']),
    },
    {
        'id': 'v3', 'name': 'Beauty Queen',
        'description': "Produits de beauté naturels et cosmétiques africains",
        'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        'banner': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop',
        'rating': 4.7, 'reviews': 276, 'products_count': 98,
        "location": "Abidjan, Côte d'Ivoire", 'verified': True,
        'join_date': '2023-03-10',
        'categories': json.dumps(['Beauté & Santé']),
    },
    {
        'id': 'v4', 'name': 'Artisan Craft',
        'description': 'Artisanat authentique et créations uniques faites main',
        'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        'banner': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&h=400&fit=crop',
        'rating': 4.9, 'reviews': 198, 'products_count': 67,
        'location': 'Accra, Ghana', 'verified': True,
        'join_date': '2022-11-05',
        'categories': json.dumps(['Artisanat', 'Bijoux']),
    },
]

PRODUCTS = [
    {
        'id': 'p1', 'name': 'Robe Wax Africaine Premium',
        'description': 'Magnifique robe en tissu wax authentique, confectionnée à la main.',
        'price': 45000, 'original_price': 60000,
        'image': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop',
        'category': 'Mode & Vêtements', 'vendor_id': 'v1',
        'vendor_name': 'Afro Fashion',
        'vendor_avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
        'rating': 4.8, 'reviews': 45, 'stock': 12,
        'tags': json.dumps(['Wax', 'Fait main', 'Premium']), 'featured': True,
    },
    {
        'id': 'p2', 'name': 'Smartphone Galaxy A54 5G',
        'description': 'Smartphone dernière génération avec écran AMOLED 120Hz, 128GB.',
        'price': 280000, 'original_price': None,
        'image': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
        'category': 'Électronique', 'vendor_id': 'v2',
        'vendor_name': 'Tech Afrika',
        'vendor_avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        'rating': 4.9, 'reviews': 128, 'stock': 24,
        'tags': json.dumps(['5G', 'Samsung', 'Neuf']), 'featured': True,
    },
    {
        'id': 'p3', 'name': 'Beurre de Karité Bio 250g',
        'description': 'Beurre de karité 100% naturel et bio, parfait pour la peau et les cheveux.',
        'price': 8500, 'original_price': 12000,
        'image': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
        'category': 'Beauté & Santé', 'vendor_id': 'v3',
        'vendor_name': 'Beauty Queen',
        'vendor_avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        'rating': 4.9, 'reviews': 89, 'stock': 50,
        'tags': json.dumps(['Bio', 'Naturel', 'Artisanal']), 'featured': True,
    },
    {
        'id': 'p4', 'name': 'Panier Artisanal en Raphia',
        'description': 'Panier tressé à la main en raphia naturel, idéal pour la décoration.',
        'price': 15000, 'original_price': None,
        'image': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=600&fit=crop',
        'category': 'Artisanat', 'vendor_id': 'v4',
        'vendor_name': 'Artisan Craft',
        'vendor_avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        'rating': 4.7, 'reviews': 34, 'stock': 8,
        'tags': json.dumps(['Fait main', 'Écologique', 'Unique']), 'featured': False,
    },
    {
        'id': 'p5', 'name': 'Casque Audio Sans Fil',
        'description': 'Casque Bluetooth avec réduction de bruit active, autonomie 30h.',
        'price': 45000, 'original_price': 55000,
        'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        'category': 'Électronique', 'vendor_id': 'v2',
        'vendor_name': 'Tech Afrika',
        'vendor_avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        'rating': 4.8, 'reviews': 67, 'stock': 15,
        'tags': json.dumps(['Bluetooth', 'Noise Cancelling']), 'featured': True,
    },
    {
        'id': 'p6', 'name': 'Montre Connectée Sport',
        'description': 'Montre intelligente avec suivi fitness, GPS et notifications.',
        'price': 85000, 'original_price': None,
        'image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
        'category': 'Électronique', 'vendor_id': 'v2',
        'vendor_name': 'Tech Afrika',
        'vendor_avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        'rating': 4.6, 'reviews': 92, 'stock': 20,
        'tags': json.dumps(['Sport', 'GPS', 'Fitness']), 'featured': False,
    },
    {
        'id': 'p7', 'name': 'Chemise Bazin Brodée',
        'description': 'Chemise homme en bazin de qualité supérieure avec broderies traditionnelles.',
        'price': 38000, 'original_price': None,
        'image': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop',
        'category': 'Mode & Vêtements', 'vendor_id': 'v1',
        'vendor_name': 'Afro Fashion',
        'vendor_avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
        'rating': 4.9, 'reviews': 56, 'stock': 18,
        'tags': json.dumps(['Bazin', 'Broderie', 'Élégant']), 'featured': False,
    },
    {
        'id': 'p8', 'name': 'Collier Perles Africaines',
        'description': 'Magnifique collier artisanal en perles colorées, design authentique.',
        'price': 12000, 'original_price': 18000,
        'image': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
        'category': 'Bijoux', 'vendor_id': 'v4',
        'vendor_name': 'Artisan Craft',
        'vendor_avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        'rating': 4.8, 'reviews': 41, 'stock': 6,
        'tags': json.dumps(['Perles', 'Unique', 'Artisanal']), 'featured': False,
    },
]

USERS = [
    {
        'name': 'Aminata Diallo', 'email': 'client@afromarket.com', 'password': 'client123',
        'avatar': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
        'role': 'customer',
    },
    {
        'name': 'Kofi Mensah', 'email': 'vendeur@afromarket.com', 'password': 'vendeur123',
        'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        'role': 'vendor', 'vendor_id': 'v2',
    },
    {
        'name': 'Admin AfroMarket', 'email': 'admin@afromarket.com', 'password': 'admin123',
        'avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        'role': 'admin',
    },
]

with app.app_context():
    db.drop_all()
    db.create_all()

    for c in CATEGORIES:
        db.session.add(Category(**c))

    for v in VENDORS:
        db.session.add(Vendor(**v))

    for p in PRODUCTS:
        db.session.add(Product(**p))

    for u in USERS:
        pw = u.pop('password')
        db.session.add(User(password_hash=generate_password_hash(pw), **u))

    db.session.commit()
    print('✓ Base de données peuplée avec succès')
