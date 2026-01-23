// Notes repository - Supabase 'notes' tablosu ile konuşmak
import { supabase } from '../utils/supabase'

// Tüm notları getir
export async function fetchAllNotes() {
  try {
    console.log('[notesRepository] fetchAllNotes başlatılıyor...')
    const { data, error } = await supabase
      .from('notes')
      .select('*, listings(id, title)')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[notesRepository] ❌ fetchAllNotes ERROR:', error)
      console.error('[notesRepository] Error code:', error.code)
      console.error('[notesRepository] Error message:', error.message)
      console.error('[notesRepository] Error details:', error.details)
      
      // Tablo bulunamadı hatası için özel log
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation "public.notes" does not exist')) {
        console.error('[notesRepository] ⚠️ Notes tablosu Supabase\'de bulunamadı!')
        console.error('[notesRepository] ⚠️ Lütfen supabase-create-notes-table.sql dosyasını Supabase SQL Editor\'de çalıştırın.')
      }
      
      return []
    }
    
    console.log(`[notesRepository] ✅ fetchAllNotes başarılı: ${data?.length || 0} not bulundu`)
    return data || []
  } catch (err) {
    console.error('[notesRepository] ❌ fetchAllNotes EXCEPTION:', err)
    console.error('[notesRepository] Exception stack:', err.stack)
    return []
  }
}

// Yeni not ekle
export async function insertNote(noteData) {
  try {
    console.log('[notesRepository] insertNote başlatılıyor...', {
      listing_id: noteData.listing_id,
      note_text_length: noteData.note_text?.length || 0,
      reminder_at: noteData.reminder_at || null
    })

    // Payload kontrolü
    if (!noteData.listing_id) {
      throw new Error('listing_id zorunlu')
    }
    if (!noteData.note_text || !noteData.note_text.trim()) {
      throw new Error('note_text zorunlu ve boş olamaz')
    }

    const payload = {
      listing_id: noteData.listing_id,
      note_text: noteData.note_text.trim(),
      reminder_at: noteData.reminder_at || null,
      is_completed: false
    }

    console.log('[notesRepository] Insert payload:', payload)

    const { data, error } = await supabase
      .from('notes')
      .insert(payload)
      .select('*, listings(id, title)')
      .single()
    
    if (error) {
      console.error('[notesRepository] ❌ insertNote ERROR:', error)
      console.error('[notesRepository] Error code:', error.code)
      console.error('[notesRepository] Error message:', error.message)
      console.error('[notesRepository] Error details:', error.details)
      console.error('[notesRepository] Error hint:', error.hint)
      
      // Tablo bulunamadı hatası için özel mesaj
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation "public.notes" does not exist')) {
        const friendlyError = new Error('Notes tablosu Supabase\'de bulunamadı. Lütfen supabase-create-notes-table.sql dosyasını Supabase SQL Editor\'de çalıştırın.')
        friendlyError.originalError = error
        throw friendlyError
      }
      
      throw error
    }
    
    console.log('[notesRepository] ✅ insertNote başarılı:', data?.id)
    return data
  } catch (err) {
    console.error('[notesRepository] ❌ insertNote EXCEPTION:', err)
    console.error('[notesRepository] Exception message:', err.message)
    console.error('[notesRepository] Exception stack:', err.stack)
    throw err
  }
}

// Not güncelle
export async function updateNote(noteId, updates) {
  try {
    console.log('[notesRepository] updateNote başlatılıyor...', { noteId, updates })
    
    // note_text varsa content yerine note_text kullan
    const updatePayload = { ...updates }
    if (updatePayload.content) {
      updatePayload.note_text = updatePayload.content
      delete updatePayload.content
    }

    const { data, error } = await supabase
      .from('notes')
      .update(updatePayload)
      .eq('id', noteId)
      .select('*, listings(id, title)')
      .single()
    
    if (error) {
      console.error('[notesRepository] ❌ updateNote ERROR:', error)
      console.error('[notesRepository] Error code:', error.code)
      console.error('[notesRepository] Error message:', error.message)
      throw error
    }
    
    console.log('[notesRepository] ✅ updateNote başarılı:', data?.id)
    return data
  } catch (err) {
    console.error('[notesRepository] ❌ updateNote EXCEPTION:', err)
    throw err
  }
}

// Not sil
export async function deleteNote(noteId) {
  try {
    console.log('[notesRepository] deleteNote başlatılıyor...', { noteId })
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    
    if (error) {
      console.error('[notesRepository] ❌ deleteNote ERROR:', error)
      console.error('[notesRepository] Error code:', error.code)
      console.error('[notesRepository] Error message:', error.message)
      throw error
    }
    
    console.log('[notesRepository] ✅ deleteNote başarılı')
  } catch (err) {
    console.error('[notesRepository] ❌ deleteNote EXCEPTION:', err)
    throw err
  }
}

// Listing'e ait notları getir
export async function fetchNotesByListingId(listingId) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })
    
    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[notesRepository] fetchNotesByListingId error:', error)
      }
      return []
    }
    
    return data || []
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[notesRepository] fetchNotesByListingId exception:', err)
    }
    return []
  }
}
