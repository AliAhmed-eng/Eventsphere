import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://kmqrkqtrwtgdbwrvczcm.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kdJUb2p_femFi8r1dJJHJg_-F1RZcd5'
)