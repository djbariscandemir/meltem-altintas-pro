# Supabase Entegrasyonu

Bu proje artık **Supabase** kullanıyor. localStorage yerine tüm veriler Supabase'de kalıcı olarak saklanıyor.

## Kurulum

### 1. Supabase Projesi Oluştur

1. [Supabase](https://supabase.com) sitesine gidin
2. Yeni bir proje oluşturun
3. Proje URL ve Anon Key'i kopyalayın

### 2. Environment Variables

Proje root'unda `.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=https://akidlfqugftljfuhnjxn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Supabase Anon Key Nasıl Bulunur?**
1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenizi seçin
2. **Settings** → **API**
3. **anon / public** key'i kopyalayın → `.env` dosyasına yapıştırın

**NOT:** `.env` dosyası `.gitignore`'da olduğu için manuel olarak oluşturmanız gerekiyor.

### 3. Database Migration

`supabase-migration.sql` dosyasını Supabase SQL Editor'de çalıştırın:

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `supabase-migration.sql` dosyasının içeriğini yapıştırın
4. "Run" butonuna tıklayın

Bu migration şunları oluşturur:
- `listings` tablosu
- `imports` tablosu
- Index'ler
- RLS politikaları
- Trigger'lar

### 4. Paketleri Yükle

```bash
npm install
```

## Kullanım

### Excel Import

Excel dosyası yüklendiğinde:
1. Veriler parse edilir
2. `imports` tablosuna kayıt eklenir
3. `listings` tablosuna ilanlar eklenir/güncellenir
4. Veriler Supabase'de kalıcı olarak saklanır

### Veri Yükleme

Uygulama açıldığında:
1. `listings` tablosundan tüm ilanlar çekilir
2. Veriler uygulama formatına çevrilir
3. State'e yüklenir

### Import Yönetimi

"Excel'ler" sayfasından:
- Tüm Excel import'larını görüntüleyebilirsiniz
- Bir import'u silebilirsiniz (CASCADE - ilanlar da silinir)

## Veri Yapısı

### listings Tablosu

- `id` (UUID) - Primary key
- `revy_id` (TEXT) - Unique, Excel'den gelen ID
- `owner_type` (TEXT) - İlan Sahibi Türü
- `property_group` (TEXT) - Konut/Ticari
- `city`, `district`, `neighborhood` (TEXT) - Konum
- `area` (TEXT) - Semt
- `price` (NUMERIC) - Fiyat (number)
- `listing_date` (DATE) - İlan tarihi
- `import_id` (UUID) - Hangi Excel'den geldi (CASCADE DELETE)

### imports Tablosu

- `id` (UUID) - Primary key
- `file_name` (TEXT) - Excel dosya adı
- `imported_at` (TIMESTAMP) - Yükleme tarihi
- `total_listings` (INTEGER) - Toplam ilan sayısı
- `added_count` (INTEGER) - Yeni eklenen sayısı
- `updated_count` (INTEGER) - Güncellenen sayısı

## CASCADE DELETE

Bir import silindiğinde:
- O import'a ait **tüm listings otomatik silinir**
- Bu `ON DELETE CASCADE` foreign key ile yapılır

## Gelecek Geliştirmeler

- User authentication (Supabase Auth)
- Row Level Security (RLS) politikaları
- Real-time subscriptions
- File storage (Excel dosyaları Supabase Storage'da)
