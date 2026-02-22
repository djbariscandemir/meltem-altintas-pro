# Manuel İlan Ekle – Test Rehberi

## Ön koşullar

1. **Supabase migration'ları** (henüz yapmadıysanız SQL Editor'de çalıştırın):
   - `supabase-revy-listings.sql` → `source`, `external_id` kolonları
   - `supabase-add-parse-status-manual-pending.sql` → `parse_status` için `manual_pending` değeri

2. **Giriş**: Broker veya Admin rolüyle giriş yapmış olun. "İlan Ekle" menüsü sadece bu rollerde görünür.

---

## Adım adım test

### 1. Uygulamayı çalıştırın

```bash
npm run dev
```

Tarayıcıda açılan adrese gidin (genelde http://localhost:5173).

### 2. Giriş yapın

Broker veya admin e-posta ile giriş yapın (ör. `bcdticaret@gmail.com`).

### 3. "İlan Ekle" sayfasına gidin

Sol menüde **İlan Ekle** (PlusCircle ikonu) öğesine tıklayın.

### 4. Revy ilan linki girin

- **Revy ilan linki** alanına geçerli bir Revy **detay** URL'si yapıştırın.
- Örnek format: `https://www.revy.com.tr/app/portfoy/detay/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Gerçek bir ilan için Revy’de ilanı açıp adres çubuğundaki linki kopyalayın.

### 5. İsteğe bağlı: İlk not

- **İlk not** alanına bir şey yazabilirsiniz; ilan kaydına bağlı not olarak saklanır.

### 6. "İlanı Getir"e tıklayın

- Buton **Ekleniyor...** olur, işlem bitince tekrar **İlanı Getir** olur.
- **Başarı:** Yeşil toast: *"İlan sisteme eklendi. Detaylar kısa süre içinde güncellenecektir."*
- Form temizlenir; **İlanlar** sayfasına gidince yeni ilan listede görünür (başlık "İlan (yükleniyor)" olabilir).

### 7. Duplicate testi

- **Aynı Revy linkini** tekrar girin ve **İlanı Getir**e tıklayın.
- Sarı uyarı toast: *"Bu ilan zaten sistemde mevcut"* görünmeli, yeni kayıt oluşmamalı.

### 8. Geçersiz URL testi

- Örn. `https://google.com` veya `https://www.revy.com.tr/anasayfa` girin.
- Kırmızı hata toast: *"Geçerli bir Revy ilan detay linki giriniz (revy.com.tr/.../detay/...)"* görünmeli.

---

## Beklenen sonuçlar özeti

| Durum              | Toast / Sonuç |
|--------------------|----------------|
| Yeni ilan eklendi  | Yeşil: "İlan sisteme eklendi..." |
| Zaten var          | Sarı: "Bu ilan zaten sistemde mevcut" |
| Geçersiz URL       | Kırmızı: "Geçerli bir Revy ilan detay linki..." |
| Sunucu hatası      | Kırmızı: Supabase/network hata mesajı |

Eklenen ilanlar **İlanlar** listesinde hemen görünür. Başlık ve fotoğraflar, Playwright engine `manual_pending` kayıtları işledikçe güncellenir.
