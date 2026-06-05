from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {'id': str(self.id), 'name': self.name, 'icon': self.icon}


class Vendor(db.Model):
    __tablename__ = 'vendors'
    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    avatar = db.Column(db.String(300))
    banner = db.Column(db.String(300))
    rating = db.Column(db.Float, default=0)
    reviews = db.Column(db.Integer, default=0)
    products_count = db.Column(db.Integer, default=0)
    location = db.Column(db.String(150))
    verified = db.Column(db.Boolean, default=False)
    join_date = db.Column(db.String(20))
    categories = db.Column(db.String(300))  # JSON list stocké en string
    phone = db.Column(db.String(30))
    products = db.relationship('Product', backref='vendor_rel', lazy=True)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'avatar': self.avatar,
            'banner': self.banner,
            'rating': self.rating,
            'reviews': self.reviews,
            'products': self.products_count,
            'location': self.location,
            'verified': self.verified,
            'joinDate': self.join_date,
            'categories': json.loads(self.categories) if self.categories else [],
            'phone': self.phone,
        }


class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    image = db.Column(db.String(300))
    category = db.Column(db.String(100))
    vendor_id = db.Column(db.String(20), db.ForeignKey('vendors.id'))
    vendor_name = db.Column(db.String(150))
    vendor_avatar = db.Column(db.String(300))
    rating = db.Column(db.Float, default=0)
    reviews = db.Column(db.Integer, default=0)
    stock = db.Column(db.Integer, default=0)
    tags = db.Column(db.String(300))  # JSON list
    featured = db.Column(db.Boolean, default=False)

    images = db.Column(db.Text)  # JSON array of image URLs

    def to_dict(self):
        import json
        img_list = json.loads(self.images) if self.images else []
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'originalPrice': self.original_price,
            'image': self.image,
            'images': img_list,
            'category': self.category,
            'vendorId': self.vendor_id,
            'vendorName': self.vendor_name,
            'vendorAvatar': self.vendor_avatar,
            'rating': self.rating,
            'reviews': self.reviews,
            'stock': self.stock,
            'tags': json.loads(self.tags) if self.tags else [],
            'featured': self.featured,
        }


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(30))
    avatar = db.Column(db.String(300))
    address = db.Column(db.String(300))
    role = db.Column(db.String(20), default='customer')  # customer | vendor | admin
    vendor_id = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'avatar': self.avatar,
            'address': self.address,
            'role': self.role,
            'vendorId': self.vendor_id,
        }


class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), default='pending')
    total = db.Column(db.Float, nullable=False)
    shipping_address = db.Column(db.Text)
    payment_method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            'id': f'ORD-{self.id:04d}',
            'date': self.created_at.isoformat(),
            'status': self.status,
            'total': self.total,
            'items': [i.to_dict() for i in self.items],
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type       = db.Column(db.String(30))   # order | status | review | promo
    title      = db.Column(db.String(200))
    message    = db.Column(db.Text)
    read       = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id':      self.id,
            'type':    self.type,
            'title':   self.title,
            'message': self.message,
            'read':    self.read,
            'date':    self.created_at.isoformat(),
        }


class Review(db.Model):
    __tablename__ = 'reviews'
    id         = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(20), db.ForeignKey('products.id'), nullable=False)
    user_id    = db.Column(db.Integer,    db.ForeignKey('users.id'),    nullable=False)
    rating     = db.Column(db.Integer, nullable=False)   # 1 – 5
    comment    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    __table_args__ = (db.UniqueConstraint('product_id', 'user_id', name='uq_review_product_user'),)

    def to_dict(self):
        user = db.session.get(User, self.user_id)
        return {
            'id':         self.id,
            'productId':  self.product_id,
            'userId':     str(self.user_id),
            'userName':   user.name   if user else 'Anonyme',
            'userAvatar': user.avatar if user else None,
            'rating':     self.rating,
            'comment':    self.comment or '',
            'date':       self.created_at.isoformat(),
        }


class Conversation(db.Model):
    __tablename__ = 'conversations'
    id         = db.Column(db.Integer, primary_key=True)
    buyer_id   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vendor_id  = db.Column(db.String(20), db.ForeignKey('vendors.id'), nullable=False)
    product_id = db.Column(db.String(20), db.ForeignKey('products.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    __table_args__ = (db.UniqueConstraint('buyer_id', 'vendor_id', name='uq_conv_buyer_vendor'),)

    def to_dict(self, current_user_id=None):
        from sqlalchemy import desc
        vendor = db.session.get(Vendor, self.vendor_id)
        buyer  = db.session.get(User,   self.buyer_id)
        msgs   = Message.query.filter_by(conversation_id=self.id).order_by(desc(Message.created_at)).all()
        last   = msgs[0] if msgs else None
        unread = sum(1 for m in msgs if not m.read and m.sender_id != current_user_id) if current_user_id else 0
        return {
            'id':            self.id,
            'vendorId':      self.vendor_id,
            'vendorName':    vendor.name   if vendor else '?',
            'vendorAvatar':  vendor.avatar if vendor else '',
            'buyerId':       str(self.buyer_id),
            'buyerName':     buyer.name    if buyer  else '?',
            'buyerAvatar':   buyer.avatar  if buyer  else '',
            'productId':     self.product_id,
            'lastMessage':   last.content  if last   else '',
            'lastMessageAt': last.created_at.isoformat() if last else self.created_at.isoformat(),
            'unread':        unread,
            'updatedAt':     self.updated_at.isoformat(),
        }


class Message(db.Model):
    __tablename__ = 'messages'
    id              = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    sender_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content         = db.Column(db.Text,    nullable=False)
    read            = db.Column(db.Boolean, default=False)
    created_at      = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id':             self.id,
            'conversationId': self.conversation_id,
            'senderId':       str(self.sender_id),
            'content':        self.content,
            'read':           self.read,
            'createdAt':      self.created_at.isoformat(),
        }


class VendorReview(db.Model):
    __tablename__ = 'vendor_reviews'
    id         = db.Column(db.Integer, primary_key=True)
    vendor_id  = db.Column(db.String(20), db.ForeignKey('vendors.id'), nullable=False)
    user_id    = db.Column(db.Integer,    db.ForeignKey('users.id'),    nullable=False)
    rating     = db.Column(db.Integer, nullable=False)
    comment    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    __table_args__ = (db.UniqueConstraint('vendor_id', 'user_id', name='uq_vendor_review_user'),)

    def to_dict(self):
        user = db.session.get(User, self.user_id)
        return {
            'id':         self.id,
            'vendorId':   self.vendor_id,
            'userId':     str(self.user_id),
            'userName':   user.name   if user else 'Anonyme',
            'userAvatar': user.avatar if user else None,
            'rating':     self.rating,
            'comment':    self.comment or '',
            'date':       self.created_at.isoformat(),
        }


class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token      = db.Column(db.String(100), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used       = db.Column(db.Boolean, default=False)


class Wishlist(db.Model):
    __tablename__ = 'wishlists'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.String(20), db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    __table_args__ = (db.UniqueConstraint('user_id', 'product_id', name='uq_wishlist_user_product'),)


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(20))
    product_name = db.Column(db.String(200))
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(300))

    def to_dict(self):
        return {
            'productId': self.product_id,
            'productName': self.product_name,
            'quantity': self.quantity,
            'price': self.price,
            'image': self.image,
        }
