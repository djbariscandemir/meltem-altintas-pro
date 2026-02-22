# .env Dosyası Oluşturma Talimatları

## Adım 1: .env Dosyası Oluşturun

Proje root klasöründe (package.json'ın yanında) `.env` dosyası oluşturun.

## Adım 2: İçeriğini Ekleyin

`.env` dosyasına şu içeriği ekleyin:

```env
VITE_SUPABASE_URL=https://akidlfqugftljfuhnjxn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFraWRsZnF1Z2Z0bGpmdWhuanhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjcwMDMsImV4cCI6MjA4NDI0MzAwM30.VpxOa_tAXu1uyVUV6b3F-PQnLpaGC9alsVMr2F0V05k

# Manuel ilan parse + Revy otomatik login için
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REVY_PHONE=5xxxxxxxxx
REVY_PASSWORD=your-password
# Alternatif: REVY_EMAIL kullanılabilir (REVY_PHONE yoksa)
```

## Önemli Notlar

- `.env` dosyası `.gitignore`'da olduğu için git'e commit edilmez
- Bu dosyayı manuel olarak oluşturmanız gerekiyor
- Vite, `VITE_` prefix'li değişkenleri otomatik yükler
- `.env` dosyası oluşturduktan sonra uygulamayı yeniden başlatın (`npm run dev`)

## Dosya Yapısı

```
meltem-altintas-pro/
├── .env              ← Buraya oluşturun (manuel)
├── package.json
├── README-SUPABASE.md
└── src/
    └── utils/
        └── supabase.js
```

## Sonraki Adım

1. `.env` dosyasını oluşturun
2. İçeriği yukarıdaki gibi ekleyin
3. `npm run dev` ile uygulamayı başlatın
4. Supabase SQL migration'ı çalıştırın (`supabase-migration.sql`)
