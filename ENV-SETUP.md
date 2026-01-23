# Environment Variables Kurulumu

## Supabase URL ve Key Ayarlama

Proje root'unda `.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=https://akidlfqugftljfuhnjxn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Supabase Anon Key Nasıl Bulunur?

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenizi seçin
2. **Settings** → **API**
3. **Project URL**: `https://akidlfqugftljfuhnjxn.supabase.co` (zaten verili)
4. **anon / public** key'i kopyalayın → `.env` dosyasına yapıştırın

## Dosya Konumu

```
meltem-altintas-pro/
├── .env              ← Buraya oluşturun
├── package.json
└── src/
```

## Not

- `.env` dosyası `.gitignore`'da olduğu için git'e commit edilmez (güvenlik için)
- `.env` dosyasını manuel olarak oluşturmanız gerekiyor
- Vite, `VITE_` prefix'li değişkenleri otomatik yükler
