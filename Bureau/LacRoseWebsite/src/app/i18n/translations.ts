export type Language = 'fr' | 'en' | 'ar' | 'zh';

export const LANGUAGES: { code: Language; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English',  flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh', label: '中文',      flag: '🇨🇳', dir: 'ltr' },
];

const t = {
  fr: {
    nav: {
      experiences: 'Expériences', packs: 'Packs', galerie: 'Galerie',
      contact: 'Contact', reserver: 'Réserver',
    },
    hero: {
      badge: 'Des souvenirs inoubliables vous attendent !',
      title1: "Vivez l'aventure au", title2: 'LAC ROSE',
      subtitle: 'Sensation, Nature & Découverte',
      bookNow: 'Réserver maintenant', discover: 'Découvrir les expériences',
      location: 'Localisation', activities: 'Activités', secure: '100% Sécurisées',
      photos: 'Photos', souvenirs: 'Souvenirs inclus', hours: 'Horaires', flexible: 'Flexible',
    },
    packs: {
      badge: 'Nos Tarifs', title: 'Choisissez Votre Expérience',
      subtitle: 'Des formules adaptées à tous vos besoins pour une journée inoubliable',
      popular: 'Populaire', perPerson: 'Prix par personne',
      bookNow: 'Réserver maintenant',
      payment: 'Paiement sécurisé : Wave, Orange Money, Carte Bancaire',
    },
    gallery: {
      badge: 'Nos Moments', title: 'Galerie Photo',
      subtitle: 'Découvrez les souvenirs inoubliables de nos aventuriers',
      all: 'Tout', quad: 'Quad', cheval: 'Cheval', dromadaire: 'Dromadaire', pirogue: 'Pirogue',
    },
    testimonials: {
      badge: 'Témoignages', title: 'Ce Que Disent Nos Clients',
      subtitle: 'Des milliers de visiteurs satisfaits partagent leur expérience',
      satisfied: 'Clients satisfaits', avgRating: 'Note moyenne', recommended: 'Recommandations',
    },
    faq: {
      badge: 'FAQ', title: 'Questions fréquentes',
      subtitle: 'Tout ce que vous devez savoir avant votre visite au Lac Rose',
      items: [
        { q: 'Comment se rendre au Lac Rose depuis Dakar ?', a: 'Le Lac Rose se trouve à environ 35 km au nord-est de Dakar. Vous pouvez y accéder en taxi (30-45 min), en car rapide ou en voiture de location. Nous pouvons organiser un transfert sur demande — contactez-nous par WhatsApp.' },
        { q: 'Les activités sont-elles adaptées aux enfants ?', a: 'Oui ! La balade en dromadaire et la pirogue sont parfaitement adaptées aux enfants dès 5 ans. Le quad est réservé aux adultes et ados de 14 ans et plus.' },
        { q: 'Que faut-il apporter pour la visite ?', a: 'Crème solaire, lunettes de soleil, chapeau, vêtements légers, chaussures fermées pour le quad. Une bouteille d\'eau est conseillée. Tout le matériel de sécurité est fourni.' },
        { q: "Quelle est la politique d'annulation ?", a: 'Annulation gratuite jusqu\'à 48h avant. En dessous, 50% de frais. En cas de météo défavorable : report sans frais ou remboursement complet.' },
        { q: 'Le prix inclut-il l\'équipement de sécurité ?', a: 'Oui, tous nos packs incluent casque, gilet de sauvetage et l\'encadrement par un guide expérimenté.' },
        { q: 'Puis-je réserver pour un groupe ?', a: 'Absolument. Nous accueillons les groupes (anniversaires, team building…) et adaptons les formules selon vos besoins. Contactez-nous pour un devis.' },
      ],
    },
    contact: {
      badge: 'Contactez-nous', title: 'Réservez Dès Maintenant !',
      subtitle: 'Notre équipe est à votre disposition pour organiser votre aventure au Lac Rose',
      phone: 'Téléphone', whatsapp: 'WhatsApp', chatNow: 'Discuter maintenant',
      location: 'Localisation', email: 'Email',
      readyTitle: "Prêt Pour L'Aventure ?",
      readySubtitle: "Contactez-nous dès aujourd'hui pour réserver votre expérience au Lac Rose",
      callNow: 'Appeler maintenant',
    },
    locContact: {
      title: 'Contact & Localisation', name: 'Nom', email: 'Email', message: 'Message',
      namePlaceholder: 'Votre nom', emailPlaceholder: 'Votre email', messagePlaceholder: 'Votre message',
      send: 'Envoyer', thanks: 'Merci pour votre message !',
    },
    footer: {
      description: 'Vivez des expériences inoubliables au cœur du Lac Rose, Dakar.',
      experiences: 'Expériences', informations: 'Informations', newsletter: 'Newsletter',
      newsletterDesc: 'Recevez nos offres spéciales', emailPlaceholder: 'Votre email',
      about: 'À propos', terms: 'Conditions générales', privacy: 'Politique de confidentialité',
      faq: 'FAQ', rights: '© 2026 Lac Rose Adventures. Tous droits réservés.',
      madeWith: 'Fait avec', inSenegal: 'au Sénégal',
    },
    packsPage: { back: 'Retour au site' },
    packsData: [
      {
        name: 'Pack Spécial', subtitle: 'Adrénaline & Liberté',
        features: ['Balade en Quad — 1h', 'Balade en Pirogue — 30mn', 'Balade à Cheval ou Dromadaire — 20mn'],
      },
      {
        name: 'Pack Découverte', subtitle: "L'essentiel du Lac Rose",
        features: ['Balade en Quad — 1h', 'Balade en Pirogue — 30mn', 'Balade à Cheval ou Dromadaire — 20mn', "Déjeuner à l'Hôtel", 'Détente en Piscine (en option)'],
      },
      {
        name: 'Pack Premium', subtitle: "L'expérience complète",
        features: ['Balade en Quad — 1h', 'Balade en Pirogue — 30mn', 'Balade à Cheval ou Dromadaire — 20mn', 'Transport Aller/Retour (en option)', "Déjeuner à l'Hôtel (en option)", 'Détente en Piscine (en option)'],
      },
    ],
  },

  en: {
    nav: {
      experiences: 'Experiences', packs: 'Packages', galerie: 'Gallery',
      contact: 'Contact', reserver: 'Book',
    },
    hero: {
      badge: 'Unforgettable memories await you!',
      title1: 'Live the adventure at', title2: 'PINK LAKE',
      subtitle: 'Thrills, Nature & Discovery',
      bookNow: 'Book now', discover: 'Discover experiences',
      location: 'Location', activities: 'Activities', secure: '100% Safe',
      photos: 'Photos', souvenirs: 'Souvenirs included', hours: 'Hours', flexible: 'Flexible',
    },
    packs: {
      badge: 'Our Rates', title: 'Choose Your Experience',
      subtitle: 'Packages tailored to all your needs for an unforgettable day',
      popular: 'Popular', perPerson: 'Price per person',
      bookNow: 'Book now',
      payment: 'Secure payment: Wave, Orange Money, Bank Card',
    },
    gallery: {
      badge: 'Our Moments', title: 'Photo Gallery',
      subtitle: 'Discover the unforgettable memories of our adventurers',
      all: 'All', quad: 'Quad', cheval: 'Horse', dromadaire: 'Camel', pirogue: 'Pirogue',
    },
    testimonials: {
      badge: 'Testimonials', title: 'What Our Clients Say',
      subtitle: 'Thousands of satisfied visitors share their experience',
      satisfied: 'Satisfied clients', avgRating: 'Average rating', recommended: 'Recommendations',
    },
    faq: {
      badge: 'FAQ', title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know before visiting Pink Lake',
      items: [
        { q: 'How to get to Pink Lake from Dakar?', a: 'Pink Lake is about 35 km northeast of Dakar. You can get there by taxi (30-45 min), rapid bus, or rental car. We can also arrange a transfer on request — contact us via WhatsApp.' },
        { q: 'Are activities suitable for children?', a: 'Yes! Camel rides and pirogue are perfectly suited for children from age 5. Quad biking is reserved for adults and teenagers 14 and older.' },
        { q: 'What should I bring for the visit?', a: 'Sunscreen, sunglasses, hat, light clothing, closed shoes for quad. A water bottle is recommended. All safety equipment is provided.' },
        { q: 'What is the cancellation policy?', a: 'Free cancellation up to 48 hours before. After that, 50% fees apply. In case of bad weather: free rescheduling or full refund.' },
        { q: 'Does the price include safety equipment?', a: 'Yes, all our packages include helmet, life jacket, and supervision by an experienced guide.' },
        { q: 'Can I book for a group?', a: 'Absolutely. We welcome groups (birthdays, team building…) and can adapt packages to your needs. Contact us for a quote.' },
      ],
    },
    contact: {
      badge: 'Contact Us', title: 'Book Now!',
      subtitle: 'Our team is here to organize your adventure at Pink Lake',
      phone: 'Phone', whatsapp: 'WhatsApp', chatNow: 'Chat now',
      location: 'Location', email: 'Email',
      readyTitle: 'Ready for the Adventure?',
      readySubtitle: 'Contact us today to book your experience at Pink Lake',
      callNow: 'Call now',
    },
    locContact: {
      title: 'Contact & Location', name: 'Name', email: 'Email', message: 'Message',
      namePlaceholder: 'Your name', emailPlaceholder: 'Your email', messagePlaceholder: 'Your message',
      send: 'Send', thanks: 'Thank you for your message!',
    },
    footer: {
      description: 'Live unforgettable experiences at the heart of Pink Lake, Dakar.',
      experiences: 'Experiences', informations: 'Information', newsletter: 'Newsletter',
      newsletterDesc: 'Receive our special offers', emailPlaceholder: 'Your email',
      about: 'About us', terms: 'Terms of service', privacy: 'Privacy policy',
      faq: 'FAQ', rights: '© 2026 Lac Rose Adventures. All rights reserved.',
      madeWith: 'Made with', inSenegal: 'in Senegal',
    },
    packsPage: { back: 'Back to site' },
    packsData: [
      {
        name: 'Special Package', subtitle: 'Adrenaline & Freedom',
        features: ['Quad Ride — 1h', 'Pirogue Ride — 30min', 'Horse or Camel Ride — 20min'],
      },
      {
        name: 'Discovery Package', subtitle: 'The Essentials of Pink Lake',
        features: ['Quad Ride — 1h', 'Pirogue Ride — 30min', 'Horse or Camel Ride — 20min', 'Hotel Lunch', 'Pool Relaxation (optional)'],
      },
      {
        name: 'Premium Package', subtitle: 'The Complete Experience',
        features: ['Quad Ride — 1h', 'Pirogue Ride — 30min', 'Horse or Camel Ride — 20min', 'Round-trip Transport (optional)', 'Hotel Lunch (optional)', 'Pool Relaxation (optional)'],
      },
    ],
  },

  ar: {
    nav: {
      experiences: 'التجارب', packs: 'الباقات', galerie: 'المعرض',
      contact: 'اتصل بنا', reserver: 'احجز',
    },
    hero: {
      badge: '!ذكريات لا تُنسى تنتظرك',
      title1: 'عش المغامرة في', title2: 'البحيرة الوردية',
      subtitle: 'إثارة، طبيعة واكتشاف',
      bookNow: 'احجز الآن', discover: 'اكتشف التجارب',
      location: 'الموقع', activities: 'الأنشطة', secure: '100% آمن',
      photos: 'صور', souvenirs: 'ذكريات مشمولة', hours: 'المواعيد', flexible: 'مرن',
    },
    packs: {
      badge: 'أسعارنا', title: 'اختر تجربتك',
      subtitle: 'باقات مصممة لجميع احتياجاتك ليوم لا يُنسى',
      popular: 'الأكثر شعبية', perPerson: 'السعر للشخص',
      bookNow: 'احجز الآن',
      payment: 'دفع آمن: Wave، Orange Money، بطاقة بنكية',
    },
    gallery: {
      badge: 'لحظاتنا', title: 'معرض الصور',
      subtitle: 'اكتشف الذكريات التي لا تُنسى لمغامرينا',
      all: 'الكل', quad: 'الدراجة الرباعية', cheval: 'الخيل', dromadaire: 'الجمل', pirogue: 'القارب',
    },
    testimonials: {
      badge: 'الشهادات', title: 'ما يقوله عملاؤنا',
      subtitle: 'آلاف الزوار الراضين يشاركون تجربتهم',
      satisfied: 'عميل راضٍ', avgRating: 'متوسط التقييم', recommended: 'توصيات',
    },
    faq: {
      badge: 'الأسئلة الشائعة', title: 'الأسئلة المتكررة',
      subtitle: 'كل ما تحتاج معرفته قبل زيارة البحيرة الوردية',
      items: [
        { q: 'كيف تصل إلى البحيرة الوردية من داكار؟', a: 'تقع البحيرة الوردية على بعد 35 كم شمال شرق داكار. يمكنك الوصول بالسيارة الأجرة (30-45 دقيقة) أو الحافلة أو سيارة الإيجار. يمكننا ترتيب نقل بناءً على الطلب.' },
        { q: 'هل الأنشطة مناسبة للأطفال؟', a: 'نعم! ركوب الجمل والقارب مناسبان للأطفال من سن 5 سنوات. ركوب الدراجة الرباعية مخصص للبالغين والمراهقين من 14 سنة فأكثر.' },
        { q: 'ماذا تحضر معك للزيارة؟', a: 'واقي الشمس، نظارات شمسية، قبعة، ملابس خفيفة، أحذية مغلقة للدراجة الرباعية. يُنصح بإحضار زجاجة ماء. يُوفر كل معدات السلامة.' },
        { q: 'ما هي سياسة الإلغاء؟', a: 'إلغاء مجاني حتى 48 ساعة قبل الموعد. بعد ذلك تطبق رسوم 50٪. في حالة سوء الطقس: إعادة جدولة مجانية أو استرداد كامل.' },
        { q: 'هل يشمل السعر معدات السلامة؟', a: 'نعم، تشمل جميع باقاتنا الخوذة وسترة النجاة والإشراف من قِبل مرشد متمرس.' },
        { q: 'هل يمكنني الحجز لمجموعة؟', a: 'بالتأكيد. نستقبل المجموعات (أعياد ميلاد، بناء الفريق...) ونكيّف الباقات حسب احتياجاتك. تواصل معنا للحصول على عرض أسعار.' },
      ],
    },
    contact: {
      badge: 'اتصل بنا', title: 'احجز الآن!',
      subtitle: 'فريقنا في خدمتك لتنظيم مغامرتك في البحيرة الوردية',
      phone: 'هاتف', whatsapp: 'واتساب', chatNow: 'تحدث الآن',
      location: 'الموقع', email: 'البريد الإلكتروني',
      readyTitle: 'هل أنت مستعد للمغامرة؟',
      readySubtitle: 'تواصل معنا اليوم لحجز تجربتك في البحيرة الوردية',
      callNow: 'اتصل الآن',
    },
    locContact: {
      title: 'التواصل والموقع', name: 'الاسم', email: 'البريد الإلكتروني', message: 'الرسالة',
      namePlaceholder: 'اسمك', emailPlaceholder: 'بريدك الإلكتروني', messagePlaceholder: 'رسالتك',
      send: 'إرسال', thanks: 'شكراً على رسالتك!',
    },
    footer: {
      description: 'عش تجارب لا تُنسى في قلب البحيرة الوردية، داكار.',
      experiences: 'التجارب', informations: 'معلومات', newsletter: 'النشرة الإخبارية',
      newsletterDesc: 'احصل على عروضنا الخاصة', emailPlaceholder: 'بريدك الإلكتروني',
      about: 'من نحن', terms: 'شروط الخدمة', privacy: 'سياسة الخصوصية',
      faq: 'الأسئلة الشائعة', rights: '.© 2026 Lac Rose Adventures. جميع الحقوق محفوظة',
      madeWith: 'صُنع بـ', inSenegal: 'في السنغال',
    },
    packsPage: { back: 'العودة إلى الموقع' },
    packsData: [
      {
        name: 'الباقة الخاصة', subtitle: 'الأدرينالين والحرية',
        features: ['جولة دراجة رباعية — 1 ساعة', 'جولة قارب — 30 دقيقة', 'جولة خيل أو جمل — 20 دقيقة'],
      },
      {
        name: 'باقة الاكتشاف', subtitle: 'أساسيات البحيرة الوردية',
        features: ['جولة دراجة رباعية — 1 ساعة', 'جولة قارب — 30 دقيقة', 'جولة خيل أو جمل — 20 دقيقة', 'غداء في الفندق', 'الاسترخاء في المسبح (اختياري)'],
      },
      {
        name: 'الباقة المميزة', subtitle: 'التجربة الكاملة',
        features: ['جولة دراجة رباعية — 1 ساعة', 'جولة قارب — 30 دقيقة', 'جولة خيل أو جمل — 20 دقيقة', 'نقل ذهاب وإياب (اختياري)', 'غداء في الفندق (اختياري)', 'الاسترخاء في المسبح (اختياري)'],
      },
    ],
  },

  zh: {
    nav: {
      experiences: '体验项目', packs: '套餐', galerie: '相册',
      contact: '联系我们', reserver: '预订',
    },
    hero: {
      badge: '难忘的回忆等待着您！',
      title1: '在粉红湖体验冒险', title2: '粉红湖',
      subtitle: '刺激、自然与探索',
      bookNow: '立即预订', discover: '探索体验',
      location: '位置', activities: '活动', secure: '100% 安全',
      photos: '照片', souvenirs: '含纪念品', hours: '开放时间', flexible: '灵活',
    },
    packs: {
      badge: '我们的价格', title: '选择您的体验',
      subtitle: '适合您所有需求的套餐，享受难忘的一天',
      popular: '最受欢迎', perPerson: '每人价格',
      bookNow: '立即预订',
      payment: '安全支付：Wave、Orange Money、银行卡',
    },
    gallery: {
      badge: '精彩瞬间', title: '照片相册',
      subtitle: '探索我们冒险者的难忘回忆',
      all: '全部', quad: '越野车', cheval: '骑马', dromadaire: '骆驼', pirogue: '独木舟',
    },
    testimonials: {
      badge: '客户评价', title: '客户怎么说',
      subtitle: '数千名满意的游客分享他们的体验',
      satisfied: '满意客户', avgRating: '平均评分', recommended: '推荐率',
    },
    faq: {
      badge: '常见问题', title: '常见问题解答',
      subtitle: '访问粉红湖前您需要了解的一切',
      items: [
        { q: '如何从达喀尔前往粉红湖？', a: '粉红湖距达喀尔东北约35公里。您可以乘坐出租车（30-45分钟）、快速巴士或租车前往。我们也可以根据需求安排接送服务，请通过WhatsApp联系我们。' },
        { q: '活动适合儿童参与吗？', a: '是的！骆驼骑行和独木舟非常适合5岁以上的儿童。越野车骑行仅限成人和14岁以上的青少年。' },
        { q: '参观时需要携带什么？', a: '防晒霜、太阳镜、帽子、轻便衣物、骑越野车时需穿封闭式鞋子。建议携带一瓶水。所有安全装备由我们提供。' },
        { q: '取消政策是什么？', a: '预订前48小时内可免费取消。此后将收取50%的费用。如遇恶劣天气：免费改期或全额退款。' },
        { q: '价格包含安全装备吗？', a: '是的，我们所有套餐均包含头盔、救生衣以及经验丰富的向导陪同服务。' },
        { q: '我可以为团体预订吗？', a: '当然可以。我们欢迎团体（生日、团建等）并可根据您的需求调整套餐。请联系我们获取报价。' },
      ],
    },
    contact: {
      badge: '联系我们', title: '立即预订！',
      subtitle: '我们的团队随时为您安排粉红湖之旅',
      phone: '电话', whatsapp: 'WhatsApp', chatNow: '立即聊天',
      location: '位置', email: '电子邮件',
      readyTitle: '准备好冒险了吗？',
      readySubtitle: '今天联系我们预订您的粉红湖体验',
      callNow: '立即致电',
    },
    locContact: {
      title: '联系与位置', name: '姓名', email: '电子邮件', message: '留言',
      namePlaceholder: '您的姓名', emailPlaceholder: '您的电子邮件', messagePlaceholder: '您的留言',
      send: '发送', thanks: '感谢您的留言！',
    },
    footer: {
      description: '在达喀尔粉红湖享受难忘的体验。',
      experiences: '体验项目', informations: '信息', newsletter: '订阅通讯',
      newsletterDesc: '接收我们的特别优惠', emailPlaceholder: '您的邮箱',
      about: '关于我们', terms: '服务条款', privacy: '隐私政策',
      faq: '常见问题', rights: '© 2026 Lac Rose Adventures. 保留所有权利。',
      madeWith: '用', inSenegal: '在塞内加尔制作',
    },
    packsPage: { back: '返回网站' },
    packsData: [
      {
        name: '特别套餐', subtitle: '肾上腺素与自由',
        features: ['越野车骑行 — 1小时', '独木舟骑行 — 30分钟', '骑马或骆驼 — 20分钟'],
      },
      {
        name: '探索套餐', subtitle: '粉红湖精华',
        features: ['越野车骑行 — 1小时', '独木舟骑行 — 30分钟', '骑马或骆驼 — 20分钟', '酒店午餐', '泳池休闲（可选）'],
      },
      {
        name: '高级套餐', subtitle: '完整体验',
        features: ['越野车骑行 — 1小时', '独木舟骑行 — 30分钟', '骑马或骆驼 — 20分钟', '往返交通（可选）', '酒店午餐（可选）', '泳池休闲（可选）'],
      },
    ],
  },
} as const;

export type Translations = typeof t.fr;
export default t;
