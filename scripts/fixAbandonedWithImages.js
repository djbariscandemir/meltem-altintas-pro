// scripts/fixAbandonedWithImages.js
// Geriye dönük düzeltme: ABANDONED olarak işaretlenmiş ama fotoğrafı olan ilanları düzelt

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

async function fixAbandonedWithImages() {
  try {
    console.log('[FIX] ABANDONED ilanlar kontrol ediliyor...');
    
    // ABANDONED olarak işaretlenmiş ilanları getir
    const { data: abandonedListings, error: fetchError } = await supabase
      .from('listings')
      .select('id, listing_id, parse_status, parse_attempts, cover_image_url, image_urls')
      .eq('parse_status', 'abandoned');
    
    if (fetchError) {
      console.error('[FIX] ❌ Fetch hatası:', fetchError.message);
      return;
    }
    
    if (!abandonedListings || abandonedListings.length === 0) {
      console.log('[FIX] ✅ ABANDONED ilan bulunamadı');
      return;
    }
    
    console.log(`[FIX] ${abandonedListings.length} ABANDONED ilan bulundu, kontrol ediliyor...`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const listing of abandonedListings) {
      // Fotoğraf kontrolü
      const hasCoverImage = listing.cover_image_url && listing.cover_image_url.startsWith('http');
      const hasImageUrls = listing.image_urls && Array.isArray(listing.image_urls) && listing.image_urls.length > 0;
      const hasImages = hasCoverImage || hasImageUrls;
      
      if (hasImages) {
        // Fotoğraf var, FULL olarak işaretle
        const { error: updateError } = await supabase
          .from('listings')
          .update({
            parse_status: 'full',
            parse_attempts: 0,
            next_retry_at: null
          })
          .eq('id', listing.id);
        
        if (updateError) {
          console.error(`[FIX] ❌ Güncelleme hatası (${listing.listing_id}):`, updateError.message);
        } else {
          console.log(`[FIX] ✅ Düzeltildi: ${listing.listing_id} → FULL (${hasImageUrls ? listing.image_urls.length : 1} foto)`);
          fixedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`\n[FIX] ========================================`);
    console.log(`[FIX] Düzeltme tamamlandı:`);
    console.log(`[FIX]   - Düzeltilen: ${fixedCount}`);
    console.log(`[FIX]   - Atlandı (foto yok): ${skippedCount}`);
    console.log(`[FIX] ========================================\n`);
    
  } catch (e) {
    console.error('[FIX] ❌ Exception:', e.message);
    process.exit(1);
  }
}

// Script'i çalıştır
fixAbandonedWithImages()
  .then(() => {
    console.log('[FIX] ✅ Script tamamlandı');
    process.exit(0);
  })
  .catch((e) => {
    console.error('[FIX] ❌ Script hatası:', e);
    process.exit(1);
  });
