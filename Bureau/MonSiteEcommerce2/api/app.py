import re
import os
import json
import uuid
import secrets
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timezone, timedelta
import cloudinary
import cloudinary.uploader
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from models import db, Category, Vendor, Product, User, Order, OrderItem, Review, Notification, Conversation, Message, VendorReview, PasswordResetToken, Wishlist

load_dotenv()

app = Flask(__name__)

# Render fournit 'postgres://', SQLAlchemy requiert 'postgresql://'
_db_url = os.getenv('DATABASE_URL', 'sqlite:///afromarket.db')
if _db_url.startswith('postgres://'):
    _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = _db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-change-in-prod')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = __import__('datetime').timedelta(days=7)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB max
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Cloudinary : actif si CLOUDINARY_URL ou les 3 variables sont présentes
_cld_url = os.environ.get('CLOUDINARY_URL', '')
_cld_name = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
if _cld_url:
    cloudinary.config_from_url(_cld_url)
    USE_CLOUDINARY = True
elif _cld_name:
    cloudinary.config(
        cloud_name=_cld_name,
        api_key=os.environ.get('CLOUDINARY_API_KEY', ''),
        api_secret=os.environ.get('CLOUDINARY_API_SECRET', ''),
        secure=True,
    )
    USE_CLOUDINARY = True
else:
    USE_CLOUDINARY = False

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

_cors_origins = os.getenv('CORS_ORIGINS', '')
if _cors_origins:
    cors_list = [o.strip() for o in _cors_origins.split(',')]
    CORS(app, origins=cors_list)
else:
    # développement : autorise tous les ports localhost
    CORS(app, origins=re.compile(r'http://(localhost|127\.0\.0\.1):\d+'))
db.init_app(app)
JWTManager(app)

STATUS_LABELS = {
    'pending': 'En attente', 'confirmed': 'Confirmée',
    'shipped': 'Expédiée',   'delivered': 'Livrée', 'cancelled': 'Annulée',
}


# ─── Helpers ────────────────────────────────────────────────────────────────

def error(msg, code=400):
    return jsonify({'error': msg}), code

def notify(user_id: int, type_: str, title: str, message: str):
    db.session.add(Notification(user_id=user_id, type=type_, title=title, message=message))

def ok(data, code=200):
    return jsonify(data), code

def get_user(user_id):
    return db.session.get(User, int(user_id))


def send_reset_email(to_email: str, token: str, name: str) -> bool:
    smtp_host  = os.environ.get('SMTP_HOST', '')
    smtp_port  = int(os.environ.get('SMTP_PORT', 587))
    smtp_user  = os.environ.get('SMTP_USER', '')
    smtp_pass  = os.environ.get('SMTP_PASS', '')
    from_email = os.environ.get('SMTP_FROM', smtp_user)
    site_url   = os.environ.get('SITE_URL', 'http://localhost:5173')
    if not smtp_host or not smtp_user:
        return False
    reset_url = f"{site_url}/reset-password?token={token}"
    body = (
        f"Bonjour {name},\n\n"
        f"Cliquez sur ce lien pour réinitialiser votre mot de passe :\n{reset_url}\n\n"
        f"Ce lien expire dans 1 heure.\n"
        f"Si vous n'avez pas fait cette demande, ignorez cet email."
    )
    msg = MIMEText(body, 'plain', 'utf-8')
    msg['Subject'] = 'Réinitialisation de votre mot de passe AfroMarket'
    msg['From']    = from_email
    msg['To']      = to_email
    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as srv:
            srv.ehlo()
            srv.starttls()
            srv.login(smtp_user, smtp_pass)
            srv.sendmail(from_email, [to_email], msg.as_string())
        return True
    except Exception as exc:
        print(f'[email] Erreur envoi: {exc}')
        return False


# ─── Upload images ───────────────────────────────────────────────────────────

@app.post('/api/upload')
@jwt_required()
def upload_image():
    if 'file' not in request.files:
        return error('Aucun fichier envoyé')
    file = request.files['file']
    if file.filename == '':
        return error('Nom de fichier vide')
    if not allowed_file(file.filename):
        return error('Format non autorisé. Utilisez PNG, JPG, JPEG, GIF ou WEBP')

    if USE_CLOUDINARY:
        try:
            result = cloudinary.uploader.upload(
                file,
                folder='afromarket',
                resource_type='image',
            )
            return ok({'url': result['secure_url']})
        except Exception as exc:
            return error(f'Erreur Cloudinary : {exc}')

    # Stockage local (dev)
    ext      = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return ok({'url': f"/api/uploads/{filename}"})

@app.get('/api/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ─── Root (évite le "Not Found" quand on ouvre localhost:5000) ───────────────

@app.get('/')
def root():
    return ok({
        'name': 'AfroMarket API',
        'version': '1.0',
        'status': 'running',
        'endpoints': [
            '/api/categories', '/api/products', '/api/vendors',
            '/api/auth/login', '/api/auth/register', '/api/auth/me',
            '/api/orders', '/api/admin/stats', '/api/admin/orders',
            '/api/admin/users',
        ]
    })


# ─── Categories ─────────────────────────────────────────────────────────────

@app.get('/api/categories')
def get_categories():
    return ok([c.to_dict() for c in Category.query.all()])


# ─── Products ───────────────────────────────────────────────────────────────

@app.get('/api/products')
def get_products():
    q             = request.args.get('search', '').lower()
    category      = request.args.get('category', '')
    location      = request.args.get('location', '')
    sort          = request.args.get('sort', 'featured')
    featured_only = request.args.get('featured') == 'true'
    min_price     = request.args.get('min_price', type=float)
    max_price     = request.args.get('max_price', type=float)
    page          = request.args.get('page', type=int)
    per_page      = request.args.get('per_page', 12, type=int)

    query = Product.query

    if q:
        query = query.filter(
            db.or_(Product.name.ilike(f'%{q}%'), Product.description.ilike(f'%{q}%'))
        )
    if category:
        cat = db.session.get(Category, category)
        cat_name = cat.name if cat else category
        query = query.filter(Product.category == cat_name)
    if location:
        vendor_ids = [v.id for v in Vendor.query.filter(Vendor.location.ilike(f'%{location}%')).all()]
        query = query.filter(Product.vendor_id.in_(vendor_ids))
    if featured_only:
        query = query.filter(Product.featured == True)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if sort == 'price-asc':
        query = query.order_by(Product.price.asc())
    elif sort == 'price-desc':
        query = query.order_by(Product.price.desc())
    elif sort == 'rating':
        query = query.order_by(Product.rating.desc())

    if page:
        total = query.count()
        pages = max(1, (total + per_page - 1) // per_page)
        items = query.offset((page - 1) * per_page).limit(per_page).all()
        return ok({'items': [p.to_dict() for p in items], 'total': total, 'pages': pages, 'page': page})

    return ok([p.to_dict() for p in query.all()])


@app.get('/api/products/<product_id>')
def get_product(product_id):
    p = db.session.get(Product, product_id)
    if not p:
        return error('Produit non trouvé', 404)
    related = Product.query.filter(Product.category == p.category, Product.id != p.id).limit(4).all()
    data = p.to_dict()
    data['related'] = [r.to_dict() for r in related]
    return ok(data)


@app.get('/api/products/<product_id>/reviews')
def get_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
    return ok([r.to_dict() for r in reviews])


@app.post('/api/products/<product_id>/reviews')
@jwt_required()
def add_review(product_id):
    user_id = int(get_jwt_identity())
    product = db.session.get(Product, product_id)
    if not product:
        return error('Produit non trouvé', 404)

    existing = Review.query.filter_by(product_id=product_id, user_id=user_id).first()
    if existing:
        return error('Vous avez déjà laissé un avis sur ce produit', 400)

    body    = request.get_json() or {}
    rating  = body.get('rating')
    comment = (body.get('comment') or '').strip()

    try:
        rating = int(rating)
        if not 1 <= rating <= 5: raise ValueError
    except (TypeError, ValueError):
        return error('La note doit être entre 1 et 5')

    review = Review(product_id=product_id, user_id=user_id, rating=rating, comment=comment)
    db.session.add(review)
    db.session.flush()

    # Recalcule la moyenne et le compte
    all_reviews     = Review.query.filter_by(product_id=product_id).all()
    product.reviews = len(all_reviews)
    product.rating  = round(sum(r.rating for r in all_reviews) / len(all_reviews), 1)

    # Notifier le vendeur
    vendor_user = User.query.filter_by(vendor_id=product.vendor_id, role='vendor').first()
    if vendor_user:
        reviewer = db.session.get(User, user_id)
        notify(vendor_user.id, 'review', 'Nouvel avis sur votre produit',
               f'{reviewer.name if reviewer else "Un client"} a laissé {rating}★ sur "{product.name}".')

    db.session.commit()
    return ok(review.to_dict(), 201)


@app.get('/api/vendors/<vendor_id>/reviews')
def get_vendor_reviews(vendor_id):
    reviews = VendorReview.query.filter_by(vendor_id=vendor_id).order_by(VendorReview.created_at.desc()).all()
    return ok([r.to_dict() for r in reviews])


@app.post('/api/vendors/<vendor_id>/reviews')
@jwt_required()
def add_vendor_review(vendor_id):
    user_id = int(get_jwt_identity())
    vendor  = db.session.get(Vendor, vendor_id)
    if not vendor:
        return error('Boutique non trouvée', 404)

    existing = VendorReview.query.filter_by(vendor_id=vendor_id, user_id=user_id).first()
    if existing:
        return error('Vous avez déjà laissé un avis sur cette boutique', 400)

    body    = request.get_json() or {}
    rating  = body.get('rating')
    comment = (body.get('comment') or '').strip()

    try:
        rating = int(rating)
        if not 1 <= rating <= 5: raise ValueError
    except (TypeError, ValueError):
        return error('La note doit être entre 1 et 5')

    review = VendorReview(vendor_id=vendor_id, user_id=user_id, rating=rating, comment=comment)
    db.session.add(review)
    db.session.flush()

    all_reviews     = VendorReview.query.filter_by(vendor_id=vendor_id).all()
    vendor.reviews  = len(all_reviews)
    vendor.rating   = round(sum(r.rating for r in all_reviews) / len(all_reviews), 1)

    db.session.commit()
    return ok(review.to_dict(), 201)


# ─── Locations ──────────────────────────────────────────────────────────────

@app.get('/api/locations')
def get_locations():
    rows = db.session.query(Vendor.location).filter(
        Vendor.location != None, Vendor.location != ''
    ).distinct().all()
    return ok(sorted([r[0] for r in rows if r[0]]))


# ─── Vendors ────────────────────────────────────────────────────────────────

@app.get('/api/vendors')
def get_vendors():
    q            = request.args.get('search', '').lower()
    location     = request.args.get('location', '')
    verified_only = request.args.get('verified') == 'true'

    query = Vendor.query
    if q:
        query = query.filter(
            db.or_(Vendor.name.ilike(f'%{q}%'), Vendor.description.ilike(f'%{q}%'))
        )
    if location:
        query = query.filter(Vendor.location.ilike(f'%{location}%'))
    if verified_only:
        query = query.filter(Vendor.verified == True)

    return ok([v.to_dict() for v in query.all()])


@app.get('/api/vendors/<vendor_id>')
def get_vendor(vendor_id):
    v = db.session.get(Vendor, vendor_id)
    if not v:
        return error('Vendeur non trouvé', 404)
    data = v.to_dict()
    data['productList'] = [p.to_dict() for p in v.products]
    return ok(data)


# ─── Auth ────────────────────────────────────────────────────────────────────

@app.post('/api/auth/register')
def register():
    body     = request.get_json()
    name     = (body.get('name') or '').strip()
    email    = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    phone    = (body.get('phone') or '').strip() or None

    if not name or not email or not password:
        return error('Nom, email et mot de passe sont requis')
    if len(password) < 8:
        return error('Le mot de passe doit contenir au moins 8 caractères')
    if User.query.filter_by(email=email).first():
        return error('Un compte avec cet email existe déjà')

    avatars = [
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    ]
    user = User(
        name=name, email=email,
        password_hash=generate_password_hash(password),
        phone=phone,
        avatar=avatars[User.query.count() % len(avatars)],
        role='customer',
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return ok({'token': token, 'user': user.to_dict()}, 201)


@app.post('/api/auth/login')
def login():
    body     = request.get_json()
    email    = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return error('Email ou mot de passe incorrect', 401)

    token = create_access_token(identity=str(user.id))
    return ok({'token': token, 'user': user.to_dict()})


@app.get('/api/auth/me')
@jwt_required()
def me():
    user = get_user(get_jwt_identity())
    if not user:
        return error('Utilisateur non trouvé', 404)
    return ok(user.to_dict())


@app.post('/api/auth/forgot-password')
def forgot_password():
    body  = request.get_json() or {}
    email = (body.get('email') or '').strip().lower()
    user  = User.query.filter_by(email=email).first()
    if user:
        PasswordResetToken.query.filter_by(user_id=user.id, used=False).delete()
        token      = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        prt = PasswordResetToken(user_id=user.id, token=token, expires_at=expires_at)
        db.session.add(prt)
        db.session.commit()
        email_sent = send_reset_email(user.email, token, user.name)
        resp = {'message': 'Si cet email est enregistré, un lien vous a été envoyé.'}
        if not email_sent:
            resp['dev_token'] = token  # pas de serveur SMTP configuré — mode dev
        return ok(resp)
    return ok({'message': 'Si cet email est enregistré, un lien vous a été envoyé.'})


@app.post('/api/auth/reset-password')
def reset_password():
    body         = request.get_json() or {}
    token        = (body.get('token') or '').strip()
    new_password = (body.get('newPassword') or '').strip()
    if len(new_password) < 8:
        return error('Le mot de passe doit contenir au moins 8 caractères')
    prt = PasswordResetToken.query.filter_by(token=token, used=False).first()
    if not prt:
        return error('Token invalide ou déjà utilisé')
    if prt.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return error('Ce lien a expiré. Demandez un nouveau lien.')
    user = db.session.get(User, prt.user_id)
    if not user:
        return error('Utilisateur introuvable')
    user.password_hash = generate_password_hash(new_password)
    prt.used = True
    db.session.commit()
    return ok({'message': 'Mot de passe réinitialisé avec succès'})


@app.post('/api/vendor/apply')
@jwt_required()
def vendor_apply():
    user = get_user(get_jwt_identity())
    if not user:
        return error('Utilisateur non trouvé', 404)
    if user.role == 'vendor':
        return error('Vous êtes déjà vendeur', 400)

    body        = request.get_json() or {}
    shop_name   = (body.get('shopName')   or '').strip()
    description = (body.get('description') or '').strip()
    category    = (body.get('category')   or '').strip()
    location    = (body.get('location')   or '').strip()

    if not shop_name:
        return error('Le nom de la boutique est requis')
    if not location:
        return error('La localisation est requise')

    vendor_id = f'v{user.id}'
    if db.session.get(Vendor, vendor_id):
        vendor_id = f'v{user.id}x'

    vendor = Vendor(
        id=vendor_id,
        name=shop_name,
        description=description or f'Boutique {shop_name} sur AfroMarket',
        avatar=user.avatar,
        banner='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
        rating=0, reviews=0, products_count=0,
        location=location,
        verified=False,
        join_date=datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        categories=json.dumps([category] if category else []),
        phone=user.phone,
    )
    db.session.add(vendor)

    user.role      = 'vendor'
    user.vendor_id = vendor_id
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return ok({'token': token, 'user': user.to_dict()}, 201)


@app.patch('/api/users/me')
@jwt_required()
def update_me():
    user = get_user(get_jwt_identity())
    if not user:
        return error('Utilisateur non trouvé', 404)
    body    = request.get_json() or {}
    name    = (body.get('name') or '').strip()
    phone   = (body.get('phone') or '').strip() or None
    avatar  = (body.get('avatar') or '').strip() or None
    address = (body.get('address') or '').strip() or None
    if name:
        user.name = name
    user.phone   = phone
    user.address = address
    if avatar:
        user.avatar = avatar
    db.session.commit()
    return ok(user.to_dict())


@app.patch('/api/vendor/settings')
@jwt_required()
def update_vendor_settings():
    user = get_user(get_jwt_identity())
    if not user or user.role != 'vendor':
        return error('Accès refusé', 403)
    vendor = db.session.get(Vendor, user.vendor_id)
    if not vendor:
        return error('Boutique non trouvée', 404)
    body = request.get_json() or {}
    if body.get('name', '').strip():
        vendor.name = body['name'].strip()
    if 'description' in body:
        vendor.description = (body['description'] or '').strip()
    if 'location' in body and body['location'].strip():
        vendor.location = body['location'].strip()
    if 'phone' in body:
        vendor.phone = (body['phone'] or '').strip() or None
        user.phone   = vendor.phone
    if 'avatar' in body and body['avatar'].strip():
        vendor.avatar = body['avatar'].strip()
        user.avatar   = vendor.avatar
    if 'banner' in body and body['banner'].strip():
        vendor.banner = body['banner'].strip()
    db.session.commit()
    return ok(vendor.to_dict())


@app.patch('/api/users/me/password')
@jwt_required()
def update_password():
    user = get_user(get_jwt_identity())
    if not user:
        return error('Utilisateur non trouvé', 404)
    body         = request.get_json() or {}
    current_pw   = body.get('currentPassword') or ''
    new_pw       = body.get('newPassword') or ''

    if not check_password_hash(user.password_hash, current_pw):
        return error('Mot de passe actuel incorrect', 401)
    if len(new_pw) < 8:
        return error('Le nouveau mot de passe doit contenir au moins 8 caractères')

    user.password_hash = generate_password_hash(new_pw)
    db.session.commit()
    return ok({'message': 'Mot de passe mis à jour'})


# ─── Orders ─────────────────────────────────────────────────────────────────

@app.post('/api/orders')
@jwt_required()
def create_order():
    user_id = int(get_jwt_identity())
    body    = request.get_json()
    items   = body.get('items', [])
    if not items:
        return error('Le panier est vide')

    # Valider le stock avant toute écriture
    for i in items:
        p = db.session.get(Product, i['productId'])
        if not p:
            return error(f'Produit "{i.get("productName", i["productId"])}" introuvable', 404)
        if p.stock < i['quantity']:
            return error(
                f'Stock insuffisant pour "{p.name}" — disponible : {p.stock}, demandé : {i["quantity"]}'
            )

    total = sum(i['price'] * i['quantity'] for i in items) + 5000

    order = Order(
        user_id=user_id, total=total,
        shipping_address=json.dumps(body.get('address', {})),
        payment_method=body.get('paymentMethod', 'card'),
    )
    db.session.add(order)
    db.session.flush()

    for i in items:
        db.session.add(OrderItem(
            order_id=order.id,
            product_id=i['productId'], product_name=i['productName'],
            quantity=i['quantity'], price=i['price'],
            image=i.get('image', ''),
        ))

    # Décrémenter le stock
    for i in items:
        p = db.session.get(Product, i['productId'])
        if p:
            p.stock = max(0, p.stock - i['quantity'])

    # Notifier le client
    notify(user_id, 'order', 'Commande confirmée',
           f'Votre commande a bien été enregistrée — {len(items)} article(s) pour {total:,.0f} FCFA.')

    # Notifier chaque vendeur concerné
    vendor_ids = set()
    for i in items:
        p = db.session.get(Product, i['productId'])
        if p:
            v_user = User.query.filter_by(vendor_id=p.vendor_id, role='vendor').first()
            if v_user and v_user.id not in vendor_ids:
                vendor_ids.add(v_user.id)
                notify(v_user.id, 'order', 'Nouvelle commande reçue',
                       f'Vous avez reçu une nouvelle commande contenant vos produits.')

    db.session.commit()
    return ok(order.to_dict(), 201)


@app.get('/api/orders')
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    orders  = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return ok([o.to_dict() for o in orders])


@app.patch('/api/orders/<int:order_id>/cancel')
@jwt_required()
def cancel_order(order_id):
    user_id = int(get_jwt_identity())
    order   = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return error('Commande non trouvée', 404)
    if order.status != 'pending':
        return error('Seules les commandes en attente peuvent être annulées')
    # Restaurer le stock
    for item in order.items:
        p = db.session.get(Product, item.product_id)
        if p:
            p.stock += item.quantity
    order.status = 'cancelled'
    notify(user_id, 'status',
           f'Commande {order.to_dict()["id"]} annulée',
           'Votre commande a été annulée et le stock remis à disposition.')
    db.session.commit()
    return ok(order.to_dict())


# ─── Wishlist ─────────────────────────────────────────────────────────────────

@app.get('/api/wishlist')
@jwt_required()
def get_wishlist():
    user_id  = int(get_jwt_identity())
    entries  = Wishlist.query.filter_by(user_id=user_id).all()
    pids     = [w.product_id for w in entries]
    if not pids:
        return ok([])
    products = Product.query.filter(Product.id.in_(pids)).all()
    return ok([p.to_dict() for p in products])


@app.post('/api/wishlist/toggle')
@jwt_required()
def toggle_wishlist():
    user_id    = int(get_jwt_identity())
    product_id = (request.get_json() or {}).get('productId', '').strip()
    if not product_id:
        return error('productId requis')
    existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return ok({'action': 'removed', 'inWishlist': False})
    if not db.session.get(Product, product_id):
        return error('Produit non trouvé', 404)
    db.session.add(Wishlist(user_id=user_id, product_id=product_id))
    db.session.commit()
    return ok({'action': 'added', 'inWishlist': True})


# ─── Vendor ──────────────────────────────────────────────────────────────────

def require_vendor():
    user = get_user(get_jwt_identity())
    if not user or user.role not in ('vendor', 'admin'):
        return None, error('Accès réservé aux vendeurs', 403)
    return user, None


@app.get('/api/vendor/stats')
@jwt_required()
def vendor_stats():
    user, err = require_vendor()
    if err: return err
    if not user.vendor_id:
        return error('Aucun profil vendeur associé', 404)

    products    = Product.query.filter_by(vendor_id=user.vendor_id).all()
    product_ids = [p.id for p in products]

    vendor_items = OrderItem.query.filter(OrderItem.product_id.in_(product_ids)).all()
    order_ids    = list({item.order_id for item in vendor_items})
    revenue      = sum(item.price * item.quantity for item in vendor_items)
    avg_rating   = round(sum(p.rating for p in products) / len(products), 1) if products else 0

    return ok({
        'totalProducts': len(products),
        'totalOrders':   len(order_ids),
        'totalRevenue':  revenue,
        'averageRating': avg_rating,
    })


@app.get('/api/vendor/orders')
@jwt_required()
def vendor_orders():
    user, err = require_vendor()
    if err: return err
    if not user.vendor_id:
        return error('Aucun profil vendeur associé', 404)

    products    = Product.query.filter_by(vendor_id=user.vendor_id).all()
    product_ids = {p.id for p in products}

    vendor_items = OrderItem.query.filter(OrderItem.product_id.in_(list(product_ids))).all()
    order_ids    = list({item.order_id for item in vendor_items})
    orders       = Order.query.filter(Order.id.in_(order_ids)).order_by(Order.created_at.desc()).all()

    result = []
    for o in orders:
        data   = o.to_dict()
        buyer  = db.session.get(User, o.user_id)
        data['customer']      = buyer.name  if buyer else 'Inconnu'
        data['customerEmail'] = buyer.email if buyer else ''
        data['items']         = [i.to_dict() for i in o.items if i.product_id in product_ids]
        result.append(data)
    return ok(result)


@app.get('/api/vendor/products')
@jwt_required()
def vendor_products():
    user, err = require_vendor()
    if err: return err
    if not user.vendor_id:
        return error('Aucun profil vendeur associé', 404)

    products = Product.query.filter_by(vendor_id=user.vendor_id).all()
    return ok([p.to_dict() for p in products])


@app.post('/api/vendor/products')
@jwt_required()
def vendor_add_product():
    user, err = require_vendor()
    if err: return err
    if not user.vendor_id:
        return error('Aucun profil vendeur associé', 404)

    body  = request.get_json() or {}
    name  = (body.get('name') or '').strip()
    price = body.get('price')

    if not name:
        return error('Le nom du produit est requis')
    try:
        price = float(price)
        if price <= 0: raise ValueError
    except (TypeError, ValueError):
        return error('Prix invalide')

    vendor     = db.session.get(Vendor, user.vendor_id)
    import time as _time
    product_id = f"p{user.vendor_id}{int(_time.time())}"

    product = Product(
        id=product_id,
        name=name,
        description=body.get('description', ''),
        price=price,
        original_price=float(body['originalPrice']) if body.get('originalPrice') else None,
        image=body.get('image') or 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
        category=body.get('category', ''),
        vendor_id=user.vendor_id,
        vendor_name=vendor.name    if vendor else '',
        vendor_avatar=vendor.avatar if vendor else '',
        stock=int(body.get('stock', 0)),
        tags=json.dumps(body.get('tags', [])),
        images=json.dumps(body.get('images', [])),
        featured=False,
    )
    db.session.add(product)

    if vendor:
        vendor.products_count = Product.query.filter_by(vendor_id=user.vendor_id).count() + 1

    db.session.commit()
    return ok(product.to_dict(), 201)


@app.put('/api/vendor/products/<product_id>')
@jwt_required()
def vendor_update_product(product_id):
    user, err = require_vendor()
    if err: return err

    product = db.session.get(Product, product_id)
    if not product:
        return error('Produit non trouvé', 404)
    if product.vendor_id != user.vendor_id:
        return error('Ce produit ne vous appartient pas', 403)

    body = request.get_json() or {}
    if body.get('name'):          product.name           = body['name'].strip()
    if 'description' in body:     product.description    = body['description']
    if body.get('price'):         product.price          = float(body['price'])
    if 'originalPrice' in body:   product.original_price = float(body['originalPrice']) if body['originalPrice'] else None
    if body.get('image'):         product.image          = body['image']
    if body.get('category'):      product.category       = body['category']
    if 'stock' in body:           product.stock          = int(body['stock'])
    if 'tags' in body:            product.tags           = json.dumps(body['tags'])
    if 'images' in body:          product.images         = json.dumps(body['images'])

    db.session.commit()
    return ok(product.to_dict())


@app.delete('/api/vendor/products/<product_id>')
@jwt_required()
def vendor_delete_product(product_id):
    user, err = require_vendor()
    if err: return err

    product = db.session.get(Product, product_id)
    if not product:
        return error('Produit non trouvé', 404)
    if product.vendor_id != user.vendor_id:
        return error('Ce produit ne vous appartient pas', 403)

    db.session.delete(product)

    vendor = db.session.get(Vendor, user.vendor_id)
    if vendor:
        vendor.products_count = max(0, Product.query.filter_by(vendor_id=user.vendor_id).count() - 1)

    db.session.commit()
    return ok({'message': 'Produit supprimé'})


# ─── Notifications ───────────────────────────────────────────────────────────

@app.get('/api/notifications')
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs  = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return ok([n.to_dict() for n in notifs])


@app.get('/api/notifications/unread-count')
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count   = Notification.query.filter_by(user_id=user_id, read=False).count()
    return ok({'count': count})


@app.patch('/api/notifications/read-all')
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, read=False).update({'read': True})
    db.session.commit()
    return ok({'message': 'Toutes les notifications marquées comme lues'})


@app.patch('/api/notifications/<int:notif_id>/read')
@jwt_required()
def mark_one_read(notif_id):
    user_id = int(get_jwt_identity())
    notif   = db.session.get(Notification, notif_id)
    if not notif or notif.user_id != user_id:
        return error('Notification non trouvée', 404)
    notif.read = True
    db.session.commit()
    return ok(notif.to_dict())


# ─── Admin ───────────────────────────────────────────────────────────────────

def require_admin():
    user = get_user(get_jwt_identity())
    if not user or user.role != 'admin':
        return None, error('Accès réservé aux administrateurs', 403)
    return user, None


@app.post('/api/admin/categories')
@jwt_required()
def admin_add_category():
    _, err = require_admin()
    if err: return err
    body = request.get_json() or {}
    name = body.get('name', '').strip()
    icon = (body.get('icon') or '🛍️').strip() or '🛍️'
    if not name:
        return error('Le nom est requis')
    if Category.query.filter_by(name=name).first():
        return error('Cette catégorie existe déjà')
    cat = Category(name=name, icon=icon)
    db.session.add(cat)
    db.session.commit()
    return ok(cat.to_dict(), 201)


@app.delete('/api/admin/categories/<int:cat_id>')
@jwt_required()
def admin_delete_category(cat_id):
    _, err = require_admin()
    if err: return err
    cat = db.session.get(Category, cat_id)
    if not cat:
        return error('Catégorie non trouvée', 404)
    db.session.delete(cat)
    db.session.commit()
    return ok({'message': 'Catégorie supprimée'})


@app.get('/api/admin/stats')
@jwt_required()
def admin_stats():
    _, err = require_admin()
    if err:
        return err
    return ok({
        'totalRevenue':  db.session.query(db.func.sum(Order.total)).scalar() or 0,
        'totalOrders':   Order.query.count(),
        'totalProducts': Product.query.count(),
        'totalVendors':  Vendor.query.count(),
        'totalUsers':    User.query.filter_by(role='customer').count(),
    })


@app.get('/api/admin/orders')
@jwt_required()
def admin_orders():
    _, err = require_admin()
    if err:
        return err

    result = []
    for o in Order.query.order_by(Order.created_at.desc()).all():
        data = o.to_dict()
        user = db.session.get(User, o.user_id)
        data['customer']      = user.name  if user else 'Inconnu'
        data['customerEmail'] = user.email if user else ''
        result.append(data)
    return ok(result)


@app.get('/api/admin/users')
@jwt_required()
def admin_users():
    _, err = require_admin()
    if err:
        return err
    return ok([u.to_dict() for u in User.query.order_by(User.created_at.desc()).all()])


@app.post('/api/admin/products')
@jwt_required()
def admin_add_product():
    _, err = require_admin()
    if err: return err

    body  = request.get_json() or {}
    name  = (body.get('name') or '').strip()
    price = body.get('price')
    if not name:
        return error('Le nom est requis')
    try:
        price = float(price)
        if price <= 0: raise ValueError
    except (TypeError, ValueError):
        return error('Prix invalide')

    vendor_id = body.get('vendorId') or ''
    vendor    = db.session.get(Vendor, vendor_id) if vendor_id else None
    import time as _time
    product = Product(
        id=f"pa{int(_time.time())}",
        name=name,
        description=body.get('description', ''),
        price=price,
        original_price=float(body['originalPrice']) if body.get('originalPrice') else None,
        image=body.get('image') or 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
        category=body.get('category', ''),
        vendor_id=vendor_id or None,
        vendor_name=vendor.name    if vendor else body.get('vendorName', ''),
        vendor_avatar=vendor.avatar if vendor else '',
        stock=int(body.get('stock', 0)),
        tags=json.dumps(body.get('tags', [])),
        featured=bool(body.get('featured', False)),
    )
    db.session.add(product)
    if vendor:
        vendor.products_count = Product.query.filter_by(vendor_id=vendor_id).count() + 1
    db.session.commit()
    return ok(product.to_dict(), 201)


@app.put('/api/admin/products/<product_id>')
@jwt_required()
def admin_update_product(product_id):
    _, err = require_admin()
    if err: return err

    product = db.session.get(Product, product_id)
    if not product:
        return error('Produit non trouvé', 404)

    body = request.get_json() or {}
    if body.get('name'):         product.name           = body['name'].strip()
    if 'description' in body:    product.description    = body['description']
    if body.get('price'):        product.price          = float(body['price'])
    if 'originalPrice' in body:  product.original_price = float(body['originalPrice']) if body['originalPrice'] else None
    if body.get('image'):        product.image          = body['image']
    if body.get('category'):     product.category       = body['category']
    if 'stock' in body:          product.stock          = int(body['stock'])
    if 'featured' in body:       product.featured       = bool(body['featured'])
    db.session.commit()
    return ok(product.to_dict())


@app.delete('/api/admin/products/<product_id>')
@jwt_required()
def admin_delete_product(product_id):
    _, err = require_admin()
    if err: return err

    product = db.session.get(Product, product_id)
    if not product:
        return error('Produit non trouvé', 404)

    vendor = db.session.get(Vendor, product.vendor_id) if product.vendor_id else None
    db.session.delete(product)
    if vendor:
        vendor.products_count = max(0, Product.query.filter_by(vendor_id=vendor.id).count() - 1)
    db.session.commit()
    return ok({'message': 'Produit supprimé'})


@app.patch('/api/admin/vendors/<vendor_id>/verify')
@jwt_required()
def admin_verify_vendor(vendor_id):
    _, err = require_admin()
    if err: return err

    vendor = db.session.get(Vendor, vendor_id)
    if not vendor:
        return error('Vendeur non trouvé', 404)

    vendor.verified = not vendor.verified
    db.session.commit()
    return ok(vendor.to_dict())


# Accepte "ORD-0001" ou "1" comme order_id
@app.patch('/api/admin/orders/<order_id>/status')
@jwt_required()
def update_order_status(order_id):
    _, err = require_admin()
    if err:
        return err

    try:
        numeric_id = int(order_id.split('-')[-1]) if '-' in str(order_id) else int(order_id)
    except ValueError:
        return error('ID de commande invalide')

    order = db.session.get(Order, numeric_id)
    if not order:
        return error('Commande non trouvée', 404)

    new_status = (request.get_json() or {}).get('status')
    allowed = {'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'}
    if new_status not in allowed:
        return error(f'Statut invalide. Valeurs : {", ".join(allowed)}')

    order.status = new_status
    status_msgs = {
        'confirmed':  'Votre commande a été confirmée par le vendeur.',
        'shipped':    'Votre commande est en route !',
        'delivered':  'Votre commande a été livrée. Bonne réception !',
        'cancelled':  'Votre commande a été annulée.',
    }
    if new_status in status_msgs:
        notify(order.user_id, 'status',
               f'Commande {order.to_dict()["id"]} — {STATUS_LABELS.get(new_status, new_status)}',
               status_msgs[new_status])
    db.session.commit()
    return ok(order.to_dict())


# ─── Conversations / Messages ─────────────────────────────────────────────────

@app.get('/api/conversations')
@jwt_required()
def list_conversations():
    uid  = int(get_jwt_identity())
    user = get_user(uid)
    if not user: return error('Non autorisé', 401)

    if user.vendor_id:
        convs = Conversation.query.filter_by(vendor_id=user.vendor_id)\
            .order_by(Conversation.updated_at.desc()).all()
    else:
        convs = Conversation.query.filter_by(buyer_id=uid)\
            .order_by(Conversation.updated_at.desc()).all()

    return ok([c.to_dict(current_user_id=uid) for c in convs])


@app.post('/api/conversations')
@jwt_required()
def start_conversation():
    uid       = int(get_jwt_identity())
    body      = request.get_json() or {}
    vendor_id = (body.get('vendorId') or '').strip()
    product_id = body.get('productId')

    vendor = db.session.get(Vendor, vendor_id)
    if not vendor: return error('Vendeur non trouvé', 404)

    conv = Conversation.query.filter_by(buyer_id=uid, vendor_id=vendor_id).first()
    if not conv:
        conv = Conversation(buyer_id=uid, vendor_id=vendor_id, product_id=product_id)
        db.session.add(conv)
        db.session.commit()

    return ok(conv.to_dict(current_user_id=uid))


@app.get('/api/conversations/<int:conv_id>/messages')
@jwt_required()
def get_messages(conv_id):
    uid  = int(get_jwt_identity())
    user = get_user(uid)
    conv = db.session.get(Conversation, conv_id)
    if not conv: return error('Conversation non trouvée', 404)

    is_buyer  = conv.buyer_id == uid
    is_vendor = user.vendor_id and user.vendor_id == conv.vendor_id
    if not (is_buyer or is_vendor):
        return error('Accès refusé', 403)

    msgs = Message.query.filter_by(conversation_id=conv_id)\
        .order_by(Message.created_at).all()

    for m in msgs:
        if m.sender_id != uid and not m.read:
            m.read = True
    db.session.commit()

    return ok([m.to_dict() for m in msgs])


@app.post('/api/conversations/<int:conv_id>/messages')
@jwt_required()
def send_message(conv_id):
    uid  = int(get_jwt_identity())
    user = get_user(uid)
    conv = db.session.get(Conversation, conv_id)
    if not conv: return error('Conversation non trouvée', 404)

    is_buyer  = conv.buyer_id == uid
    is_vendor = user.vendor_id and user.vendor_id == conv.vendor_id
    if not (is_buyer or is_vendor):
        return error('Accès refusé', 403)

    content = (request.get_json() or {}).get('content', '').strip()
    if not content: return error('Message vide')

    msg = Message(conversation_id=conv_id, sender_id=uid, content=content)
    db.session.add(msg)
    conv.updated_at = datetime.now(timezone.utc)

    if is_buyer:
        vendor_owner = User.query.filter_by(vendor_id=conv.vendor_id).first()
        if vendor_owner:
            notify(vendor_owner.id, 'promo', 'Nouveau message',
                   f'{user.name} vous a envoyé un message')
    else:
        vendor = db.session.get(Vendor, conv.vendor_id)
        notify(conv.buyer_id, 'promo', 'Nouveau message',
               f'{vendor.name if vendor else "Le vendeur"} vous a répondu')

    db.session.commit()
    return ok(msg.to_dict(), 201)


@app.get('/api/messages/unread-count')
@jwt_required()
def messages_unread_count():
    uid  = int(get_jwt_identity())
    user = get_user(uid)
    if not user: return error('Non autorisé', 401)

    if user.vendor_id:
        conv_ids = [c.id for c in Conversation.query.filter_by(vendor_id=user.vendor_id).all()]
    else:
        conv_ids = [c.id for c in Conversation.query.filter_by(buyer_id=uid).all()]

    count = 0
    if conv_ids:
        count = Message.query.filter(
            Message.conversation_id.in_(conv_ids),
            Message.sender_id != uid,
            Message.read == False  # noqa: E712
        ).count()

    return ok({'count': count})


# ─── Lancement ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Migrations colonnes manquantes
        migrations = [
            'ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone VARCHAR(30)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(300)',
            'ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT',
            '''CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                token VARCHAR(100) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE
            )''',
            '''CREATE TABLE IF NOT EXISTS vendor_reviews (
                id SERIAL PRIMARY KEY,
                vendor_id VARCHAR(20) REFERENCES vendors(id),
                user_id INTEGER REFERENCES users(id),
                rating INTEGER NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(vendor_id, user_id)
            )''',
            '''CREATE TABLE IF NOT EXISTS wishlists (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                product_id VARCHAR(20) REFERENCES products(id),
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, product_id)
            )''',
        ]
        try:
            with db.engine.connect() as conn:
                for sql in migrations:
                    conn.execute(db.text(sql))
                conn.commit()
        except Exception:
            pass
    app.run(
        debug=os.getenv('FLASK_DEBUG', '1') == '1',
        port=int(os.getenv('PORT', 5000)),
    )
