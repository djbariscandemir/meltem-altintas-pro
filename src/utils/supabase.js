import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl || 'https://akidlfqugftljfuhnjxn.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFraWRsZnF1Z2Z0bGpmdWhuanhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjcwMDMsImV4cCI6MjA4NDI0NDAwM30.VpxOa_tAXu1uyVUV6b3F-PQnLpaGC9alsXMr2F0V05k'
)
