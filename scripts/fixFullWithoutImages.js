// scripts/fixFullWithoutImages.js
// Eski FULL ama image_urls boş olan ilanları PARTIAL'a düşür

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Environment variables
dotenv.config();

const SUPABASE_URL = "https://akidlfqugftljfuhnjxn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable bulunamadı!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixFullWithoutImages() {
  try {
    console.log('[FIX] FULL ama image_urls boş olan ilanlar kontrol ediliyor...');
    
    // FULL olarak işaretlenmiş ilanları getir
    const { data: fullListings, error: fetchError } = await supabase
      .from('listings')
      .select('id, listing_id, parse_status, cover_image_url, image_urls')
      .eq('parse_status', 'full');
    
    if (fetchError) {
      console.error('[FIX] ❌ Fetch hatası:', fetchError.message);
      return;
    }
    
    if (!fullListings || fullListings.length === 0) {
      console.log('[FIX] ✅ FULL ilan bulunamadı');
      return;
    }
    
    console.log(`[FIX] ${fullListings.length} FULL ilan bulundu, kontrol ediliyor...`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const listing of fullListings) {
      // image_urls kontrolü
      const hasImageUrls = listing.image_urls && Array.isArray(listing.image_urls);
      const imageUrlsLength = hasImageUrls ? listing.image_urls.length : 0;
      
      // Eğer image_urls NULL, boş veya < 3 ise PARTIAL'a düşür
      if (!hasImageUrls || imageUrlsLength < 3) {
        // cover_image_url de null yapılmalı (image_urls boşsa)
        const { error: updateError } = await supabase
          .from('listings')
          .update({
            parse_status: 'partial',
            cover_image_url: null // image_urls boşsa cover_image_url null
          })
          .eq('id', listing.id);
        
        if (updateError) {
          console.error(`[FIX] ❌ Güncelleme hatası (${listing.listing_id}):`, updateError.message);
        } else {
          console.log(`[FIX] ✅ Düzeltildi: ${listing.listing_id} → PARTIAL (image_urls: ${hasImageUrls ? imageUrlsLength : 'NULL'})`);
          fixedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`\n[FIX] ========================================`);
    console.log(`[FIX] Düzeltme tamamlandı:`);
    console.log(`[FIX]   - Düzeltilen: ${fixedCount}`);
    console.log(`[FIX]   - Atlandı (geçerli): ${skippedCount}`);
    console.log(`[FIX] ========================================\n`);
    
  } catch (e) {
    console.error('[FIX] ❌ Exception:', e.message);
    process.exit(1);
  }
}

// Script'i çalıştır
fixFullWithoutImages()
  .then(() => {
    console.log('[FIX] ✅ Script tamamlandı');
    process.exit(0);
  })
  .catch((e) => {
    console.error('[FIX] ❌ Script hatası:', e);
    process.exit(1);
  });
