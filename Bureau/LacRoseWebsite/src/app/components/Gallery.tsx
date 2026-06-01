import { memo, useState, useEffect } from 'react';
import img3 from '../../imports/image-3.png';
import img4 from '../../imports/image-4.png';
import img5 from '../../imports/image-5.png';
import img7 from '../../imports/image-7.png';
import img8 from '../../imports/image-8.png';
import img9 from '../../imports/image-9.png';
import img10 from '../../imports/image-10.png';
import img11 from '../../imports/image-11.png';
import img12 from '../../imports/image-12.png';
import img13 from '../../imports/image-13.png';
import img14 from '../../imports/image-14.png';
import img15 from '../../imports/image-15.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from '../context/LanguageContext';

const images = [
  { id: 1,  src: img3,  category: 'quad' },
  { id: 2,  src: img4,  category: 'dromadaire' },
  { id: 3,  src: img5,  category: 'pirogue' },
  { id: 4,  src: img7,  category: 'quad' },
  { id: 5,  src: img8,  category: 'dromadaire' },
  { id: 6,  src: img9,  category: 'cheval' },
  { id: 7,  src: img10, category: 'cheval' },
  { id: 8,  src: img11, category: 'quad' },
  { id: 9,  src: img12, category: 'quad' },
  { id: 10, src: img13, category: 'quad' },
  { id: 11, src: img14, category: 'cheval' },
  { id: 12, src: img15, category: 'cheval' },
];

function GalleryComponent() {
  const { tr } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const onHashChange = () => {
      const cat = new URLSearchParams(window.location.search).get('cat');
      if (cat) setSelectedCategory(cat);
    };
    onHashChange();
    window.addEventListener('popstate', onHashChange);
    return () => window.removeEventListener('popstate', onHashChange);
  }, []);

  const categories = [
    { id: 'all',       name: tr.gallery.all },
    { id: 'quad',      name: tr.gallery.quad },
    { id: 'cheval',    name: tr.gallery.cheval },
    { id: 'dromadaire',name: tr.gallery.dromadaire },
    { id: 'pirogue',   name: tr.gallery.pirogue },
  ];

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category === selectedCategory);

  return (
    <section id="galerie" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-pink-100 text-[#ff2d7a] px-4 py-2 rounded-full text-sm font-medium mb-4">
            {tr.gallery.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{tr.gallery.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tr.gallery.subtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#ff2d7a] to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <ImageWithFallback
                src={image.src}
                alt={categories.find(c => c.id === image.category)?.name ?? ''}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-medium text-lg">
                    {categories.find(c => c.id === image.category)?.name ?? ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Gallery = memo(GalleryComponent);
