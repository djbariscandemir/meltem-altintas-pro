# Meltem Altıntaş Pro

Ekip bazlı, oyun hissi olan profesyonel emlak CRM sistemi - React ile geliştirilmiş modern frontend.

## 🎯 Özellikler

### 1. Kullanıcı & Giriş Sistemi
- Kullanıcı adı/email ve şifre ile giriş
- "Beni Hatırla" özelliği
- Parola sıfırlama (UI hazır)
- Rol bazlı erişim (Broker / Danışman)

### 2. Bildirim Sistemi
- Uygulama içi bildirimler
- Arama görevleri hatırlatıcıları
- Doğum günü bildirimleri
- Geciken görev uyarıları
- E-mail ve WhatsApp altyapısı hazır

### 3. Doğum Günü Hatırlatıcı
- Kullanıcının doğum gününde kendisine bildirim
- Diğer danışmanlara bilgilendirme
- Broker'a özel uyarı
- Yaş bilgisi gizli, sadece gün gösterilir

### 4. Arama Görev Sistemi (Oyun Matematiği)
İlan sisteme girdiğinde otomatik görevler oluşur:
- 1. gün araması
- 3. gün araması
- Sondan 1 gün önce araması
- Son gün araması

Her görev için:
- `dueDate` - Son tarih
- `isCalled` - Tamamlanma durumu
- `calledAt` - Tamamlanma zamanı
- `calledBy` - Kim tamamladı

### 5. Not & Aktivite Gizliliği
- Danışmanlar SADECE kendi notlarını görür
- Broker/Admin tüm notları ve aktiviteleri görür
- Kim baktı / aradı / not yazdı loglanır
- Özel notlar (sadece yazan görebilir)

### 6. Alıcı Talepleri
- Talep başlığı
- Lokasyon
- Fiyat aralığı
- Oda / m²
- Notlar
- Talebi giren danışman
- Aktif / pasif durumu

### 7. Özel Stok / Manuel İlanlar
Her danışman özel stok ilanı girebilir:
- İlan adı
- Lokasyon
- Oda / m²
- Fiyat
- Fotoğraflar (URL)
- Açıklama
- Müteahhit adı
- Komisyon oranı (%)
- Notlar

### 8. Görünüm Modları
- **Oyun Modu**: Tinder benzeri kart akışı
- **Liste Modu**: Klasik kart/liste görünümü
- Mod seçimi localStorage'da saklanır

## 🚀 Kurulum

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 👤 Demo Hesaplar

**Broker:**
- Kullanıcı adı: `meltem` / Şifre: `123456`

**Danışmanlar:**
- Kullanıcı adı: `ahmet` / Şifre: `123456`
- Kullanıcı adı: `ayse` / Şifre: `123456`

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Login/              # Giriş ekranı
│   ├── Dashboard/          # Ana dashboard
│   ├── Listings/           # İlan görünümleri
│   ├── Tasks/              # Arama görevleri
│   ├── BuyerRequests/      # Alıcı talepleri
│   ├── CustomStock/        # Özel stok ilanları
│   └── Profile/            # Kullanıcı profili
├── data/
│   └── mockData.js         # Mock veriler
├── utils/
│   └── storage.js          # LocalStorage utilities
├── App.jsx                 # Ana uygulama
└── main.jsx                # Entry point
```

## 🎨 Teknik Özellikler

- **React 18** - Modern React hooks
- **Vite** - Hızlı build tool
- **LocalStorage** - Veri saklama
- **Mobil Öncelikli** - Responsive tasarım
- **Component Bazlı** - Modüler yapı
- **Mock Data** - Backend entegrasyonu hazır

## 📱 Kullanım

1. **Giriş Yap**: Demo hesaplardan biriyle giriş yapın
2. **İlanları İncele**: Oyun modu veya liste modunda ilanları görüntüleyin
3. **Görevleri Takip Et**: Arama görevlerini görüntüleyip tamamlayın
4. **Alıcı Talepleri**: Yeni alıcı talepleri oluşturun
5. **Özel Stok**: Kendi özel stok ilanlarınızı ekleyin
6. **Notlar**: İlanlara not ekleyin (özel veya genel)

## 🔐 Rol Bazlı Özellikler

### Danışman
- Sadece kendi notlarını görür
- Sadece kendi aktivitelerini görür
- Özel stok ekleyebilir
- Alıcı talebi oluşturabilir

### Broker
- Tüm notları görür
- Tüm aktiviteleri görür
- Tüm kullanıcı aktivitelerini takip edebilir
- Doğum günü bildirimleri alır

## 🎮 Oyun Hissi

- Renkli görev kartları
- İlerleme göstergeleri
- Başarı rozetleri
- Geciken görev uyarıları
- Tamamlanan görev görsel geri bildirimleri

## 📝 Notlar

- Şu an mock data ile çalışıyor
- Backend entegrasyonu için hazır
- LocalStorage ile veri saklanıyor
- Responsive tasarım (mobil öncelikli)

## 🚧 İleride Eklenecek

- Backend API entegrasyonu
- E-mail bildirimleri
- WhatsApp entegrasyonu
- İstatistikler ve raporlar
- Gelişmiş filtreleme
