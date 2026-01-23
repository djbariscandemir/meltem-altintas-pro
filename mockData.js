// Mock data for listings
export const mockListings = [
  {
    id: '1',
    title: 'Moda\'da Deniz Manzaralı 3+1 Daire',
    price: '2.500.000 TL',
    area: '120 m²',
    rooms: '3+1',
    location: 'Moda, Kadıköy',
    district: 'Moda',
    description: 'Deniz manzaralı, ferah ve güneş alan modern daire. Balkonlu, asansörlü, otoparklı.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    phone: '+905551234567',
    isOpportunity: false,
    note: '',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Caferağa\'da Şirin 2+1',
    price: '1.800.000 TL',
    area: '85 m²',
    rooms: '2+1',
    location: 'Caferağa, Kadıköy',
    district: 'Caferağa',
    description: 'Merkezi konumda, ulaşımı kolay, bakımlı daire.',
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1505843512647-9103c5a00aad?w=800'
    ],
    phone: '+905559876543',
    isOpportunity: true,
    note: '',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Fenerbahçe\'de Lüks 4+1 Villa',
    price: '8.500.000 TL',
    area: '250 m²',
    rooms: '4+1',
    location: 'Fenerbahçe, Kadıköy',
    district: 'Fenerbahçe',
    description: 'Bahçeli, havuzlu, denize sıfır lüks villa. Geniş otopark ve güvenlik.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    phone: '+905551112233',
    isOpportunity: false,
    note: '',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '4',
    title: 'Göztepe\'de Modern 2+1',
    price: '1.950.000 TL',
    area: '95 m²',
    rooms: '2+1',
    location: 'Göztepe, Kadıköy',
    district: 'Göztepe',
    description: 'Yeni yapı, modern mimari, geniş balkonlu.',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    phone: '+905554445566',
    isOpportunity: true,
    note: '',
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '5',
    title: 'Acıbadem\'de Geniş 3+1',
    price: '2.200.000 TL',
    area: '110 m²',
    rooms: '3+1',
    location: 'Acıbadem, Kadıköy',
    district: 'Acıbadem',
    description: 'Güney cepheli, güneş alan, ferah daire.',
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    phone: '+905557778899',
    isOpportunity: false,
    note: '',
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: '6',
    title: 'Moda\'da Tarihi 1+1',
    price: '1.200.000 TL',
    area: '60 m²',
    rooms: '1+1',
    location: 'Moda, Kadıköy',
    district: 'Moda',
    description: 'Tarihi dokusu korunmuş, şirin ve bakımlı daire.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
    ],
    phone: '+905551234567',
    isOpportunity: false,
    note: '',
    createdAt: new Date(Date.now() - 432000000).toISOString()
  }
];
