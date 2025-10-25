// lib/supabase/admin.ts (Admin operations with service role)
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'set' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: supabaseKey ? 'set' : 'missing'
    })
  }

  return createClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
